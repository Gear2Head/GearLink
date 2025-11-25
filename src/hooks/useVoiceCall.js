import { useState, useEffect, useRef, useCallback } from 'react';
import webrtcService from '../lib/webrtcService';
import {
    initiateCall,
    sendOffer,
    sendAnswer,
    listenToCall,
    listenForIncomingCalls,
    updateCallStatus,
    endCall as firestoreEndCall,
    getUserInfo
} from '../lib/callSignaling';

export const useVoiceCall = (db, currentUser) => {
    const [callState, setCallState] = useState('idle'); // idle, calling, ringing, active, ended
    const [currentCall, setCurrentCall] = useState(null);
    const [remoteUser, setRemoteUser] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoEnabled, setIsVideoEnabled] = useState(false);
    const [connectionState, setConnectionState] = useState('disconnected');
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);

    // Refs to keep track of latest state in callbacks
    const currentCallRef = useRef(null);
    const audioRef = useRef(new Audio());

    // Update ref when state changes
    useEffect(() => {
        currentCallRef.current = currentCall;
    }, [currentCall]);

    // Listen for incoming calls
    useEffect(() => {
        if (!currentUser || !db) return;

        const unsubscribe = listenForIncomingCalls(db, currentUser.uid, async (callData) => {
            // Only accept if we are idle
            if (callState === 'idle') {
                const callerInfo = await getUserInfo(db, callData.caller);
                setRemoteUser(callerInfo);
                setCurrentCall(callData);
                setCallState('ringing');
            }
        });

        return () => unsubscribe();
    }, [currentUser, db, callState]);

    const startCall = useCallback(async (receiverId, withVideo = false) => {
        if (!currentUser || !db) return;

        try {
            setCallState('calling');
            setIsVideoEnabled(withVideo);

            // Get receiver info
            const receiverInfo = await getUserInfo(db, receiverId);
            setRemoteUser(receiverInfo);

            // Get local stream
            const stream = await webrtcService.getMediaStream(withVideo);
            setLocalStream(stream);

            // Initiate call in Firestore
            const callId = await initiateCall(db, currentUser.uid, receiverId, withVideo);
            setCurrentCall({ id: callId, receiver: receiverId, isVideo: withVideo });

            // Create peer
            const peer = webrtcService.createPeer(
                true,
                stream,
                async (offer) => {
                    await sendOffer(db, callId, offer);
                },
                (remoteStream) => {
                    if (audioRef.current) {
                        audioRef.current.srcObject = remoteStream;
                        audioRef.current.play().catch(e => console.error("Audio play error:", e));
                    }
                    setConnectionState('connected');
                },
                (err) => {
                    console.error('Peer error:', err);
                    endCall();
                }
            );

            // Listen for answer
            const unsubscribe = listenToCall(db, callId, (data) => {
                if (data?.status === 'ended') {
                    endCall();
                } else if (data?.answer && !peer.destroyed) {
                    webrtcService.signal(data.answer);
                    setCallState('active');
                }
            });

            // Cleanup listener when call ends
            return () => unsubscribe();

        } catch (error) {
            console.error('Error starting call:', error);
            setCallState('idle');
            alert('Arama başlatılamadı: ' + error.message);
        }
    }, [currentUser, db]);

    const acceptCall = useCallback(async (withVideo = false) => {
        if (!currentCall || !db) return;

        try {
            setIsVideoEnabled(withVideo || currentCall.isVideo);
            const stream = await webrtcService.getMediaStream(withVideo || currentCall.isVideo);
            setLocalStream(stream);

            const peer = webrtcService.createPeer(
                false,
                stream,
                async (answer) => {
                    await sendAnswer(db, currentCall.id, answer);
                },
                (remoteStream) => {
                    if (audioRef.current) {
                        audioRef.current.srcObject = remoteStream;
                        audioRef.current.play().catch(e => console.error("Audio play error:", e));
                    }
                    setConnectionState('connected');
                },
                (err) => {
                    console.error('Peer error:', err);
                    endCall();
                }
            );

            webrtcService.signal(currentCall.offer);
            setCallState('active');

            // Listen for call end
            const unsubscribe = listenToCall(db, currentCall.id, (data) => {
                if (data?.status === 'ended') {
                    endCall();
                }
            });

        } catch (error) {
            console.error('Error accepting call:', error);
            endCall();
        }
    }, [currentCall, db]);

    const rejectCall = useCallback(async () => {
        if (!currentCall || !db) return;

        await updateCallStatus(db, currentCall.id, 'rejected');
        await firestoreEndCall(db, currentCall.id);
        setCallState('idle');
        setCurrentCall(null);
        setRemoteUser(null);
    }, [currentCall, db]);

    const endCall = useCallback(async () => {
        webrtcService.cleanup();

        if (currentCallRef.current && db) {
            await firestoreEndCall(db, currentCallRef.current.id);
        }

        if (audioRef.current) {
            audioRef.current.srcObject = null;
        }

        setCallState('idle');
        setCurrentCall(null);
        setRemoteUser(null);
        setConnectionState('disconnected');
        setIsMuted(false);
        setIsVideoEnabled(false);
        setLocalStream(null);
        setRemoteStream(null);
    }, [db]);

    const toggleVideo = useCallback(() => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoEnabled(videoTrack.enabled);
            }
        }
    }, [localStream]);

    const toggleMute = useCallback(() => {
        const muted = webrtcService.toggleMute();
        setIsMuted(muted);
    }, []);

    return {
        callState,
        currentCall,
        remoteUser,
        isMuted,
        isVideoEnabled,
        connectionState,
        localStream,
        remoteStream,
        startCall,
        acceptCall,
        rejectCall,
        endCall,
        toggleMute,
        toggleVideo
    };
};
