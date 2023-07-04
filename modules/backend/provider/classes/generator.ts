import { Configuration, OpenAIApi, ChatCompletionRequestMessage } from 'openai';
import * as dotenv from 'dotenv';
import { prompts } from './prompts';

dotenv.config();

const config = new Configuration({ apiKey: process.env.OPEN_AI_KEY });
const openai = new OpenAIApi(config);

type PromptExecutionResponse = Promise<{ status: boolean, response?: string, error?: string }>;

const executePrompt: (content: string) => PromptExecutionResponse = async (content) => {
	const messages: ChatCompletionRequestMessage[] = [{
		role: 'user',
		content
	}];

	try {
		const response = await openai.createChatCompletion({
			model: 'gpt-4',
			messages,
			temperature: 0.2,
		});

		return { status: true, response: response.data.choices[0].message.content };
	} catch (e) {
		console.error(e.stack);
		return { status: false, error: e.message };
	}
}

export async function generator(curriculumObjective: string, topics: string[]) {
	const classSynthesis = await executePrompt(prompts.class.synthesis(curriculumObjective, topics));
	return { class: { synthesis: classSynthesis } };
}
