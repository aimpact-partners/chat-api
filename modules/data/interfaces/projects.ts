export /*bundle*/ interface IProjectBaseData {
	id: string;
	name: string;
	agent: { url: string };
}

export /*bundle*/ interface IProjectData extends IProjectBaseData {
	identifier: string;
	description: string;
}
