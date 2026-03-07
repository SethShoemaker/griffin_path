import { Worker, isMainThread, parentPort } from "node:worker_threads";
import { getSectionSearchColumns } from "../section-search/columns";
import { getSectionSearchFilters } from "../section-search/filters";
import { getSectionsInfo } from "../sections/sections";
import { knex } from "../knexfile";

export const sectionSearchCache: { data: SectionSearchCacheData | null } = {
    data: null
};

export type SectionSearchCacheData = {
    sections: Record<string, any>[],
    columns: Record<string, any>[],
    filters: Record<string, any>[]
}

export async function updateCache(): Promise<void> {
    sectionSearchCache.data = await getSectionSearchCacheData();
}

export async function getSectionSearchCacheData(): Promise<SectionSearchCacheData> {
    return new Promise((resolve, reject) => {
        const worker = new Worker(__filename);
        worker.on('message', resolve);
        worker.once('error', reject);
        worker.once('exit', (code) => {
            if (code !== 0)
                reject(new Error(`Worker stopped with exit code ${code}`));
        });
    });
};

if (!isMainThread) {
    Promise.all([
        getSectionSearchColumns(knex),
        getSectionSearchFilters(knex),
        getSectionsInfo(knex),
    ])
    .then((returns): SectionSearchCacheData => ({
        columns: returns[0],
        filters: returns[1],
        sections: returns[2]
    }))
    .then((cacheData) => parentPort!.postMessage(cacheData));
}