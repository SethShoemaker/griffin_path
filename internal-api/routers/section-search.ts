import express, { Request, Response } from "express";
import { maybeAttachApiKey, requireApiKey } from "../auth/apiKey";
import { knex } from "../knexfile";
import { getSectionSearchColumns } from "../section-search/columns";
import { getSectionSearchFilters } from "../section-search/filters";
import { sectionSearchFilterType } from "../section-search/filter-type";
import { sectionSearchCache } from "../section-search/cache";
import { queryParamValueArray } from "../helpers/query-params";

export const sectionSearchRouter = express.Router();

sectionSearchRouter.get("/sections", maybeAttachApiKey, requireApiKey, async (request: Request, res: Response) => {

    const [columns, filters] = await Promise.all([
        getSectionSearchColumns(knex),
        getSectionSearchFilters(knex)
    ]);

    let sections = [...sectionSearchCache.sections];

    for (const filter of filters) {
        switch (filter.type) {
            case sectionSearchFilterType.textSearch:
                break;
            case sectionSearchFilterType.multiSelectOr:
                const values = queryParamValueArray(filter.slug, request);
                if (values.length > 0) {
                    sections = sections.filter(section => {
                        for (const value of values) {
                            if (section[filter.data.fieldName] == value) {
                                return true;
                            }
                        }
                        return false;
                    });
                }
                break;
            default:
                throw new Error(`unhandled section search filter type ${filter.type.id}`);
        }
    }

    // @ts-ignore
    const page = Math.max(parseInt(request.query.page) || 1, 1);
    // @ts-ignore
    const perPage = Math.min(Math.max(parseInt(request.query.per_page) || 25, 1), 100);

    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;

    const total = sections.length;
    const totalPages = Math.ceil(total / perPage);

    sections = sections.slice(startIndex, endIndex);

    res.json({
        page: page,
        perPage: perPage,
        totalPages: totalPages,
        totalRecords: total,
        pageRecords: sections.length,
        records: sections,
        filters: filters,
        columns: columns,
    })
})