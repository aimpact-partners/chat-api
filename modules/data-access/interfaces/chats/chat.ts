import { IUserBase } from '../users';

export /*bundle*/ interface ILastIterationsData {
	role: string;
	content: string;
	synthesis?: string;
}

export /*bundle*/ interface IChatBase {
	id: string;
	name: string;
	metadata: {};
	parent: string;
	children: string;
	language: { default: string };
	user: IUserBase;
	messages?: {
		count: number;
		lastTwo?: ILastIterationsData[];
	};
}

export /*bundle*/ interface IChatData extends IChatBase {
	synthesis?: string;
	project: { id: string; name: string; identifier: string; agent: { url: string } };
	usage?: { completionTokens: number; promptTokens: number; totalTokens: number };
}

export /*bundle*/ interface IChatDataSpecs {
	id: string;
	name: string;
	metadata: {};
	parent?: string;
	children?: string;
	language: { default: string };
	uid: string;
	projectId: string;
}
