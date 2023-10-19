import { IProjectData } from '../projects';

export /*bundle*/ interface IPromptCategoryBaseData {
	id: string;
	name: string;
	description: string;
	project: IProjectData;
}

export /*bundle*/ interface IPromptCategoryData extends IPromptCategoryBaseData {
	prompts: Record<string, string>;
}
