import { db } from '@aimpact/chat-api/firestore';

export class Messages {
	static async getByLimit(conversationId: string, limit: number) {
		try {
			const conversationDoc = await db.collection('Conversations').doc(conversationId).get();
			const messagesSnapshot = await conversationDoc.ref
				.collection('messages')
				.orderBy('timestamp')
				.limit(limit)
				.get();

			return messagesSnapshot.docs.map(doc => doc.data());
		} catch (e) {
			console.error(e);
			throw new Error(e);
		}
	}
}
