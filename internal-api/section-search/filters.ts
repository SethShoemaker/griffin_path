import { Knex } from "knex";
import { sectionSearchFilterType } from "./filter-type";

export async function getSectionSearchFilters(knex: Knex | Knex.Transaction): Promise<Record<string,any>[]> {

    return await knex
        .table("section_search_filter")
        .leftJoin("section_search_text_search_filter", "section_search_filter.name", "=", "section_search_text_search_filter.filter_name")
        .leftJoin("section_search_multi_select_or_filter", "section_search_filter.name", "=", "section_search_multi_select_or_filter.filter_name")
        .orderBy("section_search_filter.position")
        .select<{
            filter_name: string,
            filter_slug: string,
            filter_type: string,
            text_search_filter_field_name: string,
            multi_select_or_filter_field_name: string
        }[]>([
            "section_search_filter.name AS filter_name",
            "section_search_filter.slug AS filter_slug",
            "section_search_filter.type AS filter_type",
            "section_search_text_search_filter.field_name AS text_search_filter_field_name",
            "section_search_multi_select_or_filter.field_name AS multi_select_or_filter_field_name"
        ])
        .then(rows => Promise.all(rows.map(async row => {

            let typeInfo: Record<string, any>;

            switch (row.filter_type) {
                case sectionSearchFilterType.textSearch.id:
                    typeInfo = {
                        fieldName: row.text_search_filter_field_name
                    }
                    break;
                case sectionSearchFilterType.multiSelectOr.id:
                    typeInfo = {
                        fieldName: row.multi_select_or_filter_field_name,
                        inputOptions: await knex
                            .table("section_field_value")
                            .where("field_name", "=", row.multi_select_or_filter_field_name)
                            .orderBy("value")
                            .distinct()
                            .select("value")
                            .then(rows => rows.map(row => row.value))
                    }
                    break;
                default:
                    throw new Error(`unhandled section search filter type: ${row.filter_type}`)
            };

            return {
                name: row.filter_name,
                slug: row.filter_slug,
                type: row.filter_type,
                ...typeInfo
            }
        })));
}