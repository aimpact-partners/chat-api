import { DBManager } from '@beyond-js/reactive-2/database';

async function create() {
	try {
		const db = await DBManager.config('chat-api@1', {
			Chat: 'id, userId, category',
			Messages: 'id, chatId, userId, timestamp',
			AudioRecords: 'id, messageId',
			KnowledgeBases: 'id, userId',
			SharedKnowledgeBases: 'id, knowledgeBaseId, sharedWithUserId',
			Documents: 'id, knowledgeBaseId',
		});

		// For example, if you have user data to add you can use:
		// db.Chat.bulkAdd(chats);
	} catch (e) {
		console.trace('error', e);
	}
}

export /*bundle */ const createDB = create;
