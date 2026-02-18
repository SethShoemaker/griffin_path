import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema
        .createTable("section", (table) => {
            table.string('id').primary().notNullable();
        })
        .createTable("section_field", (table) => {
            table.string("name").primary().notNullable();
            table.string("type").notNullable();
            table.boolean("unique").notNullable();
            table.boolean("required").notNullable();
            table.boolean("public").notNullable();
        })
        .createTable("section_field_value", (table) => {
            table.string("section_id").notNullable().references("section.id");
            table.string("field_name").notNullable().references("section_field.name");
            table.string("value");
            table.primary(["section_id", "field_name"]);
        })
        .createTable("section_field_usage", (table) => {
            table.string("id").primary().notNullable();
            table.string("field_name").references("section_field.name").notNullable();
            table.boolean("public").notNullable();
            table.string("description").notNullable();
        });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema
        .dropTable("section_field_value")
        .dropTable("section_field_usage")
        .dropTable("section_field")
        .dropTable("section");
}

