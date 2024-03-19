import { IPromptCategoryData } from './category';
import { IPromptOptionData } from './language';

interface IBaseData {
	id: string;
	name: string;
	description?: string;
	language: { default: string; languages: string[] };
	format: 'json' | 'text';
	is: 'prompt' | 'function' | 'dependency';
	literals?: {
		pure?: string[];
		dependencies?: string[];
		metadata?: string[];
	};
}

export /*bundle*/ interface IPromptTemplateBaseData extends IBaseData {
	projectId: string;
	language: { default: string; languages: string[] };
	value?: string;
	options?: IPromptOptionData[];
}

export /*bundle*/ interface IPromptTemplateData extends IBaseData {
	identifier: string;
	project: { id: string; name: string; identifier: string };
	categories?: IPromptCategoryData[];
	value: string;
}

export /*bundle*/ interface IPromptTemplateLanguageData {
	id: string;
	project: { id: string; name: string; identifier: string };
	language: string;
	value?: string;
	literals?: {
		pure?: string[];
		dependencies?: string[];
		metadata?: string[];
	};
}
