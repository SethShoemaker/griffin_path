import type { Knex } from "knex";

const TABLE_NAME = 'section_tag';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable(TABLE_NAME, (table) => {
        table.increments('id').notNullable().unique().primary()
        table.string('sis_id').notNullable().unique()
        table.integer('section_id').notNullable().references('section.id')
        table.string('name').notNullable()
        table.boolean('display_publically').notNullable()
        table.unique(['section_id', 'name'])
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists(TABLE_NAME);
}

