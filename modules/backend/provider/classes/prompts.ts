const PRE = 'Evita el pre-text y el post-text, no hagas aclaraciones.'
const POST = 'Si tienes sugerencias, dudas, comentarios, o cualquier otro contenido de texto ' +
  'que no sea el del archivo solicitado, te lo solicitaré en un siguiente mensaje.';

const HEADER_CONTENT = `${PRE}\nNecesito sólo el contenido solicitado.\n${POST}`;
const HEADER_JSON = `${PRE}\nNecesito sólo el contenido del archivo .json solicitado.\n${POST}`;

const PROMPT_BULLETS = `La finalidad del contenido solicitado es la de ser utilizado para un análisis posterior` +
  ` y debe permitir una visualización rápida de los temas que se deben abordar.

Incluye los puntos principales y utiliza los siguientes elementos según corresponda: 
Utiliza negrita, cursiva, subrayado u otros formatos para destacar los puntos principales y subpuntos importantes. 
Utiliza viñetas, tablas, gráficos o diagramas para presentar la información de manera clara y visual. 
Incluye una introducción clara y concisa que resuma el tema y los objetivos del texto. 
Incluye una conclusión que resuma las ideas principales y proporcione una visión general del texto. 

Asegúrate de que la síntesis sea coherente y fácil de entender para que pueda ser utilizada en un análisis posterior de manera eficiente.`;

const CLASS_SYNTHESIS = `${HEADER_CONTENT}\n\nPor favor, arma una síntesis de una clase de un día de duración en el aula.
Hazlo de acuerdo al {OBJETIVO CURRICULAR} indicado, y abordando los siguientes {TEMAS}.\n\n${PROMPT_BULLETS}`;

const TOPIC_SYNTHESIS = `${HEADER_CONTENT}Por favor, arma una síntesis del {TEMA} que forma parte de una clase dictada en el aula.
Hazlo de acuerdo al {OBJETIVO CURRICULAR} indicado.\n\n${PROMPT_BULLETS}`;

const ASSESSMENT_FORMAT = `FORMATO ARCHIVO .json = {"topics": [{
  "title": string, 
  "questions": [{
    "text": string,
    "options": [string],
    "correct_answer": number
  }]
}]}
Los números de las respuestas correctas se deben basar en el índice 0.`;

const CLASS_ASSESSMENT = `${HEADER_JSON}\nArma una evaluación multiple choice (en {FORMATO ARCHIVO .json}) ` +
  `de acuerdo al {OBJETIVO CURRICULAR} indicado, y abordando los {TEMAS} definidos abajo.\n\n${ASSESSMENT_FORMAT}`;

const TOPIC_ASSESSMENT = `${HEADER_JSON}\nArma una evaluación multiple choice (en {FORMATO ARCHIVO .json}) ` +
  `de acuerdo al {OBJETIVO CURRICULAR} indicado, para el {TEMA} definido abajo.\n\n${ASSESSMENT_FORMAT}`;

const TOPIC_PRE_REQUISITES = `${HEADER_JSON}\nArma una evaluación multiple choice (en {FORMATO ARCHIVO .json}) ` +
  `sobre los temas que el alumno debería conocer como requisitos previos para abordar el {OBJETIVO CURRICULAR} del {TEMA} definido indicado.`;

export const prompts = {
  class: {
    synthesis: (curriculumObjective: string, topics: string[]) => `${CLASS_SYNTHESIS}\n\n` +
      `OBJETIVO CURRICULAR = [${curriculumObjective}]\n\n` +
      `TEMAS = [\n* ${topics.join('\n* ')}\n]`,
    assessment: (curriculumObjective: string, topics: string[]) => `${CLASS_ASSESSMENT}\n\n` +
      `OBJETIVO CURRICULAR = [${curriculumObjective}]\n\n` +
      `TEMAS = [\n* ${topics.join('\n* ')}\n]`
  },
  topic: {
    synthesis: (curriculumObjective: string, topic: string) => `${TOPIC_SYNTHESIS}\n\n` +
      `OBJETIVO CURRICULAR = [${curriculumObjective}]\n\n` +
      `TEMA = [${topic}]`,
    assessment: (curriculumObjective: string, topic: string) => `${TOPIC_ASSESSMENT}\n\n` +
      `OBJETIVO CURRICULAR = [${curriculumObjective}]\n\n` +
      `TEMA = [${topic}]`,
    preRequisitesAssessment: (curriculumObjective: string, topic: string) => `${TOPIC_PRE_REQUISITES}\n\n` +
      `OBJETIVO CURRICULAR = [${curriculumObjective}]\n\n` +
      `TEMA = [${topic}]`,
  }
}
