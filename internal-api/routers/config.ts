import express, { Request, Response } from "express";
import { maybeAttachApiKey, requireApiKey } from "../auth/apiKey";
import { SectionFieldType } from "../sections/type";
import * as z from "zod";
import { knex } from "../knexfile";
import { getNumberPublicSectionFieldUsages, getNumberSectionFieldUsages, getSectionFieldsInfo } from "../sections/section-fields";
import { anySectionsExist, sectionFieldHasAnyDuplicates, sectionWithoutFieldExists } from "../sections/sections";
import { UpdateCollector } from "../helpers/updateCollector";

export const configRouter = express.Router();

configRouter.get('/sections', maybeAttachApiKey, requireApiKey, async (request: Request, res: Response) => {
    res.json(await getSectionFieldsInfo(knex));
});

configRouter.post('/sections', maybeAttachApiKey, requireApiKey, async (request: Request, res: Response) => {

    const schema = z.array(z.object({
        name: z.string().refine((value) => value !== "id", { message: "the 'id' field cannot be specified, it is a system level field", }),
        type: z.enum(Object.values(SectionFieldType)),
        public: z.boolean(),
        unique: z.boolean(),
        required: z.boolean()
    }));

    const validation = schema.safeParse(request.body);
    if (!validation.success) {
        return res.status(400).json(z.treeifyError(validation.error));
    }

    const trx = await knex.transaction();

    try {

        const newFields = validation.data;
        const oldFields = await getSectionFieldsInfo(trx);

        const issues = new Array<z.core.$ZodIssue>();
        const updateCollector = new UpdateCollector(trx, "section_field", "name");
        const inserts = new Array<{ name: string, type: string, public: boolean, unique: boolean, required: boolean }>();

        for (const [newFieldIndex, newField] of newFields.entries()) {

            const oldField = oldFields.find(oldField => oldField.name == newField.name);

            if (oldField === undefined) {
                if (newField.required && await anySectionsExist(trx)) {
                    issues.push({
                        code: "custom",
                        path: [newFieldIndex, "required"],
                        message: `cannot make new required field when sections already exist`,
                    });
                } else {
                    inserts.push({
                        name: newField.name,
                        type: newField.type,
                        public: newField.public,
                        unique: newField.unique,
                        required: newField.required
                    });
                }
                continue;
            }

            if (oldField.type != newField.type) {
                issues.push({
                    code: "custom",
                    path: [newFieldIndex, "type"],
                    message: "cannot change type of field once it has been made",
                });
            }

            if (!oldField.public && newField.public) {
                updateCollector.for(newField.name).set("public", true);
            } else if (oldField.public && !newField.public) {
                if (await getNumberPublicSectionFieldUsages(newField.name, trx) > 0) {
                    issues.push({
                        code: "custom",
                        path: [newFieldIndex, "public"],
                        message: "field still has public usages, cannot remove its public status",
                    });
                } else {
                    updateCollector.for(newField.name).set("public", false);
                }
            }

            if (!oldField.unique && newField.unique) {
                if (await sectionFieldHasAnyDuplicates(newField.name, trx)) {
                    issues.push({
                        code: "custom",
                        path: [newFieldIndex, "unique"],
                        message: "cannot make field unique, there are some duplicate values already"
                    });
                } else {
                    updateCollector.for(newField.name).set("unique", true);
                }
            } else if (oldField.unique && !newField.unique) {
                updateCollector.for(newField.name).set("unique", false);
            }

            if (!oldField.required && newField.required) {
                if (await sectionWithoutFieldExists(newField.name, trx)) {
                    issues.push({
                        code: "custom",
                        path: [newFieldIndex, "required"],
                        message: "cannot make field required, there are one or more sections missing this field"
                    });
                } else {
                    updateCollector.for(newField.name).set("required", true);
                }
            } else if (oldField.required && !newField.required) {
                updateCollector.for(newField.name).set("required", false);
            }
        }

        const deletes = oldFields
            .filter(oldField => newFields.find(newDef => newDef.name == oldField.name) == undefined)
            .map(oldField => oldField.name);

        for (const fieldDelete of deletes) {
            if (await getNumberSectionFieldUsages(fieldDelete, trx) > 0) {
                issues.push({
                    code: "custom",
                    path: [newFields.length, "name"],
                    message: "cannot delete field because it is still being used"
                });
            }
        }

        if (issues.length > 0) {
            await trx.rollback();
            return res.status(400).json(z.treeifyError(new z.ZodError(issues)));
        }

        if (deletes.length > 0) {
            await trx("section_field_value").whereIn("field_name", deletes).delete();
            await trx("section_field").whereIn("name", deletes).delete();
        }

        if (inserts.length > 0) await trx("section_field").insert(inserts);
        if (updateCollector.hasUpdates()) await updateCollector.execute();

        await trx.commit();
        res.json(await getSectionFieldsInfo(knex));

    } catch {
        await trx.rollback();
    }
});
