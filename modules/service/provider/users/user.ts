import type {Server} from 'socket.io';
import {db} from '@aimpact/chat-api/backend-db';
import * as dayjs from 'dayjs';
import {doc, setDoc, getDoc, updateDoc, serverTimestamp} from 'firebase/firestore';
import * as jwt from 'jsonwebtoken';
import * as admin from 'firebase-admin';
interface Chat {
	id: string;
	userId: number;
	category: string;
}

export /*actions*/ /*bundle*/ class UserProvider {
	socket: Server;
	private collection;
	private table = 'Users';

	constructor(socket: Server) {
		this.socket = socket;
		this.collection = db.collection(this.table);
	}

	async updateUser(user) {
		try {
			console.log(200, user);
			const userRef = await this.collection.doc(user.id);

			const userSnapshot = await userRef.get();
			console.log(100, user);
			if (userSnapshot.exists) {
				// If the user already exists in the database, update the lastLogin field
				await userRef.update({
					...user,
					lastLogin: dayjs().unix(),
				});
			} else {
				// If the user doesn't exist in the database, create a new document for them
				await userRef.set({
					id: user.id,
					displayName: user.displayName,
					email: user.email,
					firebaseToken: user.firebaseToken,
					token: user.token,
					photoURL: user.photoURL,
					phoneNumber: user.phoneNumber,
					createdOn: dayjs().unix(),
					lastLogin: dayjs().unix(),
				});
			}
			console.log(22, userSnapshot.data());
			return {status: true, data: {user: userSnapshot.data()}};
		} catch (e) {
			console.error(e);
		}
	}

	async login(user) {
		try {
			if (!user.id || !user.firebaseToken) {
				throw new Error('INVALID_USER');
			}
			const decodedToken = await admin.auth().verifyIdToken(user.firebaseToken);
			const customToken = jwt.sign({uid: decodedToken.uid}, process.env.SECRET_KEY);
			user.token = customToken;
			return this.updateUser(user);
		} catch (e) {
			console.log(13, e);
			return {status: false, error: 'INVALID_TOKEN'};
		}
	}
}
