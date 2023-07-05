const BEE = require('@beyond-js/bee');

BEE('http://localhost:6580', { hmr: true });

const curriculumObjective = 'Los primeros pobladores de América';
const topics = ['Hipótesis Clovis', 'Desafío Monteverde a Hipótesis Clovis'];

(async () => {
    const { ClassesProvider } = await bimport("@aimpact/chat-api/backend-provider")
    const course = new ClassesProvider();

    const response = await course.generator(curriculumObjective, topics);
    void response;
})();
