import {Collection} from '@beyond-js/reactive/entities';
import {DocumentProvider} from '@aimpact/chat-api/backend-provider';
import {Document} from './item';

interface IDocuments {
	items: Document[];
}

export class Documents extends Collection {
	item = Document;
	constructor() {
		super({provider: DocumentProvider, storeName: 'Documents', db: 'chat-api'});
	}
}
