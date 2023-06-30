import { DBManager } from '@beyond-js/reactive/database';

async function create() {
	try {
		const db = await DBManager.config('chat-api@6', {
			Chat: 'id, userId, category, knowledgeBoxId',
			User: 'id',
			Messages: 'id, chatId, userId, text, role, timestamp',
			AudioRecords: 'id, messageId',
			KnowledgeBases: 'id, userId',
			KnowledgeBoxes: 'id, userId',
			SharedKnowledgeBases: 'id, knowledgeBaseId, sharedWithUserId',
			Documents: 'id, knowledgeBaseId',
			Classes: 'id, title, description',
		});

		// For example, if you have user data to add you can use:
		// db.Chat.bulkAdd(chats);
	} catch (e) {
		console.trace('error', e);
	}
}

export /*bundle */ const createDB = create;
