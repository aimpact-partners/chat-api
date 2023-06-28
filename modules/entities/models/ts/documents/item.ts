// Document
import {Item} from '@beyond-js/reactive/entities';
import {DocumentProvider} from '@aimpact/chat-api/backend-provider';

interface IDocument {
	knowledgeBaseId: string;
	// additional properties...
}

export class Document extends Item<IDocument> {
	protected properties = ['id', 'knowledgeBaseId']; /* additional properties... */

	constructor({id = undefined} = {}) {
		super({id, db: 'chat-api', storeName: 'Documents', provider: DocumentProvider});
	}
}
