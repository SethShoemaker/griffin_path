import { SectionFieldType } from "./field-definitions/type";
import { SectionField } from "./fields/field";
import { TextSectionField } from "./fields/text-field";

export class Section {

    /**
     * Map from field name to SectionField
     */
    protected _fields = new Map<string, SectionField>();

    /**
     * Determines if a section has a field
     * @param fieldName
     */
    public hasField(fieldName: string): boolean {
        return this._fields.has(fieldName);
    }

    /**
     * Gets a field value
     * @param fieldName 
     */
    public getField(fieldName: string): any | null | undefined {
        const field = this._fields.get(fieldName);
        if (field === undefined) {
            throw new Error(`field ${fieldName} does not exist on section`)
        }
        return field.value;
    }

    /**
     * Converts a complex section object, with all of its custom fields, to a simple javascript object
     */
    public get basicObject(): object {
        const basicObject: Record<string, any> = {};
        for (const field of this._fields.values()) {
            basicObject[field.name] = field.value;
        }
        return basicObject;
    }

    /**
     * Adds a field to this section
     * @param field the field to add
     */
    public addField(field: SectionField) {
        this._fields.set(field.name, field);
    }

    /**
     * sets a field value
     * @param fieldName the name of the field to update
     * @param newValue the new value of the field
     */
    public setField(fieldName: string, newValue: any) {
        const field = this._fields.get(fieldName);
        if (field == undefined) {
            throw new Error(`field of name "${fieldName}" does not exist on this section`);
        }
        switch (field.type) {
            case SectionFieldType.text:
                this._fields.set(fieldName, new TextSectionField(
                    fieldName,
                    field.displayPublically,
                    newValue
                ));
                break;
            default:
                throw new Error(`unhandled field type ${field.type}`)
        }
    }

    /**
     * Removes a field
     * @param fieldName the field to remove
     */
    public removeField(fieldName: string) {
        this._fields.delete(fieldName);
    }
}