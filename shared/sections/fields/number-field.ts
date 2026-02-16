import { SectionField } from "./field";
import { SectionFieldType } from "../field-definitions/type";

export class NumberSectionField extends SectionField {

    public get type(): SectionFieldType {
        return SectionFieldType.text;
    }

    protected _value: number|null|undefined;
    public get value(): number|null|undefined {
        return this.value;
    }

    public constructor(name: string, displayPublically: boolean, value: number|null|undefined) {
        super(name, displayPublically);
        this._value = value;
    }
}