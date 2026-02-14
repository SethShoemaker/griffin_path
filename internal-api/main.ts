import dotenv from 'dotenv';
dotenv.config({quiet: true})
import bodyParser from "body-parser";
import express from 'express';
import { app } from "./app";
import cookieParser from "cookie-parser";
import { sisIngestRouter } from "./routers/sisIngest";


(async () => {
    try {
        app.use(bodyParser.urlencoded())
        app.use(express.json())
        app.use(cookieParser())

        app.use('/sisIngest', sisIngestRouter)

        app.listen(process.env.PORT, () => {
            console.log(`Server is running on http://localhost:${process.env.PORT}`);
        })

    } catch (e) {
        console.log(e);
    }
})();