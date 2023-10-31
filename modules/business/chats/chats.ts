import { db } from '@beyond-js/firestore-collection/db';

export /*bundle*/ class Chats {
	static async byUser(specs) {
		try {
			if (!specs.userId) {
				throw new Error('userId is required');
			}

			const query = db.collection('Conversations').where('userId', '==', specs.userId);
			const items = await query.get();
			const entries = items.map(item => item.data());

			return entries;
		} catch (e) {
			throw Error(e.message);
		}
	}
}
