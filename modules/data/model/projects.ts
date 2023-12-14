import { Collection } from '@beyond-js/firestore-collection/collection';
import type { IProjectBaseData } from '@aimpact/chat-api/data/interfaces';

class Projects extends Collection<IProjectBaseData> {
	constructor() {
		super('Projects');
	}
}

export /*bundle*/ const projects: Collection<IProjectBaseData> = new Projects();
