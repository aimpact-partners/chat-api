import type { IUsersData, IUsersBaseData } from '@aimpact/chat-api/data/interfaces';
import { db } from '@beyond-js/firestore-collection/db';
import * as admin from 'firebase-admin';
import * as jwt from 'jsonwebtoken';
import * as dayjs from 'dayjs';
import { ErrorGenerator } from '@aimpact/chat-api/business/errors';

export /*bundle*/ interface IUser extends IUsersBaseData {}

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

	async login(user: IUsersData) {
		try {
			if (!user.id || !user.firebaseToken) {
				return ErrorGenerator.invalidParameters('Users', 'id');
			}

			const decodedToken = await admin.auth().verifyIdToken(user.firebaseToken);
			const customToken = jwt.sign({ uid: decodedToken.uid }, process.env.SECRET_KEY);
			user.token = customToken;
			user.custom = customToken;

			const userRef = await this.collection.doc(user.id);
			const { exists } = await userRef.get();
			if (exists) {
				// If the user already exists in the database, update the lastLogin field
				await userRef.update({ ...user, lastLogin: dayjs().unix() });
			} else {
				// If the user doesn't exist in the database, create a new document for them
				await userRef.set({
					id: user.id,
					displayName: user.displayName,
					email: user.email,
					firebaseToken: user.firebaseToken,
					token: user.token,
					custom: user.token,
					photoURL: user.photoURL,
					phoneNumber: user.phoneNumber,
					createdOn: dayjs().unix(),
					lastLogin: dayjs().unix()
				});
			}

			const updatedUser = await userRef.get();

			console.log(2, updatedUser);
			return { status: true, data: { user: updatedUser.data() } };
		} catch (exc) {
			console.error(exc);
			return ErrorGenerator.internalError(exc);
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
