import dotenv from 'dotenv';
dotenv.config({ quiet: true })
import express from 'express';
import { app } from "./app";
import { sisIngestRouter } from "./routers/sis-ingest";
import { configRouter } from './routers/config';

(async () => {
    try {
        app.use(express.urlencoded({ extended: true, limit: '50mb' }));
        app.use(express.json({ limit: '50mb' }));

        app.use('/sisIngest', sisIngestRouter)
        app.use('/config', configRouter)

        app.listen(process.env.PORT, () => {
            console.log(`Server is running on http://localhost:${process.env.PORT}`);
        })

    } catch (e) {
        console.log(e);
    }
})();