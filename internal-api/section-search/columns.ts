import { Knex } from "knex";
import { sectionSearchColumnType } from "./column-type";
import { tableName } from "../helpers/database-tables";

export async function getSectionSearchColumns(knex: Knex | Knex.Transaction): Promise<Record<string, any>[]> {
    return knex
        .table(tableName("section_search_column"))
        .leftJoin(tableName("section_search_basic_column"), "section_search_column.id", "=", "section_search_basic_column.column_id")
        .leftJoin(tableName("section_field AS basic_field"), "section_search_basic_column.field_id", "=", "basic_field.id")
        .orderBy("section_search_column.position")
        .select<{
            column_id: number,
            column_name: string,
            column_type: string,
            basic_column_field_name: string,
        }[]>([
            "section_search_column.id AS column_id",
            "section_search_column.name AS column_name",
            "section_search_column.type AS column_type",
            "basic_field.name AS basic_column_field_name",
        ])
        .then(rows => rows.map(row => {

            const genericInfo = {
                id: row.column_id,
                name: row.column_name,
                type: row.column_type,
            };

            let typeInfo: object;

            switch (row.column_type) {
                case sectionSearchColumnType.basic.id:
                    typeInfo = {
                        field: row.basic_column_field_name
                    };
                    break;
                default:
                    throw new Error(`unhandled section search column type: ${row.column_type}`)
            };

            return {...genericInfo, ...typeInfo};
        }));
}