// components/calling/CallScreen.tsx
// Video and voice calling interface

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Dimensions,
} from 'react-native';
import { COLORS } from '../../constants/config';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CallScreenProps {
    navigation: any;
    route: {
        params: {
            contactName: string;
            contactPhoto?: string;
            isVideoCall: boolean;
            isIncoming?: boolean;
        };
    };
}

export const CallScreen: React.FC<CallScreenProps> = ({ navigation, route }) => {
    const { contactName, contactPhoto, isVideoCall, isIncoming = false } = route.params;

    const [callDuration, setCallDuration] = useState(0);
    const [isCallActive, setIsCallActive] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isSpeakerOn, setIsSpeakerOn] = useState(false);
    const [isVideoOn, setIsVideoOn] = useState(isVideoCall);
    const [isFrontCamera, setIsFrontCamera] = useState(true);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isCallActive) {
            interval = setInterval(() => {
                setCallDuration((prev) => prev + 1);
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isCallActive]);

    const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAcceptCall = () => {
        setIsCallActive(true);
        // TODO: Initialize WebRTC connection
    };

    const handleRejectCall = () => {
        navigation.goBack();
        // TODO: Send reject signal
    };

    const handleEndCall = () => {
        navigation.goBack();
        // TODO: End WebRTC connection
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
        // TODO: Mute/unmute audio
    };

    const toggleSpeaker = () => {
        setIsSpeakerOn(!isSpeakerOn);
        // TODO: Toggle speaker
    };

    const toggleVideo = () => {
        setIsVideoOn(!isVideoOn);
        // TODO: Toggle video stream
    };

    const switchCamera = () => {
        setIsFrontCamera(!isFrontCamera);
        // TODO: Switch camera
    };

    return (
        <View style={styles.container}>
            {/* Video view (if video call) */}
            {isVideoCall && isVideoOn ? (
                <View style={styles.videoContainer}>
                    {/* Remote video (full screen) */}
                    <View style={styles.remoteVideo}>
                        <Text style={styles.videoPlaceholder}>Video Görüntüsü</Text>
                    </View>

                    {/* Local video (small preview) */}
                    <View style={styles.localVideo}>
                        <Text style={styles.localVideoText}>Sen</Text>
                    </View>
                </View>
            ) : (
                /* Audio call view */
                <View style={styles.audioCallContainer}>
                    {contactPhoto ? (
                        <Image source={{ uri: contactPhoto }} style={styles.contactPhoto} />
                    ) : (
                        <View style={styles.contactPhotoPlaceholder}>
                            <Icon name="account" size={100} color="#FFFFFF" />
                        </View>
                    )}

                    <Text style={styles.contactName}>{contactName}</Text>

                    <Text style={styles.callStatus}>
                        {!isCallActive && isIncoming && 'Aranıyor...'}
                        {!isCallActive && !isIncoming && 'Çağrı yapılıyor...'}
                        {isCallActive && formatDuration(callDuration)}
                    </Text>
                </View>
            )}

            {/* Controls */}
            <View style={styles.controlsContainer}>
                {/* Incoming call buttons */}
                {isIncoming && !isCallActive ? (
                    <View style={styles.incomingControls}>
                        <TouchableOpacity
                            style={[styles.controlButton, styles.rejectButton]}
                            onPress={handleRejectCall}
                        >
                            <Icon name="phone-hangup" size={32} color="#FFFFFF" />
                            <Text style={styles.controlLabel}>Reddet</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.controlButton, styles.acceptButton]}
                            onPress={handleAcceptCall}
                        >
                            <Icon name="phone" size={32} color="#FFFFFF" />
                            <Text style={styles.controlLabel}>
                                {isVideoCall ? 'Görüntülü Katıl' : 'Yanıtla'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    /* Active call controls */
                    <View style={styles.activeControls}>
                        <View style={styles.controlRow}>
                            <TouchableOpacity
                                style={[styles.smallControlButton, isMuted && styles.activeControl]}
                                onPress={toggleMute}
                            >
                                <Icon
                                    name={isMuted ? 'microphone-off' : 'microphone'}
                                    size={28}
                                    color="#FFFFFF"
                                />
                                <Text style={styles.smallControlLabel}>
                                    {isMuted ? 'Kapalı' : 'Mikrofon'}
                                </Text>
                            </TouchableOpacity>

                            {isVideoCall && (
                                <TouchableOpacity
                                    style={[styles.smallControlButton, !isVideoOn && styles.activeControl]}
                                    onPress={toggleVideo}
                                >
                                    <Icon
                                        name={isVideoOn ? 'video' : 'video-off'}
                                        size={28}
                                        color="#FFFFFF"
                                    />
                                    <Text style={styles.smallControlLabel}>
                                        {isVideoOn ? 'Kamera' : 'Kapalı'}
                                    </Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity
                                style={[styles.smallControlButton, isSpeakerOn && styles.activeControl]}
                                onPress={toggleSpeaker}
                            >
                                <Icon
                                    name={isSpeakerOn ? 'volume-high' : 'volume-medium'}
                                    size={28}
                                    color="#FFFFFF"
                                />
                                <Text style={styles.smallControlLabel}>
                                    {isSpeakerOn ? 'Hoparlör' : 'Ses'}
                                </Text>
                            </TouchableOpacity>

                            {isVideoCall && (
                                <TouchableOpacity
                                    style={styles.smallControlButton}
                                    onPress={switchCamera}
                                >
                                    <Icon name="camera-flip" size={28} color="#FFFFFF" />
                                    <Text style={styles.smallControlLabel}>Çevir</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* End call button */}
                        <TouchableOpacity
                            style={[styles.controlButton, styles.endCallButton]}
                            onPress={handleEndCall}
                        >
                            <Icon name="phone-hangup" size={32} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.primaryDark,
    },
    videoContainer: {
        flex: 1,
    },
    remoteVideo: {
        flex: 1,
        backgroundColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoPlaceholder: {
        color: '#FFFFFF',
        fontSize: 16,
    },
    localVideo: {
        position: 'absolute',
        top: 40,
        right: 20,
        width: 100,
        height: 150,
        backgroundColor: '#333333',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    localVideoText: {
        color: '#FFFFFF',
        fontSize: 12,
    },
    audioCallContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    contactPhoto: {
        width: 150,
        height: 150,
        borderRadius: 75,
        marginBottom: 30,
    },
    contactPhotoPlaceholder: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
    },
    contactName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 12,
    },
    callStatus: {
        fontSize: 18,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    controlsContainer: {
        paddingBottom: 50,
    },
    incomingControls: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 40,
    },
    activeControls: {
        alignItems: 'center',
    },
    controlRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        marginBottom: 30,
    },
    controlButton: {
        alignItems: 'center',
    },
    rejectButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#FF3B30',
        justifyContent: 'center',
        alignItems: 'center',
    },
    acceptButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: COLORS.accent,
        justifyContent: 'center',
        alignItems: 'center',
    },
    endCallButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#FF3B30',
        justifyContent: 'center',
        alignItems: 'center',
    },
    smallControlButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeControl: {
        backgroundColor: COLORS.primary,
    },
    controlLabel: {
        color: '#FFFFFF',
        fontSize: 14,
        marginTop: 8,
    },
    smallControlLabel: {
        color: '#FFFFFF',
        fontSize: 11,
        marginTop: 4,
    },
});
