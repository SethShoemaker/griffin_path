import { SectionFieldType } from "../sections/type";

export type SectionSearchFilterType = { id: string, label: string, description: string, fieldTypes: Array<any> };

export const sectionSearchFilterType: Record<string, SectionSearchFilterType> = {
    textSearch: {
        id: "text_search",
        label: "Text Search",
        description: "A generic text search",
        fieldTypes: [
            SectionFieldType.text
        ]
    },
    multiSelectOr: {
        id: "multi_select_or",
        label: "Multi Select (OR)",
        description: "A dropdown selection which filters for sections which have any one of the selected values",
        fieldTypes: [
            SectionFieldType.text
        ]
    }
}
