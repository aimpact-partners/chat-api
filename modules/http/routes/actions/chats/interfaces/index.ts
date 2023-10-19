export interface IChat {
	id: string;
	name: string;
	usage: string;
	userId: string;
	parent?: string;
	children?: string;
	category?: string;
	knowledgeBoxId?: string;
}

export interface ICreateChatSpecs {
    name: string;
    parent?: number;
    knowledgeBoxId?: string;
}
