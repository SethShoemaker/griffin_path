import { Knex } from "knex";
import { getSectionsInfo } from "../sections/sections";

export class SectionSearchCache {

    sections = new Array<Record<string, any>>();

    async update(knex: Knex | Knex.Transaction): Promise<void> {
        this.sections = await getSectionsInfo(knex);
    }
}

export const sectionSearchCache = new SectionSearchCache();