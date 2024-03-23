import { Collection } from '@beyond-js/firestore-collection/collection';
import type { IUsersData } from '@aimpact/chat-api/data/interfaces';

class Users extends Collection<IUsersData> {
	constructor() {
		super('Users');
	}
}

export /*bundle*/ const users: Collection<IUsersData> = new Users();
