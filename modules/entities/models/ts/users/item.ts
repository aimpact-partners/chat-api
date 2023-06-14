// AudioItem
import { Item } from '@beyond-js/reactive-2/entities';
import { UserProvider } from '@aimpact/chat-api/backend-provider';

interface IAudio {
	messageId: string;
}

export /*bundle*/ class User extends Item<IAudio> {
	protected properties = ['displayName', 'id', 'email', 'photoURL', 'phoneNumber'];

	#logged;
	get logged() {
		return this.#logged;
	}
	constructor({ id = undefined } = {}) {
		super({ id, db: 'chat-api', storeName: 'User', provider: UserProvider });
	}

	async login(data) {
		//@ts-ignore
		await this.isReady;
		if (this.#logged) return;
		//@ts-ignore
		await this.set(data);

		//@ts-ignore
		await this.provider.updateUser({ ...this.getValues(), id: this.id });
		this.#logged = true;
		return true;
	}
}
