// Voice Recorder using Capacitor Native Plugin
import { VoiceRecorder } from 'capacitor-voice-recorder';
import { getFirebaseStorage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const requestMicrophonePermission = async () => {
    try {
        const result = await VoiceRecorder.requestAudioRecordingPermission();
        console.log('Microphone permission:', result);
        return result.value;
    } catch (error) {
        console.error('Mic permission error:', error);
        return false;
    }
};

export const startRecording = async () => {
    try {
        // Check permission first
        const hasPermission = await VoiceRecorder.hasAudioRecordingPermission();

        if (!hasPermission.value) {
            const granted = await requestMicrophonePermission();
            if (!granted) {
                throw new Error('Microphone permission denied');
            }
        }

        await VoiceRecorder.startRecording();
        console.log('🎤 Recording started');
        return true;
    } catch (error) {
        console.error('Start recording error:', error);
        return false;
    }
};

export const stopRecording = async () => {
    try {
        const result = await VoiceRecorder.stopRecording();
        console.log('🎤 Recording stopped');

        if (result.value && result.value.recordDataBase64) {
            return {
                base64: result.value.recordDataBase64,
                mimeType: result.value.mimeType || 'audio/aac',
                duration: result.value.msDuration || 0
            };
        }

        return null;
    } catch (error) {
        console.error('Stop recording error:', error);
        return null;
    }
};

export const uploadVoiceMessage = async (audioData, userId) => {
    try {
        const storage = getFirebaseStorage();
        const filename = `voice-messages/${userId}/${Date.now()}.aac`;
        const storageRef = ref(storage, filename);

        // Convert base64 to blob
        const blob = base64ToBlob(audioData.base64, audioData.mimeType);

        // Upload
        await uploadBytes(storageRef, blob);
        const url = await getDownloadURL(storageRef);

        console.log('✅ Voice message uploaded:', url);
        return url;
    } catch (error) {
        console.error('Voice upload error:', error);
        throw error;
    }
};

// Helper: Base64 to Blob
function base64ToBlob(base64, mimeType) {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
}

export default {
    requestMicrophonePermission,
    startRecording,
    stopRecording,
    uploadVoiceMessage
};
