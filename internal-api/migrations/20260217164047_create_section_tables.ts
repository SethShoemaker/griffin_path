import type { Knex } from "knex";
import { tableName } from "../helpers/database-tables";


export async function up(knex: Knex): Promise<void> {
    return knex.schema
        .withSchema(process.env.DB_SCHEMA || 'dbo')
        .createTable("section", (table) => {
            table.string('id').primary().notNullable();
        })
        .createTable("section_field", (table) => {
            table.increments('id').primary().notNullable();
            table.string("name").notNullable().unique();
            table.string("type").notNullable();
            table.boolean("unique").notNullable();
            table.boolean("required").notNullable();
            table.boolean("public").notNullable();
        })
        .createTable("section_field_value", (table) => {
            table.string("section_id").notNullable().references("id").inTable(tableName("section"));
            table.integer("field_id").notNullable().references("id").inTable(tableName("section_field"));
            table.text("value");
            table.primary(["section_id", "field_id"]);
        })
        .createTable("section_field_usage", (table) => {
            table.increments("id").primary().notNullable();
            table.integer("field_id").references("id").inTable(tableName("section_field")).notNullable();
            table.boolean("public").notNullable();
            table.string("description").notNullable();
        });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema
        .dropTable(tableName("section_field_value"))
        .dropTable(tableName("section_field_usage"))
        .dropTable(tableName("section_field"))
        .dropTable(tableName("section"));
}

