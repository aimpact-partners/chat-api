<<<<<<< HEAD
import { Collection } from '@beyond-js/reactive-2/entities';
import { ChatsProvider } from '@aimpact/chat-api/provider';
import { Chat } from './item';
=======
import {Collection} from '@beyond-js/reactive-2/entities';
import {ChatProvider} from '@aimpact/chat-api/backend-provider';
import {Chat} from './item';
>>>>>>> 872077d4ad8da93b9cff74301b7b39210b7ffff5

interface IChats {
	items: Chat[];
}

export /*bundle */ class Chats extends Collection {
	item = Chat;
	protected storeName = 'Chat';
	protected db = 'chat-api';

	constructor() {
<<<<<<< HEAD
		super({ provider: ChatsProvider, storeName: 'Chat', db: 'chat-api' });
=======
		super();
		this.provider = new ChatProvider();
		this.init();
>>>>>>> 872077d4ad8da93b9cff74301b7b39210b7ffff5
	}
}
