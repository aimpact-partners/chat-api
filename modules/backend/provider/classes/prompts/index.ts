import { Socket } from 'socket.io';
import { prompts } from './consts';
import { Configuration, OpenAIApi, ChatCompletionRequestMessage } from 'openai';
import * as dotenv from 'dotenv';

dotenv.config();

const LOCAL = !process.env.FUNCTION_REGION;
const config = new Configuration({ apiKey: process.env.OPEN_AI_KEY });
const openai = new OpenAIApi(config);

type PromptExecutionResponse = { status: boolean, response?: string, error?: string, format: string, prompt: string };
export type GenerationParams = { is: string, element: string, topics?: string[], topic?: string, format?: string };

export class Prompts {
    readonly #socket: Socket;
    readonly #curriculumObjective: string;

    constructor(curriculumObjective: string, socket: Socket) {
        this.#curriculumObjective = curriculumObjective;
        this.#socket = socket;
    }

    #emit(is: string, element: string, done: boolean, topic?: string) {
        this.#socket?.emit('class-generation', { is, element, done, topic });

        const generation = done ? 'generation done' : 'generation started';
        LOCAL && console.log(`${is} ${element} ${generation}`);
    }

    #call: (prompt: string, format?: string) => Promise<PromptExecutionResponse> = async (prompt, format) => {
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
                    console.warn(`JSON cannot be parsed:\n${content}`)

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

    execute = async (params: GenerationParams): Promise<PromptExecutionResponse> => {
        const { is, element, topics, topic, format } = params;

        if (!['class', 'topic'].includes(is)) throw new Error('Parameter "is" is invalid');
        if (!['assessment', 'synthesis', 'previous'].includes(element)) throw new Error('Parameter "element" is invalid');
        if (is === 'class' && !topics) throw new Error('Parameter topics is expected when generating a class');
        if (is === 'topic' && !topic) throw new Error('Parameter topic is expected when generating a topic');
        if (is === 'class' && element === 'previous') throw new Error('Class do not support previous assessments');

        const curriculumObjective = this.#curriculumObjective;

        this.#emit(is, element, false, topic);

        const prompt = prompts[is][element](curriculumObjective, topic ? topic : topics);
        const processed = await this.#call(prompt, format);

        this.#emit(is, element, true, topic);

        return processed;
    }
}