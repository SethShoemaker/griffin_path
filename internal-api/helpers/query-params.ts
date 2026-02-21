import { Request } from "express";

export function queryParamValueArray(queryParam: string, request: Request): Array<string> {
    const query = request.query[queryParam];

    if (!query) {
        return [];
    }

    if (Array.isArray(request.query[queryParam])) {
        // @ts-ignore
        return query;
    }

    return [query.toString()];
}