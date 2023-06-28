# Para publicar la cloud function `/upload`

## URL de la aplicacion web

[https://cheerful-treacle-e0b3f4.netlify.app]

La funcion se encarga de:

-   Cargar un audio al bucket
-   Solicitar la transcripcion a OpenAI
-   Hacer la llamada al agente

Parametros de retorno

```json
{
    "status": true,
    "data": {
        "file": "path on storage",
        "transcription": "transcription text",
        "output": "agent response",
        "message": "File uploaded successfully"
    }
}
```

## Actualizar el params del package.json por las urls de las cloud functions

```json
{
    "params": {
        "AGENTS_SERVER": "https://southamerica-west1-aimpact-partners-dev.cloudfunctions.net/agent"
    }
}
```

## Compilar con distribucion `node`
