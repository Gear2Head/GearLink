// Kübra Nisa AI - Gerçekçi İnsan Konuşması (Instagram DM Stili)
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY';
const genAI = new GoogleGenerativeAI(API_KEY);

// Kişilik - Screenshot'lardan öğrenildi
const PERSONALITY = `
Sen Kübra Nisa'sın - gerçek bir genç kız, Instagram'da konuşuyorsun.

YAZIM TARZI (ÇOK ÖNEMLİ):
- LOWERCASE yaz (çoğunlukla küçük harf): "günaydın", "tamam", "ne yapıyorsun"
- Yazım HATALARI yap: "tişkürler", "bişey", "düşnüyorum", "olmıcak", "anyorum", "hissettirecekasin"
- Noktalama ihmal et - çok az kullan
- Bazen CAPSLOCK tek kelime: "NE", "YA", "TAMAM"

KONUŞMA DİLİ:
- "ya", "valla", "yani", "işte", "şey", "hani", "bi" kullan
- Samimi ifadeler: "alpış", "canım", "şapsal", "Yiaaaa"
- Kısa cümleler: "ne gibi", "bir şeyler", "belli ki çok"
- Sinirlenince random tuşlar: "asdjaskdj", "Moedj8ojfmdpc"
- Çok bazen "hahahah", "hahaha" (ama nadir)

GERÇEK ÖRNEKLER (Aynen böyle yaz):
✅ "hoş geldin"
✅ "iyi gibiyim bir sıkıntı yok"
✅ "kızlar geldi yatıya"
✅ "dikkat et kendine"
✅ "tişkürler"
✅ "günaydın alpış"
✅ "bu gün sen erkenlisin"
✅ "ne gibi"
✅ "bir şeyler"
✅ "Yiaaaa şapsal"
✅ "neyse ben kaçıyorum ted ile kız anyorum"
✅ "belli ki çok"
✅ "hahahah"
✅ "çocuk adam senden de büyü gel"
✅ "bye"

❌ YAPMA:
- Çok düzgün yazma
- Uzun cümleler kurma
- Noktalama işaretleri koyma (çok nadir)
- "Bi dakka", "dur bakim" (çok yapay)
- Emoji (NADIRRRR)
- Selamlaşma tekrarı

DAVRANIŞLAR:
- Bazen cevap verme (%15)
- Çok kısa cevaplar: "ne", "tamam", "iyi", "bye"
- Samimi ol ama bazen sinirli/kırgın
- Lowercase ve hatalarla yaz MUTLAKA
`;

class KubraNisaAI {
    constructor() {
        this.model = genAI.getGenerativeModel({
            model: 'gemini-pro',
            generationConfig: {
                temperature: 0.98, // Daha yaratıcı
                topP: 0.9,
                maxOutputTokens: 100, // Kısa tut
            }
        });
        this.conversationHistory = [];
    }

    // Gerçekçi gecikme
    calculateDelay() {
        const random = Math.random();
        if (random < 0.1) return Math.random() * 60000 + 60000; // 1-2 dakika
        if (random < 0.3) return Math.random() * 20000 + 20000; // 20-40 sn
        return Math.random() * 10000 + 5000; // 5-15 sn
    }

    // Anlamsız mesaj kontrolü
    isNonsense(message) {
        const nonsensePatterns = [
            /^[^a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/,
            /(.)\1{5,}/,
            /^[0-9]{10,}$/,
            /random|test|qwert|asdf|zxcv/i
        ];
        return nonsensePatterns.some(pattern => pattern.test(message)) || message.length < 2;
    }

    // Yazım hatası ekle (Kübra tarzı)
    addTypos(text) {
        const typos = {
            'teşekkür': 'tişkür',
            'düşünüyorum': 'düşnüyorum',
            'hissettir': 'hissettir',
            'anıyorum': 'anyorum',
            'bir şey': 'bişey',
            'olmayacak': 'olmıcak',
            'gelecek': 'gelcek',
            'olacak': 'olcak'
        };

        let result = text;
        for (const [correct, typo] of Object.entries(typos)) {
            if (Math.random() < 0.3) { // %30 olasılıkla hata
                result = result.replace(new RegExp(correct, 'gi'), typo);
            }
        }

        // Lowercase yap (çoğunlukla)
        if (Math.random() < 0.85) {
            result = result.toLowerCase();
        }

        return result;
    }

    // Cevap üret
    async generateResponse(userMessage) {
        try {
            if (this.isNonsense(userMessage)) {
                const reactions = [null, "ne", "??", "anlamadım", "ne diyorsun"];
                return reactions[Math.floor(Math.random() * reactions.length)];
            }

            this.conversationHistory.push({ role: 'user', content: userMessage });

            // %15 cevap verme
            if (Math.random() < 0.15) {
                console.log('🤐 Cevap verilmiyor');
                return null;
            }

            const prompt = `
${PERSONALITY}

Son mesajlar:
${this.conversationHistory.slice(-3).map(msg =>
                `${msg.role === 'user' ? 'O' : 'Sen'}: ${msg.content}`
            ).join('\n')}

Yeni: "${userMessage}"

Kübra olarak KISA (1-2 satır), LOWERCASE ve YAZIM HATALI cevap ver. Noktalama KULLANMA.
`;

            const result = await this.model.generateContent(prompt);
            let response = result.response.text().trim();

            // Yazım hatası ekle
            response = this.addTypos(response);

            // Noktalama temizle
            response = response.replace(/[.,!?;]/g, '');

            this.conversationHistory.push({ role: 'assistant', content: response });

            if (this.conversationHistory.length > 6) {
                this.conversationHistory = this.conversationHistory.slice(-6);
            }

            return response;
        } catch (error) {
            console.error('AI Error:', error);
            const fallbacks = [null, "şimdi konuşamam", "sonra", "tmm"];
            return fallbacks[Math.floor(Math.random() * fallbacks.length)];
        }
    }

    generateSpontaneousMessage() {
        const messages = ['naber', 'ne yapıyorsun', 'sıkıldım', 'ya'];
        return messages[Math.floor(Math.random() * messages.length)];
    }
}

export default KubraNisaAI;
