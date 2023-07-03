// ChatItem
import { Item } from '@beyond-js/reactive/entities';
import { MessageProvider } from '@aimpact/chat-api/backend-provider';

interface IMessage {
	chatId: string;
	userId: string;
	content: string;
	role: string;
	timestamp: number;
}

export /*bundle*/ class Message extends Item<IMessage> {
	protected properties = ['id', 'chatId', 'userId', 'content', 'timestamp', 'role'];
	declare autoplay: boolean;
	constructor({ id = undefined } = {}) {
		super({ id, db: 'chat-api', storeName: 'Messages', provider: MessageProvider });
		//@ts-ignore
		this.reactiveProps(['autoplay']);
	}
}
