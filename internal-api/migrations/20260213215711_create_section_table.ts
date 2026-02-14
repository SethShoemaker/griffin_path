import type { Knex } from "knex";


const TABLE_NAME = "section";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable(TABLE_NAME, (table) => {
        table.increments('id').notNullable().unique().primary()
        table.string('sis_id').notNullable().unique()
        table.string('course_code').notNullable()
        table.string('section_code').notNullable().unique()
        table.string('term_code').notNullable()
        table.integer('credits').notNullable()
        table.string('academic_year').notNullable()
        table.string('academic_term').notNullable()
        table.string('title').notNullable()
        table.string('meetings_text')
        table.string('instructor_text')
        table.string('open_seats_text')
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists(TABLE_NAME);
}

