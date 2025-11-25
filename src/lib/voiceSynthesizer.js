// Text-to-Speech service for Kübra Nisa's voice messages
// Using Google Cloud Text-to-Speech API

class VoiceSynthesizer {
    constructor() {
        // Google Cloud TTS API endpoint (sunucu tarafında çalışacak)
        this.apiEndpoint = '/api/text-to-speech';
    }

    // Metni ses dosyasına çevir (kadın sesi, Türkçe, doğal ton)
    async synthesize(text) {
        try {
            // Google Cloud TTS için config
            const request = {
                input: { text },
                voice: {
                    languageCode: 'tr-TR',
                    name: 'tr-TR-Wavenet-E', // Kadın sesi, doğal
                    ssmlGender: 'FEMALE'
                },
                audioConfig: {
                    audioEncoding: 'MP3',
                    pitch: 0.0, // Normal pitch
                    speakingRate: 1.0, // Normal hız
                    effectsProfileId: ['handset-class-device'] // Telefon kalitesi
                }
            };

            // API çağrısı (backend'den)
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(request)
            });

            if (!response.ok) {
                throw new Error('TTS API failed');
            }

            const data = await response.json();

            // Base64 audio data
            return {
                audioContent: data.audioContent,
                duration: this.estimateDuration(text)
            };

        } catch (error) {
            console.error('Voice synthesis error:', error);
            return null;
        }
    }

    // Alternatif: Web Speech API (tarayıcı built-in, ücretsiz)
    async synthesizeWithWebAPI(text) {
        return new Promise((resolve) => {
            if (!('speechSynthesis' in window)) {
                resolve(null);
                return;
            }

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'tr-TR';
            utterance.rate = 1.0; // Normal hız
            utterance.pitch = 1.1; // Biraz daha yüksek (kadın sesi)

            // Türkçe kadın sesini bul
            const voices = speechSynthesis.getVoices();
            const turkishVoice = voices.find(voice =>
                voice.lang.startsWith('tr') && voice.name.includes('Female')
            );

            if (turkishVoice) {
                utterance.voice = turkishVoice;
            }

            // Kaydedici (MediaRecorder ile)
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const dest = audioContext.createMediaStreamDestination();
            const mediaRecorder = new MediaRecorder(dest.stream);
            const chunks = [];

            mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                resolve({
                    audioBlob: blob,
                    duration: this.estimateDuration(text)
                });
            };

            utterance.onstart = () => mediaRecorder.start();
            utterance.onend = () => mediaRecorder.stop();

            speechSynthesis.speak(utterance);
        });
    }

    // Süre tahmini (ortalama konuşma hızına göre)
    estimateDuration(text) {
        // Ortalama 150 kelime/dakika
        const words = text.split(' ').length;
        const minutes = words / 150;
        return Math.ceil(minutes * 60); // saniye
    }

    // Ses dosyasını Firebase Storage'a yükle
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
