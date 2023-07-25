# Para publicar las `Cloud Run` utilizando un repositorio de compilacion

## Cloud Run

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

## Repositorios

### `chat-api-http-build`

Compilacion con distribucion `node` del paquete, contiene el express que se encarga de la carga de audios

-   Repositorio remoto: [https://github.com/aimpact-partners/chat-api-http-build]

-   Cloud run: [https://chat-api-http-rb5caohzgq-uc.a.run.app]

### `chat-api-ws-build`

Compilacion con distribucion `backend` del paquete, contiene las APIs que utiliza el paquete `@aimpact/chat-sdk`

-   Repositorio remoto: [https://github.com/aimpact-partners/chat-api-ws-build]

-   Cloud run: [https://chat-api-ws-rb5caohzgq-uc.a.run.app]

## Compilar y Publicar

-   Compilar el paquete en la distribucion correspondiente
-   Copiar el codigo generado por la publicacion en el repositorio
-   Validar que esten agregados los archivos:
    -   Dockerfile en la ruta especificada en la configuracion del cloud run
    -   credentials.json con la informacion de la cuenta de servicio
-   Actualizar el repositorio remoto: `git push origin <configured-branch>`
