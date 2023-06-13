import type { Server } from 'socket.io';
import { db } from '../db';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

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

	updateUser = async user => {
		const userRef = doc(this.collection, user.id);
		const userSnapshot = await getDoc(userRef);

		if (userSnapshot.exists()) {
			// If the user already exists in the database, update the lastLogin field
			await updateDoc(userRef, {
				lastLogin: serverTimestamp(),
			});
		} else {
			// If the user doesn't exist in the database, create a new document for them
			await setDoc(userRef, {
				uid: user.uid,
				displayName: user.displayName,
				email: user.email,
				photoURL: user.photoURL,
				phoneNumber: user.phoneNumber,
				createdOn: serverTimestamp(),
				lastLogin: serverTimestamp(),
			});
		}
	};
}
