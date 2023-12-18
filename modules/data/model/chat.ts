import { Collection } from '@beyond-js/firestore-collection/collection';
import type { IChatData } from '@aimpact/chat-api/data/interfaces';

class Chats extends Collection<IChatData> {
	constructor() {
		super('Chats');
	}
}

export /*bundle*/ const chats: Collection<IChatData> = new Chats();
