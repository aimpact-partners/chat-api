import { Collection } from '@beyond-js/firestore-collection/collection';
import type { IKnowledgeBoxes } from '@aimpact/chat-api/data/interfaces';

class KB extends Collection<IKnowledgeBoxes> {
	constructor() {
		super('KB');
	}
}

export /*bundle*/ const kb: Collection<IKnowledgeBoxes> = new KB();
