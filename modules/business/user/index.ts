import type { IUsersData, IUsersBaseData } from '@aimpact/chat-api/data/interfaces';
import type { Transaction } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';
import * as jwt from 'jsonwebtoken';
import * as dayjs from 'dayjs';
import { users } from '@aimpact/chat-api/data/model';
import { db } from '@beyond-js/firestore-collection/db';
import { ErrorGenerator } from '@aimpact/chat-api/business/errors';
import { BusinessResponse } from '@aimpact/chat-api/business/response';

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

	async register(user: IUsersData) {
		return await db.runTransaction(async (transaction: Transaction) => {
			try {
				const response = await users.data({ id: user.id, transaction });
				if (response.error) return new BusinessResponse({ error: response.error });
				if (response.data.exists)
					return new BusinessResponse({ error: ErrorGenerator.userAlreadyExists(user.id) });

				const data: IUsersData = {
					id: user.id,
					uid: user.id,
					name: user.displayName,
					displayName: user.displayName,
					email: user.email,
					firebaseToken: user.firebaseToken,
					token: user.token,
					custom: user.token,
					photoURL: user.photoURL,
					phoneNumber: user.phoneNumber,
					createdOn: dayjs().unix(),
					lastLogin: dayjs().unix()
				};
				const { error } = await users.set({ data, transaction });
				if (error) return new BusinessResponse({ error });

				return new BusinessResponse({ data });
			} catch (exc) {
				return new BusinessResponse({ error: ErrorGenerator.internalError(exc) });
			}
		});
	}

	async login(user: IUsersData) {
		if (!user.id || !user.firebaseToken)
			return new BusinessResponse({ error: ErrorGenerator.invalidParameters(['id']) });

		let error;
		({ error } = await (async () => {
			return await db.runTransaction(async (transaction: Transaction) => {
				try {
					const decodedToken = await admin.auth().verifyIdToken(user.firebaseToken);
					const customToken = jwt.sign({ uid: decodedToken.uid }, process.env.SECRET_KEY);
					user.token = customToken;

					const response = await users.data({ id: user.id, transaction });
					if (response.error) return { error: response.error };

					if (response.data.exists) {
						// If the user already exists in the database, update the lastLogin field
						await users.merge({ id: user.id, data: { ...user, lastLogin: dayjs().unix() }, transaction });
					} else {
						// If the user doesn't exist in the database, create a new document for them
						await users.set({
							data: {
								id: user.id,
								uid: user.id,
								name: user.displayName,
								displayName: user.displayName,
								email: user.email,
								firebaseToken: user.firebaseToken,
								token: user.token,
								custom: user.token,
								photoURL: user.photoURL,
								phoneNumber: user.phoneNumber,
								createdOn: dayjs().unix(),
								lastLogin: dayjs().unix()
							},
							transaction
						});
					}

					return { error: void 0 };
				} catch (exc) {
					return { error: ErrorGenerator.internalError(exc) };
				}
			});
		})());

		if (error) return new BusinessResponse({ error });

		// Get user
		let data: IUsersData;
		({ data, error } = await (async () => {
			const response = await users.data({ id: user.id });
			if (response.error) return { error: response.error };
			return { data: response.data.data };
		})());
		if (error) return new BusinessResponse({ error });

		return new BusinessResponse({ data });
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
