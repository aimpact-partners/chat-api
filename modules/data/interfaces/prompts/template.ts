import { IPromptCategoryData } from './category';

export /*bundle*/ interface IPromptOptionData {
	id: string;
	value: string;
}

export /*bundle*/ interface IPromptTemplateData {
	id: string;
	categories?: IPromptCategoryData[];
	name: string;
	description: string;
	language: string;
	value?: string;
	options?: IPromptOptionData[];
	dependencies?: string[];
	literals?: string[];
	format: 'json' | 'text';
	is: 'prompt' | 'function' | 'dependency';
}
