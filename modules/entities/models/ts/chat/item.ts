// ChatItem
import { Item } from '@beyond-js/reactive-2/entities';
import { ChatProvider } from '@aimpact/chat-api/backend-provider';
import { Message } from './messages/item';
import { Messages } from './messages';

interface IChat {
	userId: string;
	category: string;
}

export /*bundle*/ class Chat extends Item<IChat> {
	protected properties = ['id', 'userId', 'category', 'name'];

	#messages: Messages;
	get messages() {
		return [];
	}

	constructor({ id = undefined } = {}) {
		super({ id, db: 'chat-api', storeName: 'Chat', provider: ChatProvider });
	}

	async load() {
		console.log(1, 'starting');
		await super.load(...arguments);
		//@ts-ignore
		console.log(2, this.remoteData);
	}
}
