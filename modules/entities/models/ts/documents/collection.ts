import { Collection } from '@beyond-js/reactive-2/entities';
import { Document } from './item';

interface IDocuments {
	items: Document[];
}

export class Documents extends Collection {
	item = Document;
	protected storeName = 'Documents';
	protected db = 'chat-api@1';

	constructor() {
		super();
		this.init();
	}
}
