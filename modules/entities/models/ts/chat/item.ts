// ChatItem
import { Item } from '@beyond-js/reactive-2/entities';
import { ChatProvider } from '@aimpact/chat-api/provider';

interface IChat {
	userId: string;
	category: string;
}

export /*bundle*/ class Chat extends Item<IChat> {
	protected properties = ['id', 'userId', 'category'];

	constructor({ id = undefined } = {}) {
		super({ id, db: 'chat-api', storeName: 'Chat', provider: ChatProvider });
	}
}
