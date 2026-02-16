import { SectionFieldDefinition } from "./definition";
import { SectionFieldType } from "./type";

export const sisIdSectionFieldDefinition = new SectionFieldDefinition(
    "SIS ID",
    SectionFieldType.text,
    false,
    true,
    true
);

export const prebuiltSectionFieldDefinitions = [
    sisIdSectionFieldDefinition
];