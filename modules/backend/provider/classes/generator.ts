import type { Socket } from 'socket.io';
import { Prompts, GenerationParams } from './prompts';
// topic types: 'assessment', 'synthesis', 'previous', "content"
// class types: 'assessment', 'synthesis', "relevance"
//generate("objetivo", {is: "class", element: "synthesis", topics: ["topic1", "topic2"]})
//generate("objetivo", {is: "topic", element: "synthesis", topics: ["topic1", "topic2"]})
export async function generate(curriculumObjective: string, params: GenerationParams, socket: Socket) {
	const prompts = new Prompts(curriculumObjective, socket);
	return prompts.execute(Object.assign(params));
}

export async function generateAll(curriculumObjective: string, topics: string[], socket: Socket) {
	const response = { class: { synthesis: void 0, assessment: void 0 }, topics: [] };

	const prompts = new Prompts(curriculumObjective, socket);

	response['class'].synthesis = await prompts.execute({ is: 'class', element: 'synthesis', topics });
	response['class'].assessment = await prompts.execute({ is: 'class', element: 'assessment', format: 'json' });

	for (const topic of topics) {
		const synthesis = await prompts.execute({ is: 'topic', element: 'synthesis', topic });
		const previous = await prompts.execute({ is: 'topic', element: 'previous', topic, format: 'json' });
		const assessment = await prompts.execute({ is: 'topic', element: 'assessment', topic, format: 'json' });

		response.topics.push({
			topic,
			synthesis,
			previous,
			assessment,
		});
	}

	return response;
}
