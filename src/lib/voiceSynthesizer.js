import { getFirebaseStorage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

class VoiceSynthesizer {
    constructor() {
        // API endpoint for text-to-speech (optional backend integration)
        this.apiEndpoint = '/api/text-to-speech';
    }

    // Optional: synthesize text using backend TTS service
    async synthesize(text) {
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });
            if (!response.ok) throw new Error('TTS API failed');
            const data = await response.json();
            return {
                audioContent: data.audioContent,
                duration: this.estimateDuration(text)
            };
        } catch (error) {
            console.error('Voice synthesis error:', error);
            return null;
        }
    }

    // Estimate duration based on average speaking speed (150 wpm)
    estimateDuration(text) {
        const words = text.split(' ').length;
        const minutes = words / 150;
        return Math.ceil(minutes * 60);
    }

    // Upload voice message blob to Firebase Storage and return download URL
    async uploadToStorage(audioBlob, userId) {
        const storage = getFirebaseStorage();
        const filename = `voice-messages/${userId}/${Date.now()}.webm`;
        const storageRef = ref(storage, filename);
        await uploadBytes(storageRef, audioBlob);
        const url = await getDownloadURL(storageRef);
        return url;
    }
}

export default VoiceSynthesizer;
