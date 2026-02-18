import z from "zod";
import { SectionFieldType } from "./type";
import { Knex } from "knex";

export async function getSectionFieldsInfo(knex: Knex | Knex.Transaction): Promise<{ name: string, type: SectionFieldType, public: boolean, unique: boolean, required: boolean }[]> {
    const rows = await knex<{ name: string, type: string, public: number, unique: number, required: number }>("section_field")
        .select([
            "name",
            "type",
            "public",
            "unique",
            "required"
        ]);

    rows.push({
        "name": "id",
        "type": "text",
        "public": 0,
        "unique": 1,
        "required": 1
    });

    return rows.map(r => ({
        name: r.name,
        type: SectionFieldType[r.type as keyof typeof SectionFieldType],
        public: r.public == 1,
        unique: r.unique == 1,
        required: r.required == 1,
    }));
}

export async function getSectionFieldsAsZodSchema(knex: Knex | Knex.Transaction): Promise<z.ZodArray> {

    const rows = await knex<{ name: string, type: string, unique: number, required: number }>("section_field")
        .select([
            "name",
            "type",
            "unique",
            "required"
        ]);

    rows.push({
        name: "id",
        type: "text",
        unique: 0,
        required: 1
    });

    const fields = rows.map(r => ({
        name: r.name,
        type: r.type,
        unique: r.unique == 1,
        required: r.required == 1,
    }))

    let zod = z.array(z.object(Object.fromEntries(fields.map(field => {
        const key = field.name;
        let value = convertSectionFieldTypeToZod(SectionFieldType[field.type as keyof typeof SectionFieldType]);
        if (!field.required) {
            value = z.nullable(value);
        }
        return [key, value];
    }))));

    fields
        .filter(field => field.unique)
        .forEach(field => {
            zod = zod.refine(
                (sections) => {
                    const values = sections.map(s => s[field.name]);
                    return new Set(values).size === values.length;
                },
                {
                    message: `${field.name} values must be unique`,
                    path: [field.name],
                }
            );
        })

    return zod;
}

export function convertSectionFieldTypeToZod(sectionFieldType: SectionFieldType): z.ZodType {
    switch (sectionFieldType) {
        case SectionFieldType.text:
            return z.string();
        case SectionFieldType.number:
            return z.coerce.number();
        case SectionFieldType.checkbox:
            return z.boolean();
        case SectionFieldType.date:
            return z.iso.date();
        case SectionFieldType.datetime:
            return z.iso.datetime();
        case SectionFieldType.time:
            return z.iso.time();
        default:
            throw new Error(`unhandled field type ${sectionFieldType}`)
    }
}

export async function getNumberSectionFieldUsages(fieldName: string, knex: Knex | Knex.Transaction): Promise<number> {
    return Number((await knex
        .table("section_field_usage")
        .where("field_name", "=", fieldName)
        .count("* as count")
    )[0].count);
}

export async function getNumberPublicSectionFieldUsages(fieldName: string, knex: Knex | Knex.Transaction): Promise<number> {
    return Number((await knex
        .table("section_field_usage")
        .where("field_name", "=", fieldName)
        .where("public", "=", true)
        .count("* as count")
    )[0].count);
}
