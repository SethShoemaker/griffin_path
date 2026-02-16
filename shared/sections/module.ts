import { SectionFieldDefinition } from "./field-definitions/definition";
import { SectionFieldDefinitions } from "./field-definitions/definitions";
import { prebuiltSectionFieldDefinitions } from "./field-definitions/prebuilt";
import { SectionFieldType } from "./field-definitions/type";
import { NumberSectionField } from "./fields/number-field";
import { TextSectionField } from "./fields/text-field";
import { Section } from "./section";

export class SectionsModule {

    public constructor() {
        this._fieldDefinitions = new SectionFieldDefinitions();
        prebuiltSectionFieldDefinitions.forEach(def => this._fieldDefinitions.addDefinition(def));
        this._sections = [];
    }

    protected _fieldDefinitions: SectionFieldDefinitions;

    public getFieldDefinitions(): SectionFieldDefinition[] {
        return this._fieldDefinitions.getDefinitions()
    }

    public addFieldDefinition(definition: SectionFieldDefinition) {
        this._fieldDefinitions.addDefinition(definition);
        this._sections.forEach(section => {
            switch (definition.type) {
                case SectionFieldType.text:
                    section.addField(new TextSectionField(
                        definition.name,
                        definition.displayPublically,
                        undefined
                    ));
                case SectionFieldType.number:
                    section.addField(new NumberSectionField(
                        definition.name,
                        definition.displayPublically,
                        undefined
                    ));
                default:
                    throw new Error(`unhandled field type "${definition.type}"`);
            }
        });
    }

    public removeFieldDefinition(fieldName: string) {
        this._fieldDefinitions.removeDefinition(fieldName);
        this._sections.forEach(section => section.removeField(fieldName));
    }

    protected _sections: Array<Section>;

    public getSections(): object[] {
        return [...this._sections].map(section => section.basicObject);
    }

    public addSection(section: Record<string, any>): Section {

        const singleCheck = this._fieldDefinitions.sectionSchema().safeParse(section);
        if (!singleCheck.success) {
            throw new Error(singleCheck.error.message);
        }

        const arr = this._sections.map(s => s.basicObject);

        const newSection = new Section();
        this._fieldDefinitions.getDefinitions().forEach(fieldDefinition => {
            switch (fieldDefinition.type) {
                case SectionFieldType.text:
                    newSection.addField(new TextSectionField(
                        fieldDefinition.name,
                        fieldDefinition.displayPublically,
                        section[fieldDefinition.name as keyof typeof section],
                    ));
                    break;
                case SectionFieldType.number:
                    newSection.addField(new TextSectionField(
                        fieldDefinition.name,
                        fieldDefinition.displayPublically,
                        section[fieldDefinition.name as keyof typeof section],
                    ));
                    break;
                default:
                    throw new Error(`unhandled field type ${fieldDefinition.type}`)
            }
        });
        arr.push(newSection.basicObject);

        const multiCheck = this._fieldDefinitions.sectionsSchema().safeParse(arr);
        if (!multiCheck.success) {
            throw new Error(multiCheck.error.message);
        }

        this._sections.push(newSection);
        return newSection;
    }
}