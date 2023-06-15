import { sep } from 'path';
import { FilestoreFile } from '../bucket/file';
import { convertFile } from './utils/convert';
import { getExtension } from './utils/get-extension';
import { supportedMimetypes } from './utils/mimetypes';
import { generateCustomName } from './utils/generate-name';
import { TriggerAgent } from '@aimpact/chat-api/trigger-agent';
import { OpenAIBackend } from '@aimpact/chat-api/backend-openai';

const oaiBackend = new OpenAIBackend();
const triggerAgent = new TriggerAgent();

export const uploader = async function (req, res) {
    if (!req.file) {
        return res.status(400).send({ status: false, error: 'No file was uploaded' });
    }
    if (!supportedMimetypes.includes(req.file.mimetype)) {
        return res.status(400).send(`Only MP3, MP4, MPEG, MPGA, M4A, WAV, and WEBM files are allowed`);
    }

    try {
        const convertable = ['audio/x-m4a', 'audio/mp4'];
        const fileManager = new FilestoreFile();

        const { path, originalname, mimetype } = req.file;
        const name = `${generateCustomName(originalname)}${getExtension(mimetype)}`;
        const dest = `${req.body.container}${sep}${req.body.project}${sep}${name}`;

        let origin = path;
        if (convertable.includes(mimetype)) {
            origin = await convertFile(path, 'mp3');
        }

        await fileManager.upload(origin, dest);
        const response = await oaiBackend.transcription(dest, 'es');
        if (!response.status) {
            res.json({
                status: false,
                error: `Error transcribing audio: ${response.error}`,
            });
            return;
        }

        const agentResponse = await triggerAgent.call(response.data.text, req.body.container);

        if (!response.status) {
            res.json({
                status: false,
                error: `Error saving file: ${response.error}`,
            });
            return;
        }
        res.json({
            status: true,
            data: {
                file: dest,
                transcription: response.data.text,
                output: agentResponse.data.output,
                message: 'File uploaded successfully',
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error saving file');
    }
};
