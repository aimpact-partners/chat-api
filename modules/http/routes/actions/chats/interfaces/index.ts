export interface IChat {
	id: string;
	name: string;
	usage: string;
	user: { id: string; name: string };
	parent?: string;
	children?: string;
	category?: string;
	metadata: any;
}

export interface ICreateChatSpecs {
	uid: string;
	user: { id: string; name: string };
	name: string;
	metadata: any;
	parent?: number;
}
