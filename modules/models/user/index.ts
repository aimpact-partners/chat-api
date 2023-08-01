import * as admin from 'firebase-admin';
import {db} from '@aimpact/chat-api/backend-db';

export /*bundle*/ class User {
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

	#displayName: string;
	get displayName() {
		return this.#displayName;
	}

	#email: string;
	get email() {
		return this.#email;
	}

	#phoneNumber: string;
	get phoneNumber() {
		return this.#phoneNumber;
	}

	#photoURL: string;
	get photoURL() {
		return this.#email;
	}

	private collection;
	private table = 'Users';
	constructor(accessToken: string) {
		this.#accessToken = accessToken;
		this.collection = db.collection(this.table);
	}

	async validate() {
		const decodedToken = await admin.auth().verifyIdToken(this.#accessToken);

		try {
			// Access token is valid, and 'decodedToken' contains information about the user
			// You can access user information with 'decodedToken.uid' or other claims
			const {uid} = decodedToken;

			const userRef = await this.collection.doc(uid);
			const userSnapshot = await userRef.get();
			const {displayName, email, photoURL, phoneNumber} = userSnapshot.data();

			this.#uid = uid;
			this.#email = email;
			this.#displayName = displayName;
			this.#phoneNumber = phoneNumber;
			this.#photoURL = photoURL;

			this.#valid = true;
		} catch (error) {
			this.#valid = false;
		}
	}
}
