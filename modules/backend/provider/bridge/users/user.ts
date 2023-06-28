import type { Server } from 'socket.io';
import { db } from '@aimpact/chat-api/backend-db';
import * as dayjs from 'dayjs';
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

    async updateUser(user) {
        try {
            const userRef = await this.collection.doc(user.id);
            const userSnapshot = await userRef.get();
            if (userSnapshot.exists) {
                // If the user already exists in the database, update the lastLogin field
                await userRef.update({
                    latLsogin: dayjs().unix(),
                });
            } else {
                // If the user doesn't exist in the database, create a new document for them
                await userRef.set({
                    id: user.id,
                    displayName: user.displayName,
                    email: user.email,
                    photoURL: user.photoURL,
                    phoneNumber: user.phoneNumber,
                    createdOn: dayjs().unix(),
                    lastLogin: dayjs().unix(),
                });
            }

            return { status: true, data: { user: userSnapshot } };
        } catch (e) {
            console.error(e);
        }
    }
}
