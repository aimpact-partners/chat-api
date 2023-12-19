import { db } from '@beyond-js/firestore-collection/db';
import { ErrorGenerator } from '@aimpact/chat-api/business/errors';
import { BusinessResponse } from '@aimpact/chat-api/business/response';

export /*bundle*/ class Chats {
	static async byUser(id: string) {
		try {
			if (!id) {
				return ErrorGenerator.invalidParameters('Chats', 'userId');
			}

			const docs = await db.collection('Chats').where('user.id', '==', id).get();
			const items = [];
			docs.forEach(item => items.push(item.data()));

			return new BusinessResponse({ data: { items } });
		} catch (exc) {
			return ErrorGenerator.internalError(exc);
		}
	}
}
