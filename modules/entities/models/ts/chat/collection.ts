import {Collection} from '@beyond-js/reactive-2/entities';
import {ChatsProvider} from '@aimpact/chat-api/provider';
import {Chat} from './item';

interface IChats {
	items: Chat[];
}

export class Chats extends Collection {
	item = Chat;
	protected storeName = 'Chat';
	protected db = 'chat-api';

	constructor() {
		super();
		this.provider = new ChatsProvider();
		this.init();
	}
}
