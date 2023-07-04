const BEE = require('@beyond-js/bee');

BEE('http://localhost:6583', {hmr: true});

(async() => {
    const {ClassesProvider} = await bimport("@aimpact/chat-api/backend-provider")
    const course = new ClassesProvider();
    const {elements} = await course.generator(1,2);

    console.log(elements);
})();
