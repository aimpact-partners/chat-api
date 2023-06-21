// SharedKnowledgeItem
import { Item } from '@beyond-js/reactive/entities';
import { SharedKnowledgeProvider } from '@aimpact/chat-api/backend-provider';

interface ISharedKnowledge {
    knowledgeBaseId: string;
    sharedWithUserId: string;
}

export /*bundle*/ class SharedKnowledge extends Item<ISharedKnowledge> {
    protected properties = ['id', 'knowledgeBaseId', 'sharedWithUserId'];

    constructor({ id = undefined } = {}) {
        super({ id, db: 'chat-api', storeName: 'SharedKnowledgeBases', provider: SharedKnowledgeProvider });
    }
}
