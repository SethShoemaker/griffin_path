import express, { Request, Response } from "express";
import { maybeAttachApiKey, requireApiKey } from "../auth/apiKey";
import z from "zod";
import { knex } from "../knexfile";

export const sisIngestRouter = express.Router();

sisIngestRouter.post('/sections', maybeAttachApiKey, requireApiKey, async (request: Request, res: Response) => {

    const schema = z.array(z.object({
        sis_id: z.string(),
        course_code: z.string(),
        section_code: z.string(),
        term_code: z.string(),
        credits: z.int(),
        tags: z.array(z.object({
            sis_id: z.string(),
            name: z.string(),
            display_publically: z.boolean()
        })),
        academic_year: z.string(),
        academic_term: z.string(),
        title: z.string(),
        meetings_text: z.string(),
        instructor_text: z.string(),
        open_seats_text: z.string()
    }))
        .superRefine((sections, ctx) => {
            const seen = new Set<string>();
            for (const section of sections) {
                if (seen.has(section.sis_id)) {
                    ctx.addIssue({
                        code: "custom",
                        message: "sis_id must be unique",
                        input: section.sis_id
                    })
                }
                seen.add(section.sis_id)
            }
        })
        .superRefine((sections, ctx) => {
            const seen = new Set<string>();
            for (const section of sections) {
                if (seen.has(section.section_code)) {
                    ctx.addIssue({
                        code: "custom",
                        message: "section_code must be unique",
                        input: section.section_code
                    })
                }
                seen.add(section.section_code)
            }
        })
        .superRefine((sections, ctx) => {
            for (const section of sections) {
                const seen = new Set<string>();
                for (const tag of section.tags) {
                    if (seen.has(tag.name)) {
                        ctx.addIssue({
                            code: "custom",
                            message: "section tags must be unique",
                            input: tag.name
                        })
                    }
                    seen.add(tag.name)
                }
            }
        });

    const result = await schema.safeParseAsync(request.body)

    if (!result.success) {
        return res.status(400).json({
            error: "Invalid request body",
            details: z.treeifyError(result.error)
        })
    }

    const trx = await knex.transaction()
    try {
        await trx.table("section_tag").delete()
        await trx.table("section").delete()

        for (const section of result.data) {
            const sectionRecordId = (await trx
                .table("section")
                .insert({
                    sis_id: section.sis_id,
                    course_code: section.course_code,
                    section_code: section.section_code,
                    term_code: section.term_code,
                    credits: section.credits,
                    academic_year: section.academic_year,
                    academic_term: section.academic_term,
                    title: section.title,
                    meetings_text: section.meetings_text,
                    instructor_text: section.instructor_text,
                    open_seats_text: section.open_seats_text
                })
                .returning("id"))
            [0].id;

            for (const tag of section.tags) {
                await trx
                    .table("section_tag")
                    .insert({
                        sis_id: tag.sis_id,
                        section_id: sectionRecordId,
                        name: tag.name,
                        display_publically: tag.display_publically,
                    })
            }
        }

        await trx.commit()

        res.status(201).json({
            "message": "sections sucessfully uploaded"
        })
    } catch (e) {
        await trx.rollback()
        console.log(e)
        res.status(400).json({
            "message": "error while saving sections"
        });
    }
})