import dotenv from 'dotenv';
dotenv.config({ quiet: true })
import express from 'express';
import { app } from "./app";
import { sisIngestRouter } from "./routers/sis-ingest";
import { configRouter } from './routers/config';
import { sectionSearchRouter } from './routers/section-search';
import { nullStringMiddleware } from './helpers/query-params';
import { updateCache } from "./section-search/cache"

(async () => {
    try {
        app.use(express.urlencoded({ extended: true, limit: '50mb' }));
        app.use(express.json({ limit: '50mb' }));
        app.use(nullStringMiddleware)

        await updateCache();
        setInterval(updateCache, 10_000)

        app.use('/sisIngest', sisIngestRouter)
        app.use('/config', configRouter)
        app.use('/sectionSearch', sectionSearchRouter)

        app.listen(process.env.PORT, () => {
            console.log(`Server is running on http://localhost:${process.env.PORT}`);
        })

    } catch (e) {
        console.log(e);
    }
})();