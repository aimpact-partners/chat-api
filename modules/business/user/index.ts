import { db } from '@beyond-js/firestore-collection/db';

export /*bundle*/ interface IUser {
	uid: string;
	id: string;
	name: string;
	displayName: string;
	email: string;
	photoURL: string;
	phoneNumber: number;
}

export /*bundle*/ class User implements IUser {
	#accessToken: string;

	#valid: boolean;
	get valid() {
		return this.#valid;
	}

	#uid: string;
	get uid() {
		return this.#uid;
	}

	#id: string;
	get id() {
		return this.#id;
	}

	#name: string;
	get name() {
		return this.#name;
	}

	#displayName: string;
	get displayName() {
		return this.#displayName;
	}

	#email: string;
	get email() {
		return this.#email;
	}

	#phoneNumber: number;
	get phoneNumber() {
		return this.#phoneNumber;
	}

	#photoURL: string;
	get photoURL() {
		return this.#photoURL;
	}

	private collection;
	private table = 'Users';
	constructor(id: string) {
		this.#id = id;
		this.collection = db.collection(this.table);
	}

	async load() {
		try {
			if (!this.#id) {
				this.#valid = false;
				return { status: false, error: `The user does not have an id to be loaded` };
			}

			const userRef = await this.collection.doc(this.#id);
			const userSnapshot = await userRef.get();
			const { displayName, email, photoURL, phoneNumber } = userSnapshot.data();

			this.#valid = true;

			this.#uid = this.#id;
			this.#email = email;
			this.#name = displayName;
			this.#displayName = displayName;
			this.#phoneNumber = phoneNumber;
			this.#photoURL = photoURL;

			return { status: true, data: userSnapshot.data() };
		} catch (error) {
			this.#valid = false;
			return { status: false, error: `Error loading user` };
		}
	}

	toJSON(): IUser {
		return {
			uid: this.#uid,
			id: this.#id,
			name: this.#name,
			displayName: this.#displayName,
			email: this.#email,
			photoURL: this.#photoURL,
			phoneNumber: this.#phoneNumber
		};
	}
}
