import { Collection } from '@beyond-js/firestore-collection/collection';
import type { IUsersData } from '@aimpact/chat-api/data/interfaces';

class KB extends Collection<IUsersData> {
	constructor() {
		super('KB');
	}
}

export /*bundle*/ const users: Collection<IUsersData> = new KB();
