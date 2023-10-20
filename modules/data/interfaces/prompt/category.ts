export /*bundle*/ interface IPromptCategoryBaseData {
	id: string;
	name: string;
	description: string;
}

export /*bundle*/ interface IPromptCategoryData extends IPromptCategoryBaseData {
	prompts: Record<string, string>;
	project: { id: string; name: string };
}
