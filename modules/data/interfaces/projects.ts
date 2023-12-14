export /*bundle*/ interface IProjectBaseData {
	id: string;
	name: string;
}

export /*bundle*/ interface IProjectData extends IProjectBaseData {
	identifier: string;
	description: string;
}
