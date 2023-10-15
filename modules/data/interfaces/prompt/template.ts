import { IPromptCategoryData } from './category';

export /*bundle*/ interface IPromptOptionData {
	id: string;
	value: string;
}

export /*bundle*/ interface IPromptData {
	categories?: IPromptCategoryData[];
	name: string;
	description: string;
	language: string;
	value?: string[];
	options?: IPromptOptionData[];
	dependencies?: string[];
	literals?: string[];
}
