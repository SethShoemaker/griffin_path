import { SectionFieldType } from "./type";
import { convertSectionFieldTypeToZod } from "./section-fields";
import z from "zod";
import { Knex } from "knex";
import { tableName } from "../helpers/database-tables";

export async function getSectionsInfo(knex: Knex | Knex.Transaction): Promise<Record<string, any>[]> {
    const rows = await knex(tableName("section"))
        .join(tableName("section_field"), "section.id", "=", "section.id")
        .leftJoin(tableName("section_field_value"), (join) => {
            join.on("section.id", "=", "section_field_value.section_id");
            join.on("section_field.id", "=", "section_field_value.field_id")
        })
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
    const numSections = Number((await knex(tableName("section")).count("* as count"))[0].count);
    return numSections > 0;
}

export async function sectionFieldHasAnyDuplicates(fieldName: string, knex: Knex | Knex.Transaction): Promise<boolean> {
    const dupCheck = await knex(tableName("section_field_value"))
        .where("field_name", '=', fieldName)
        .groupBy("value")
        .havingRaw("COUNT(section_id) > 1",)
        .count();

    return dupCheck.length > 0;
}

export async function sectionWithoutFieldExists(fieldName: string, knex: Knex | Knex.Transaction): Promise<boolean> {
    const sectionMissingField = await knex(tableName("section"))
        .joinRaw("LEFT JOIN " + tableName("section_field_value") + " ON section.id = section_field_value.section_id AND section_field_value.field_name = ?", fieldName)
        .whereNull('section_field_value.value')
        .select("section.id")
        .first();
    return sectionMissingField !== undefined;
}
