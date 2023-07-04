// AudioItem
import { Item } from '@beyond-js/reactive/entities';
import { UserProvider } from '@aimpact/chat-api/backend-provider';

interface IUser {
	id: string;
	displayName: string;
	email: string;
	photoURL: string;
	phoneNumber: string;
}

export /*bundle*/ class User extends Item<IUser> {
	protected properties = ['displayName', 'id', 'email', 'photoURL', 'phoneNumber'];

	#logged;
	get logged() {
		return this.#logged;
	}
	constructor(specs) {
		super({ id: specs.id, db: 'chat-api', storeName: 'User', provider: UserProvider });
	}

	async login(data) {
		await this.isReady;
		if (this.#logged) return;
		await this.set(data.user);
		await this.provider.updateUser({ ...this.getProperties(), id: this.id });
		this.#logged = true;
		return true;
	}
}
