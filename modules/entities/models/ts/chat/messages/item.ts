// ChatItem
import {Item} from '@beyond-js/reactive-2/entities';
import {MessageProvider} from '@aimpact/chat-api/backend-provider';

interface IMessage {
	userId: string;
	timestamp: number;
}

export /*bundle*/ class Message extends Item<IMessage> {
	protected properties = ['id', 'userId', 'timestamp'];

	constructor({id = undefined} = {}) {
		super({id, db: 'chat-api', storeName: 'Messages', provider: MessageProvider});
	}
}
