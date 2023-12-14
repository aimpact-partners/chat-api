import { IMessage } from './message';

export /*bundle*/ interface IChat {
	id: string;
	name: string;
	metadata: {};
	parent: string;
	children: string;
	language: { default: string };
	user: { id: string; name: string };
	usage: { completionTokens: number; promptTokens: number; totalTokens: number };
	messages?: IMessage[];
}
