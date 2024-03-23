export /*bundle*/ interface IPromptOptionData {
	id: string;
	value: string;
}

export interface /*bundle*/ IPromptLanguageData {
	id: string; //name.language = header.es/header.en
	language: string;
	value?: string;
	literals?: {
		pure?: string[];
		dependencies?: string[];
		metadata?: string[];
	};
	project: { id: string; name: string; identifier: string };
	options?: IPromptOptionData[];
}
