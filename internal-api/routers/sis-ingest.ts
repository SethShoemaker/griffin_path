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
        if (sectionInserts.length > 0) await knex.batchInsert("section", sectionInserts, 100).transacting(trx);

        const fieldNameToIdMap = await trx
            .table("section_field")
            .select<{ id: number, name: string }[]>(["id", "name"])
            .then(rows => rows.reduce((map: Map<string, number>, row) => map.set(row.name, row.id), new Map));

        const sectionFieldValueInserts = sections.flatMap(section => {
            const fields = new Array<{ section_id: number, field_id: number, value: string | null }>();
            for (const fieldName in section) {
                if (fieldName == "id") continue;
                fields.push({
                    section_id: section.id,
                    field_id: fieldNameToIdMap.get(fieldName),
                    value: section[fieldName]
                })
            }
            return fields;
        });
        if (sectionFieldValueInserts.length > 0) await knex.batchInsert("section_field_value", sectionFieldValueInserts, 100).transacting(trx);

        await trx.commit();
        res.json(await getSectionsInfo(knex));
    } catch (e) {
        res.status(500).send("internal error");
        await trx.rollback();
    }
})