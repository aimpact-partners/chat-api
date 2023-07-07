import { DBManager } from '@beyond-js/reactive/database';

async function create() {
	try {
		const db = await DBManager.config('chat-api@7', {
			Chat: 'id, name, userId, category, usage, system, knowledgeBoxId',
			User: 'id',
			Messages: 'id, chatId, userId, text, role, usage, timestamp',
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
