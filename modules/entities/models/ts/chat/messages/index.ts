import { Collection } from '@beyond-js/reactive-2/entities';
import { MessageProvider } from '@aimpact/chat-api/backend-provider';
import { Message } from './item';

interface IMessages {
	items: Message[];
}

export class Messages extends Collection {
	item = Message;
	constructor() {
		super({ provider: MessageProvider, storeName: 'Messages', db: 'chat-api' });
	}
}
