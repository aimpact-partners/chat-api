import { Collection } from '@beyond-js/reactive/entities';
import { Class } from './item';

export /*bundle*/ class Classes extends Collection {
	item = Class;
	constructor() {
		super({ storeName: 'Classes', db: 'chat-api' });
	}
}
