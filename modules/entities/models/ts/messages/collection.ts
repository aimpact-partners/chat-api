import {Collection} from '@beyond-js/reactive-2/entities';
import {MessageProvider} from '@aimpact/chat-api/backend-provider';
import {Message} from './item';

interface IChats {
	items: Message[];
}

export class Chats extends Collection {
	item = Message;
	protected storeName = 'Messages';
	protected db = 'chat-api';

	constructor() {
		super();
		this.provider = new MessageProvider();
		this.init();
	}
}
