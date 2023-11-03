import { IPromptCategoryData } from './category';

export /*bundle*/ interface IPromptOptionData {
	id: string;
	value: string;
}

interface IBase {
	id: string;
	name: string;
	description: string;
	language: string;
	format: 'json' | 'text';
	is: 'prompt' | 'function' | 'dependency';
	value?: string;
	options?: IPromptOptionData[];
	literals?: {
		pure?: string[];
		dependencies?: string[];
		metadata?: string[];
	};
}

export /*bundle*/ interface IPromptTemplateBaseData extends IBase {
	projectId: string;
}

export /*bundle*/ interface IPromptTemplateData extends IBase {
	project: { id: string; name: string };
	categories?: IPromptCategoryData[];
}
