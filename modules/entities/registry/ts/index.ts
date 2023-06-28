import { DBManager } from '@beyond-js/reactive/database';

async function create() {
    try {
        const db = await DBManager.config('chat-api@5', {
            Chat: 'id, userId, category, knowledgeBoxId',
            User: 'id',
            Messages: 'id, chatId, userId, content, role, timestamp',
            AudioRecords: 'id, messageId',
            KnowledgeBases: 'id, userId',
            KnowledgeBoxes: 'id, path, identifier, userId',
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
