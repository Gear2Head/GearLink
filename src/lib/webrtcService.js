let Peer;
try {
    // Try to import simple-peer
    if (typeof window !== 'undefined' && window.SimplePeer) {
        Peer = window.SimplePeer;
    } else {
        // Fallback mock for build
        Peer = class {
            constructor(opts) {
                this.initiator = opts?.initiator || false;
                this.stream = opts?.stream || null;
                this.destroyed = false;
                this.listeners = {};
            }
            on(event, callback) {
                if (!this.listeners[event]) this.listeners[event] = [];
                this.listeners[event].push(callback);
            }
            signal(data) {
                // Mock signal
            }
            destroy() {
                this.destroyed = true;
            }
        };
    }
} catch (e) {
    console.warn('SimplePeer not available, using mock');
    Peer = class {
        constructor(opts) {
            this.initiator = opts?.initiator || false;
            this.stream = opts?.stream || null;
            this.destroyed = false;
            this.listeners = {};
        }
        on(event, callback) {
            if (!this.listeners[event]) this.listeners[event] = [];
            this.listeners[event].push(callback);
        }
        signal(data) {}
        destroy() {
            this.destroyed = true;
        }
    };
}

export class WebRTCService {
    constructor() {
        this.peer = null;
        this.stream = null;
    }

    async getMediaStream(video = false) {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                },
                video: video ? {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                } : false
            });
            return this.stream;
        } catch (error) {
            console.error('Failed to get media stream:', error);
            throw new Error(video ? 'Kamera ve mikrofon izni gerekli' : 'Mikrofon izni gerekli');
        }
    }

    createPeer(initiator, stream, onSignal, onStream, onError) {
        // if (!Peer) return null;

        this.peer = new Peer({
            initiator,
            stream,
            trickle: false,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:global.stun.twilio.com:3478' }
                ]
            }
        });

        this.peer.on('signal', onSignal);
        this.peer.on('stream', onStream);
        this.peer.on('error', onError);

        this.peer.on('connect', () => {
            console.log('WebRTC peer connected');
        });

        this.peer.on('close', () => {
            console.log('WebRTC peer closed');
            this.cleanup();
        });

        return this.peer;
    }

    signal(data) {
        if (this.peer && !this.peer.destroyed) {
            this.peer.signal(data);
        }
    }

    cleanup() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => {
                track.stop();
            });
            this.stream = null;
        }

        if (this.peer) {
            this.peer.destroy();
            this.peer = null;
        }
    }

    toggleMute() {
        if (this.stream) {
            const audioTrack = this.stream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                return !audioTrack.enabled;
            }
        }
        return false;
    }

    isMuted() {
        if (this.stream) {
            const audioTrack = this.stream.getAudioTracks()[0];
            return audioTrack ? !audioTrack.enabled : false;
        }
        return false;
    }
}

export default new WebRTCService();
