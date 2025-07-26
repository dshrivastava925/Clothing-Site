type ChatMessage = {
    id: string;
    user: string;
    content: string;
    timestamp: Date;
};

class ChatStore {
    private messages: ChatMessage[] = [];

    addMessage(message: ChatMessage): void {
        this.messages.push(message);
    }

    getMessages(): ChatMessage[] {
        return [...this.messages];
    }

    clearMessages(): void {
        this.messages = [];
    }
}

export const chatStore = new ChatStore();
