import { DBManager } from '@beyond-js/reactive-2/database';

async function create() {
    try {
        const db = await DBManager.config('chat-api@5', {
            Chat: 'id, userId, category',
            User: 'id',
            Messages: 'id, chatId, userId, text, role, timestamp',
            AudioRecords: 'id, messageId',
            KnowledgeBases: 'id, userId',
            KnowledgeBoxes: 'id, userId',
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
