// KnowledgeBox
import { Item } from '@beyond-js/reactive-2/entities';
import { KnowledgeBoxProvider } from '@aimpact/chat-api/backend-provider';

interface IKnowledgeBox {
    knowledgeBoxId: string;
    path: string;
    files: [];
    type: 'own' | 'shared';
}

export /*bundle*/ class KnowledgeBox extends Item<IKnowledgeBox> {
    protected properties = ['id', 'path', 'files', 'type'];
    constructor({ id = undefined } = {}) {
        super({ id, db: 'chat-api', storeName: 'KnowledgeBoxes', provider: KnowledgeBoxProvider });
    }
}
