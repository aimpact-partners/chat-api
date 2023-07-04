// Class Synthesis
const CLASS_SYNTHESIS = `Por favor, arma una síntesis de una clase de un día de duración en el aula.
Hazlo de acuerdo al {OBJETIVO CURRICULAR} indicado, y abordando los siguientes {TEMAS}. 
La finalidad es ser utilizado en un análisis posterior y debe permitir una visualización rápida de los temas que se deben abordar.

Incluye los puntos principales y utiliza los siguientes elementos según corresponda: 
Utiliza negrita, cursiva, subrayado u otros formatos para destacar los puntos principales y subpuntos importantes. 
Utiliza viñetas, tablas, gráficos o diagramas para presentar la información de manera clara y visual. 
Incluye una introducción clara y concisa que resuma el tema y los objetivos del texto. 
Incluye una conclusión que resuma las ideas principales y proporcione una visión general del texto. 

Asegúrate de que la síntesis sea coherente y fácil de entender para que pueda ser utilizada en un análisis posterior de manera eficiente.`;

export const prompts = {
    class: {
        synthesis: (curriculumObjective: string, topics: string[]) => `${CLASS_SYNTHESIS}\n\n` +
            `OBJETIVO CURRICULAR = [${curriculumObjective}]\n\n` +
            `TEMAS = [\n* ${topics.join('\n* ')}\n]`
    },
    topics: {

    }
}
