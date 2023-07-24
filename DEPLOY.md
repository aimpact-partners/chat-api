# Para publicar las `Cloud Run` utilizando un repositorio de compilacion

## Crear Cloud Run

-   Ubicarte en el url del proyecto de googleCloud [https://console.cloud.google.com/run?project=aimpact-partners-dev]

-   Crear servicio
-   Seleccionar deploy continuo desde un repositorio
-   Dar permisos de acceso al repositorio
    -   Seleccionar Dockerfile como archivo de configuracion
    -   Indicar ruta del Dockerfile en el repositorio
    -   Agregar Dockerfile en la ruta especificada del repositorio remoto
    -   Seleccionar que la cloud run no utilice autenticacion
    -   Validar configuraciones por defecto
    -   Agregar variables de entorno (Usar como guia `.env-example`)

## Informacion de Repositorios

`chat-api-http-build`: compilacion con distribucion `node` del paquete, contiene el express que se encarga de la carga
de audios

URL: [https://aimpact-partners-dev.ue.r.appspot.com/]

`chat-api-ws-build`: compilacion con distribucion `backend` del paquete, contiene los providers que utiliza el paquete
`@aimpact/chat-sdk`

URL: [https://aimpact-partners-dev.ue.r.appspot.com/]

## Actualizar propiedades de urls cloud en la propiedad "params" del package.json

Hay 2 opciones

-   Actualizarlas en el `package.json`, previo a la compilacion

-   Actualizarlas en el archivo `config.js`, luego de la compilacion

```json
{
	"AGENTS_SERVER": "https://agent-api-rb5caohzgq-uc.a.run.app/agent"
}
```

## Compilar y Publicar

-   Compilar el paquete en la distribucion correspondiente
-   Copiar el codigo generado por la publicacion en el repositorio
-   Validar que esten agregados los archivos:
    -   Dockerfile en la ruta especificada en la configuracion del cloud run
    -   credentials.json con la informacion de la cuenta de servicio
-   Actualizar el repositorio remoto git push origin <configured-branch>
