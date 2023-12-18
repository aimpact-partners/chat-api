import { IMessage } from './message';

export /*bundle*/ interface IChatBaseData {
	id: string;
	name: string;
	metadata: {};
	parent: string;
	children: string;
	language: { default: string };
	user: { id: string; name: string };
}

export /*bundle*/ interface IChatData extends IChatBaseData {
	project: { id: string; name: string; identifier: string; agent: { url: string } };
	messages?: IMessage[];
	usage?: { completionTokens: number; promptTokens: number; totalTokens: number };
}
