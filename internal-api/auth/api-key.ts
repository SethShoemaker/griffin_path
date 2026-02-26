import { NextFunction, Request, Response } from "express";
import crypto from "crypto";

export interface ApiRequestMeta {
    hasApiKey: boolean,
    hasValidApiKey: boolean
}

export function maybeAttachApiKey(req: Request, res: Response, next: NextFunction) {

    // @ts-ignore
    req.hasApiKey = false;
    // @ts-ignore
    req.hasValidApiKey = false;

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        next();
        return;
    }

    if (!authHeader?.startsWith("Bearer ")) {
        next();
        return;
    }

    // @ts-ignore
    req.hasApiKey = true;

    const apiKey = authHeader.slice("Bearer ".length).trim();
    const incomingHash = crypto.createHash("sha256").update(apiKey).digest("hex");

    const valid = crypto.timingSafeEqual(
        Buffer.from(incomingHash),
        Buffer.from(process.env.API_KEY_HASH!)
    );

    if (valid) {
        // @ts-ignore
        req.hasValidApiKey = true;
    }

    next();
}

export function requireApiKey(req: Request, res: Response, next: NextFunction) {

    // @ts-ignore
    if(! req.hasApiKey) {
        return res.status(401).json({ error: "Missing API key" });;
    }
    
    // @ts-ignore
    if(! req.hasValidApiKey) {
        return res.status(401).json({ error: "API key is invalid" });;
    }

    next();
}