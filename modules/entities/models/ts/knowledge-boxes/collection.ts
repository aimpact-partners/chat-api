import { Collection } from '@beyond-js/reactive/entities';
import { KnowledgeBoxProvider } from '@aimpact/chat-api/backend-provider';
import { KnowledgeBox } from './item';

export /*bundle*/ class KnowledgeBoxes extends Collection {
	item = KnowledgeBox;
	constructor() {
		super({ provider: KnowledgeBoxProvider, storeName: 'KnowledgeBoxes', db: 'chat-api' });
	}
}
