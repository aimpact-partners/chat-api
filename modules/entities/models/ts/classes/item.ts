import { Item } from '@beyond-js/reactive/entities';
import { ClassesProvider } from '@aimpact/chat-api/backend-provider';
interface IClass {
	title: string;
	objectives: string;
}

export /*bundle*/ class Class extends Item<IClass> {
	protected properties = ['curriculumObjective', 'topics'];

	constructor({ id = undefined } = {}) {
		super({ id, db: 'chat-api', storeName: 'Classes', provider: ClassesProvider });
	}
}
