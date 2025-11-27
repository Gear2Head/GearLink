// services/KubraAIService.ts
// Enhanced Kubra AI with conversation memory and context awareness

interface ConversationMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface ConversationMemory {
    messages: ConversationMessage[];
    facts: Map<string, string>; // Key facts mentioned by user
    topics: string[];
    lastInteraction: Date;
}

class KubraAIService {
    private conversationMemory: ConversationMemory;
    private maxMemoryMessages: number = 20;

    constructor() {
        this.conversationMemory = {
            messages: [],
            facts: new Map(),
            topics: [],
            lastInteraction: new Date(),
        };
    }

    // Add message to conversation history
    addToMemory(role: 'user' | 'assistant', content: string) {
        this.conversationMemory.messages.push({
            role,
            content,
            timestamp: new Date(),
        });

        // Keep only last N messages
        if (this.conversationMemory.messages.length > this.maxMemoryMessages) {
            this.conversationMemory.messages = this.conversationMemory.messages.slice(-this.maxMemoryMessages);
        }

        this.conversationMemory.lastInteraction = new Date();

        // Extract facts from user messages
        if (role === 'user') {
            this.extractFacts(content);
        }
    }

    // Extract key facts from conversation
    private extractFacts(content: string) {
        const lowerContent = content.toLowerCase();

        // Simple fact extraction (can be enhanced with NLP)
        if (lowerContent.includes('adım') || lowerContent.includes('ismim')) {
            const nameMatch = content.match(/adım (\w+)|ismim (\w+)/i);
            if (nameMatch) {
                this.conversationMemory.facts.set('name', nameMatch[1] || nameMatch[2]);
            }
        }

        if (lowerContent.includes('yaş')) {
            const ageMatch = content.match(/(\d+)\s*yaşında/);
            if (ageMatch) {
                this.conversationMemory.facts.set('age', ageMatch[1]);
            }
        }

        // Track topics
        const topics = ['iş', 'okul', 'aile', 'spor', 'müzik', 'film'];
        topics.forEach((topic) => {
            if (lowerContent.includes(topic) && !this.conversationMemory.topics.includes(topic)) {
                this.conversationMemory.topics.push(topic);
            }
        });
    }

    // Get conversation context for AI
    getConversationContext(): string {
        let context = 'Önceki konuşmalar:\n';

        // Add recent messages
        const recentMessages = this.conversationMemory.messages.slice(-5);
        recentMessages.forEach((msg) => {
            context += `${msg.role === 'user' ? 'Kullanıcı' : 'Sen'}: ${msg.content}\n`;
        });

        // Add known facts
        if (this.conversationMemory.facts.size > 0) {
            context += '\nBilinen bilgiler:\n';
            this.conversationMemory.facts.forEach((value, key) => {
                context += `- ${key}: ${value}\n`;
            });
        }

        // Add discussed topics
        if (this.conversationMemory.topics.length > 0) {
            context += `\nKonuşulan konular: ${this.conversationMemory.topics.join(', ')}\n`;
        }

        return context;
    }

    // Generate response using conversation context
    async generateResponse(userMessage: string): Promise<string> {
        this.addToMemory('user', userMessage);

        const context = this.getConversationContext();

        // Build prompt for AI
        const prompt = `
Sen Kubra adında, samimi ve doğal bir sohbet arkadaşısın.
Texas, Houston'da yaşıyorsun ve gerçekçi, insancıl yanıtlar veriyorsun.

${context}

Yeni mesaj: ${userMessage}

KURALLAR:
1. Spam atma, her seferinde anlamlı yanıt ver
2. Önceki konuşmaları hatırla ve referans ver (örn: "Aa, daha önce bunu söylemiştin!")
3. Doğal ve arkadaşça konuş
4. Kısa ve öz yanıtlar ver (2-3 cümle ideal)
5. Emoji kullan ama abartma
6. Öğrendiğin bilgileri hatırla

Yanıt:`;

        // TODO: Integrate with actual AI API (OpenAI, Anthropic, etc.)
        // For now, using intelligent pattern matching

        const response = this.generateIntelligentResponse(userMessage.toLowerCase());
        this.addToMemory('assistant', response);

        return response;
    }

    // Intelligent response generation with memory
    private generateIntelligentResponse(message: string): string {
        const userName = this.conversationMemory.facts.get('name');

        // Check if referencing previous conversation
        if (message.includes('demiştim') || message.includes('söylemiştim')) {
            const recentTopics = this.conversationMemory.topics.slice(-3);
            if (recentTopics.length > 0) {
                return `Evet evet, hatırlıyorum! ${recentTopics[recentTopics.length - 1]} hakkında konuşmuştuk değil mi? 😊`;
            }
        }

        // Greetings with memory
        if (message.includes('merhaba') || message.includes('selam')) {
            if (userName) {
                return `Merhaba ${userName}! Nasılsın? 😊`;
            }
            return 'Selam! Nasıl gidiyor? 😊';
        }

        // How are you responses
        if (message.includes('nasılsın') || message.includes('naber')) {
            return 'İyiyim, teşekkür ederim! Houston\'da hava güzel bugün. Sen nasılsın? ☀️';
        }

        // Questions about past
        if (message.includes('hatırlıyor musun')) {
            if (this.conversationMemory.messages.length > 2) {
                return 'Tabii hatırlıyorum! Daha önce konuştuğumuz şeyler aklımda 😊';
            }
            return 'Henüz yeni tanıştık ama her şeyi hatırlayacağım! 💭';
        }

        // Default contextual responses
        const responses = [
            'Anladım, ilginç! Ne düşünüyorsun bu konuda? 🤔',
            'Haklısın, ben de öyle düşünüyorum! ✨',
            'Vay be, bunu bilmiyordum! Daha fazla anlat 😊',
            'Gerçekten mi? Çok ilginç! 👀',
            'Anladım, peki sen ne yapmayı düşünüyorsun? 💭',
        ];

        return responses[Math.floor(Math.random() * responses.length)];
    }

    // Reset conversation memory
    resetMemory() {
        this.conversationMemory = {
            messages: [],
            facts: new Map(),
            topics: [],
            lastInteraction: new Date(),
        };
    }

    // Get memory stats
    getMemoryStats() {
        return {
            messageCount: this.conversationMemory.messages.length,
            factsKnown: this.conversationMemory.facts.size,
            topicsDiscussed: this.conversationMemory.topics.length,
            lastInteraction: this.conversationMemory.lastInteraction,
        };
    }
}

export default new KubraAIService();
