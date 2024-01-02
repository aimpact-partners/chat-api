export /*bundle*/ interface IMessageData {
	id: string;
	role: 'system' | 'user' | 'assistant' | 'function';
	content: string;
	chatId: string;
	chat: { id: string };
	timestamp: number;
}
