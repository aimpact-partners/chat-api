import { Collection } from '@beyond-js/reactive-2/entities';
import { Message } from './item';

interface IChats {
	items: Message[];
}

export class Chats extends Collection {
	item = Message;
	constructor() {
		super({ storeName: 'Messages', db: 'chat-api' });
	}
}
