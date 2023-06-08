# How to use Fire bundle

## levantar el servicio node

```ts
var {Fire} = await bimport('@aimpact/chat-api/fire');
var model = new Fire();

var r = await model.collection('assignments');

var g = await r.get();
var enty = await r.doc('QuoRTZiNbvhQRec2SdpT').get();
```

### loadChat

```ts
var {ChatStore} = await bimport('@aimpact/chat-api/database');
var m = new ChatStore();
var id = '';
var r = await m.loadChat(id);
```

### storeChat

```ts
var {ChatStore} = await bimport('@aimpact/chat-api/database');
var m = new ChatStore();
var r = await m.storeChat({userId: 1, category: 'pruebas 1'});
```

### bulkSave

```ts
var {ChatStore} = await bimport('@aimpact/chat-api/database');
var m = new ChatStore();
var r = await m.bulkSave([
	{userId: 1, category: 'bulk 1'},
	{userId: 2, category: 'bulk 2'},
	{userId: 3, category: 'bulk 3'},
	{userId: 4, category: 'bulk 4'},
]);
```
