import {Item} from '@beyond-js/reactive/entities';

interface IClass {
	title: string;
	objectives: string;
}

export class Class extends Item<IClass> {
	protected properties = ['title', 'objectives'];

	constructor({id = undefined} = {}) {
		super({id, db: 'chat-api', storeName: 'Classes'});
	}
}
