// Kübra Nisa Bot Service - Typing Indicator + Realistic Delays
import KubraNisaAI from './kubraNisaAI';
import { getFirebaseDb } from './firebase';
import { collection, addDoc, query, onSnapshot, serverTimestamp, orderBy, doc, updateDoc, setDoc } from 'firebase/firestore';

class KubraNisaBotService {
    constructor(userId) {
        this.userId = userId;
        this.botUserId = 'kubra_nisa_ai_bot';
        this.ai = new KubraNisaAI();
        this.db = getFirebaseDb();
        this.listener = null;
        this.isProcessing = false;
    }

    start() {
        const chatId = [this.userId, this.botUserId].sort().join('_');
        const messagesRef = collection(this.db, `chats/${chatId}/messages`);
        const q = query(messagesRef, orderBy('timestamp', 'asc'));

        console.log('🤖 Kübra Nisa started, chatId:', chatId);

        this.listener = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const message = change.doc.data();

                    if (message.senderId === this.userId &&
                        message.receiverId === this.botUserId &&
                        !message.botProcessed &&
                        !this.isProcessing) {

                        console.log('✅ Mesaj alındı:', message.text);
                        this.handleUserMessage(message.text, chatId, change.doc.id);
                    }
                }
            });
        });

        console.log('✅ Bot dinlemede');
    }

    async handleUserMessage(userMessage, chatId, messageId) {
        if (this.isProcessing) return;
        this.isProcessing = true;

        try {
            console.log('🤖 Processing:', userMessage);

            // 1. Typing indicator göster
            await this.setTyping(chatId, true);

            // 2. Gerçekçi gecikme
            const delay = this.ai.calculateDelay();
            console.log(`⏱️ ${(delay / 1000).toFixed(1)}s delay`);

            await this.sleep(delay);

            // 3. Cevap üret
            const response = await this.ai.generateResponse(userMessage);

            // Cevap null ise (cevapsız bırakma) → hiçbir şey gönderme
            if (response === null || response === undefined) {
                console.log('🤐 Cevap verilmedi (bilinçli)');
                await this.setTyping(chatId, false);

                // İşlenmiş olarak işaretle
                await updateDoc(doc(this.db, `chats/${chatId}/messages`, messageId), {
                    botProcessed: true
                });

                this.isProcessing = false;
                return;
            }

            console.log('💬 Cevap:', response);

            // 4. Typing kapat
            await this.setTyping(chatId, false);

            // 5. Mesaj gönder
            await this.sendTextMessage(response, chatId);

            // 6. İşlenmiş olarak işaretle
            await updateDoc(doc(this.db, `chats/${chatId}/messages`, messageId), {
                botProcessed: true
            });

        } catch (error) {
            console.error('❌ Bot error:', error);
            await this.setTyping(chatId, false);
        } finally {
            this.isProcessing = false;
        }
    }

    // Typing indicator
    async setTyping(chatId, isTyping) {
        try {
            const typingRef = doc(this.db, `chats/${chatId}/typing`, this.botUserId);

            if (isTyping) {
                await setDoc(typingRef, {
                    isTyping: true,
                    timestamp: serverTimestamp()
                });
                console.log('⌨️ Yazıyor gösteriliyor...');
            } else {
                await setDoc(typingRef, {
                    isTyping: false,
                    timestamp: serverTimestamp()
                });
                console.log('⌨️ Yazıyor kapatıldı');
            }
        } catch (error) {
            console.error('Typing indicator error:', error);
        }
    }

    async sendTextMessage(text, chatId) {
        try {
            await addDoc(collection(this.db, `chats/${chatId}/messages`), {
                senderId: this.botUserId,
                receiverId: this.userId,
                text,
                type: 'text',
                timestamp: serverTimestamp(),
                sent: true,
                delivered: false,
                read: false
            });
            console.log('📤 Mesaj gönderildi');
        } catch (error) {
            console.error('Send error:', error);
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    scheduleRandomMessages() {
        // İlk mesaj 15 saniye sonra
        const chatId = [this.userId, this.botUserId].sort().join('_');
        setTimeout(() => {
            this.sendTextMessage('naber', chatId);
        }, 15000);
    }

    stop() {
        if (this.listener) {
            this.listener();
            console.log('🛑 Bot durduruldu');
        }
    }
}

export default KubraNisaBotService;
