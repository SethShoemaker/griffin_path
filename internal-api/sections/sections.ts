import { SectionFieldType } from "./type";
import { convertSectionFieldTypeToZod } from "./section-fields";
import z from "zod";
import { Knex } from "knex";

export async function getSectionsInfo(knex: Knex | Knex.Transaction): Promise<Record<string, any>[]> {
    const rows = await knex("section")
        .joinRaw("JOIN section_field")
        .joinRaw("LEFT JOIN section_field_value ON section.id = section_field_value.section_id AND section_field.name = section_field_value.field_name")
        .select([
            "section.id",
            "section_field.name",
            "section_field.required",
            "section_field.type",
            "section_field_value.value",
        ]);

    return Object.entries(Object.groupBy(rows, row => row.id))
        .map(group => {
            const section: Record<string, any> = {
                id: group[0]
            }
            for (const row of group[1]!) {
                if (row["name"] != null) {
                    const sectionFieldType = SectionFieldType[row["type"] as keyof typeof SectionFieldType];
                    let zod = convertSectionFieldTypeToZod(sectionFieldType);
                    if (row["required"] != 1) zod = z.nullable(zod);
                    section[row["name"]] = zod.parse(row["value"]);
                }
            }
            return section;
        });
}

export async function anySectionsExist(knex: Knex | Knex.Transaction): Promise<boolean> {
    const numSections = Number((await knex("section").count("* as count"))[0].count);
    return numSections > 0;
}

export async function sectionFieldHasAnyDuplicates(fieldName: string, knex: Knex | Knex.Transaction): Promise<boolean> {
    const dupCheck = await knex("section_field_value")
        .where("field_name", '=', fieldName)
        .groupBy("value")
        .havingRaw("COUNT(section_id) > 1",)
        .count();

    return dupCheck.length > 0;
}

export async function sectionWithoutFieldExists(fieldName: string, knex: Knex | Knex.Transaction): Promise<boolean> {
    const sectionMissingField = await knex("section")
        .joinRaw("LEFT JOIN section_field_value ON section.id = section_field_value.section_id AND section_field_value.field_name = ?", fieldName)
        .whereNull('section_field_value.value')
        .select("section.id")
        .first();
    return sectionMissingField !== undefined;
}
