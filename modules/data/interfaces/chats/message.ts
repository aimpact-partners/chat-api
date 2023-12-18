export /*bundle*/ interface IMessage {
	id: string;
	role: 'system' | 'user' | 'assistant' | 'function';
	content: string;
	chatId: string;
	timestamp: number;
}
