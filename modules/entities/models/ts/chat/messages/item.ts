// ChatItem
import { Item } from '@beyond-js/reactive/entities';
import { MessageProvider } from '@aimpact/chat-api/backend-provider';

interface IMessage {
	chatId: string;
	userId: string;
	content: string;
	role: string;
	timestamp: number;
	usage: {
		completionTokens: number;
		promptTokens: number;
		totalTokens: number;
	};
}

export /*bundle*/ class Message extends Item<IMessage> {
	protected properties = ['id', 'chatId', 'userId', 'role', 'content', 'usage', 'timestamp'];
	declare autoplay: boolean;
	declare id: string;
	declare triggerEvent: () => void;
	declare publish: (any) => Promise<any>;
	constructor({ id = undefined } = {}) {
		super({ id, db: 'chat-api', storeName: 'Messages', provider: MessageProvider });
		//@ts-ignore
		this.reactiveProps(['autoplay']);
	}
}
