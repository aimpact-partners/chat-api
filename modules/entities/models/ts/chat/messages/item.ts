// ChatItem
import {Item} from '@beyond-js/reactive-2/entities';
import {MessageProvider} from '@aimpact/chat-api/backend-provider';

interface IMessage {
	chatId: string;
	userId: string;
	text: string;
	timestamp: number;
}

export /*bundle*/ class Message extends Item<IMessage> {
	protected properties = ['id', 'chatId', 'userId', 'text', 'timestamp'];

	constructor({id = undefined} = {}) {
		super({id, db: 'chat-api', storeName: 'Messages', provider: MessageProvider});
	}
}
