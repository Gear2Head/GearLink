import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ChatState {
    conversations: any[];
    activeConversationId: string | null;
    messages: Record<string, any[]>;
}

const initialState: ChatState = {
    conversations: [],
    activeConversationId: null,
    messages: {},
};

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        setConversations: (state, action: PayloadAction<any[]>) => {
            state.conversations = action.payload;
        },
        setActiveConversation: (state, action: PayloadAction<string | null>) => {
            state.activeConversationId = action.payload;
        },
        addMessage: (state, action: PayloadAction<{ conversationId: string; message: any }>) => {
            const { conversationId, message } = action.payload;
            if (!state.messages[conversationId]) {
                state.messages[conversationId] = [];
            }
            state.messages[conversationId].push(message);
        },
    },
});

export const { setConversations, setActiveConversation, addMessage } = chatSlice.actions;
export default chatSlice.reducer;
