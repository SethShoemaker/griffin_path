import { SectionFieldType } from "../field-definitions/type";

export abstract class SectionField {

    public abstract get type(): SectionFieldType;

    public abstract get value(): any|null|undefined;

    protected _name: string;
    public get name(): string {
        return this._name;
    }

    protected _displayPublically: boolean;
    public get displayPublically(): boolean {
        return this._displayPublically;
    }

    protected constructor(name: string, displayPublically: boolean) {
        this._name = name;
        this._displayPublically = displayPublically;
    }
}