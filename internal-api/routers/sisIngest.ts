import express, { Request, Response } from "express";
import { maybeAttachApiKey, requireApiKey } from "../auth/apiKey";
import z from "zod";
import { knex } from "../knexfile";
import { getSectionFieldsAsZodSchema } from "../sections/section-fields";
import { getSectionsInfo } from "../sections/sections";

export const sisIngestRouter = express.Router();

sisIngestRouter.get("/sections", maybeAttachApiKey, requireApiKey, async (request: Request, res: Response) => {
    res.json(await getSectionsInfo(knex));
})

sisIngestRouter.post('/sections', maybeAttachApiKey, requireApiKey, async (request: Request, res: Response) => {

    const schema = await getSectionFieldsAsZodSchema(knex);

    const result = await schema.safeParseAsync(request.body);

    if (!result.success) {
        return res.status(400).json({
            error: "Invalid request body",
            details: z.treeifyError(result.error)
        })
    }

    const trx = await knex.transaction()

    try {
        await trx.table("section_field_value").delete();
        await trx.table("section").delete();

        const sections: Array<any> = result.data;

        const sectionInserts = sections.map(s => ({ id: s.id }));
        if (sectionInserts.length > 0) await trx("section").insert(sectionInserts);

        const sectionFieldValueInserts = sections.flatMap(s => {
            const fields = [];
            for (const key in s) {
                if (key == "id") continue;
                fields.push({
                    section_id: s.id,
                    field_name: key,
                    value: s[key]
                })
            }
            return fields;
        });
        if (sectionFieldValueInserts.length > 0) await trx("section_field_value").insert(sectionFieldValueInserts);

        await trx.commit();
        res.json(await getSectionsInfo(knex));
    } catch (e) {
        await trx.rollback();
    }
})