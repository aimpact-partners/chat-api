import { db } from '@beyond-js/firestore-collection/db';

export class Messages {
	static async getByLimit(chatId: string, limit: number) {
		try {
			const chatDoc = await db.collection('Chats').doc(chatId).get();
			const messagesSnapshot = await chatDoc.ref
				.collection('messages')
				.orderBy('timestamp', 'desc')
				.limit(limit)
				.get();

			const messages = messagesSnapshot.docs.map(doc => doc.data());
			messages.sort((a, b) => a.timestamp - b.timestamp);
			return messages;
		} catch (e) {
			console.error(e);
			throw new Error(e);
		}
	}
}
