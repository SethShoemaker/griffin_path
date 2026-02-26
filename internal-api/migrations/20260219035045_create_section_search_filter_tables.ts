import type { Knex } from "knex";
import { tableName } from "../helpers/database-tables";


export async function up(knex: Knex): Promise<void> {
    return knex.schema
        .withSchema(process.env.DB_SCHEMA || 'dbo')
        .createTable("section_search_filter", (table) => {
            table.increments('id').primary().notNullable();
            table.string("name").notNullable().unique();
            table.string("slug").notNullable().unique();
            table.integer("position").checkPositive().unique().notNullable();
            table.string("type").notNullable();
        })
        .createTable("section_search_filter_section_field_usage", (table) => {
            table.integer("filter_id").notNullable().references("id").inTable(tableName("section_search_filter"));
            table.integer("field_usage_id").notNullable().references("id").inTable(tableName("section_field_usage"));
            table.primary(["filter_id", "field_usage_id"]);
        })
        .createTable("section_search_text_search_filter", (table) => {
            table.integer("filter_id").primary().notNullable().references("id").inTable(tableName("section_search_filter"));
            table.integer("field_id").notNullable().references("id").inTable(tableName("section_field"));
        })
        .createTable("section_search_multi_select_or_filter", (table) => {
            table.integer("filter_id").primary().notNullable().references("id").inTable(tableName("section_search_filter"));
            table.integer("field_id").notNullable().references("id").inTable(tableName("section_field"));
        });
}


export async function down(knex: Knex): Promise<void> {

    const sectionSearchFilterFieldUsages = await knex
        .table(tableName("section_search_filter_section_field_usage"))
        .select("field_usage_id")
        .then(rows => rows.map(row => row.field_usage_id));

    await knex.schema
        .dropTable(tableName("section_search_multi_select_or_filter"))
        .dropTable(tableName("section_search_text_search_filter"))
        .dropTable(tableName("section_search_filter_section_field_usage"))
        .dropTable(tableName("section_search_filter"));

    // don't leave any orphaned field usage records
    await knex(tableName("section_field_usage"))
        .whereIn("id", sectionSearchFilterFieldUsages)
        .delete();
}

