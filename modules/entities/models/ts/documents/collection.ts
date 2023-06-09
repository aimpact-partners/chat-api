import { Collection } from '@beyond-js/reactive-2/entities';
import { Document } from './item';

interface IDocuments {
	items: Document[];
}

export class Documents extends Collection {
	item = Document;
	constructor() {
		super({ storeName: 'Documents', db: 'chat-api' });
	}
}
