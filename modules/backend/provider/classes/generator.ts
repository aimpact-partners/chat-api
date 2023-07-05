import type { Socket } from 'socket.io';
import { Configuration, OpenAIApi, ChatCompletionRequestMessage } from 'openai';
import * as dotenv from 'dotenv';
import { prompts } from './prompts';

dotenv.config();

const LOCAL = !process.env.FUNCTION_REGION;
const config = new Configuration({ apiKey: process.env.OPEN_AI_KEY });
const openai = new OpenAIApi(config);

type PromptExecutionResponse = { status: boolean, response?: string, error?: string, format: string, prompt: string };

const executePrompt: (prompt: string, format?: string) => Promise<PromptExecutionResponse> = async (prompt, format) => {
	format = format === 'json' ? 'json' : 'text';

	const messages: ChatCompletionRequestMessage[] = [{
		role: 'user',
		content: prompt
	}];

	try {
		const response = await openai.createChatCompletion({
			model: 'gpt-4',
			messages,
			temperature: 0.2,
		});

		let { content } = response.data.choices[0].message;

		// If format is 'json', check if it can be parsed
		if (format === 'json') {
			try {
				JSON.stringify(JSON.parse(content));
			}
			catch (exc) {
				console.log(`JSON cannot be parsed:\n${content}`)

				// TODO: Probably it would be required to scrap the json inside the message
				const error = `It was expected a JSON, but it couldn't be parsed`;
				return { status: false, response: content, error, format: 'text', prompt };
			}
		}

		return { status: true, response: content, format, prompt };
	} catch (e) {
		console.error(e.stack);
		return { status: false, error: e.message, format: 'text', prompt };
	}
}

export async function generator(curriculumObjective: string, topics: string[], socket: Socket) {
	const response = { class: { synthesis: void 0, assessment: void 0 }, topics: [] };

	const emit = (element: string, is: string, done: boolean, topic?: string) => {
		socket?.emit('class-generation', { element, is, done, topic });

		const generation = done ? 'generation done' : 'generation started';
		LOCAL && console.log(`${element} ${is} ${generation}`);
	}

	const process = async (element: string, is: string, topic?: string, format?: string): Promise<PromptExecutionResponse> => {
		if (!['class', 'topic'].includes(element)) throw new Error('Parameter "element" is invalid');
		if (!['assessment', 'synthesis', 'preRequisitesAssessment'].includes(is)) throw new Error('Parameter "is" is invalid');

		emit(element, is, false, topic);

		const prompt = prompts[element][is](curriculumObjective, topic ? topic : topics);
		console.log('PROMPT:');
		console.log(prompt);
		const processed = await executePrompt(prompt, format);

		console.log('PROCESSED:');
		console.log(processed);

		emit(element, is, true, topic);

		return processed;
	}

	response['class'].synthesis = await process('class', 'synthesis');
	response['class'].assessment = await process('class', 'assessment', void 0, 'json');

	for (const topic of topics) {
		const synthesis = await process('topic', 'synthesis');
		const preRequisitesAssessment = await process('topic', 'preRequisitesAssessment', 'json');
		const assessment = await process('topic', 'assessment', 'json');

		response.topics.push({
			topic,
			synthesis,
			preRequisitesAssessment,
			assessment
		});
	}

	return response;
}
