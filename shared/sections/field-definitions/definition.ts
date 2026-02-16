import { SectionFieldType } from "./type";

export class SectionFieldDefinition {

    protected _name: string;
    public get name(): string {
        return this._name;
    }

    protected _type: SectionFieldType;
    public get type(): SectionFieldType {
        return this._type;
    }

    protected _displayPublically: boolean;
    public get displayPublically(): boolean {
        return this._displayPublically;
    }

    protected _unique: boolean;
    public get unique(): boolean {
        return this._unique;
    }

    protected _required: boolean;
    public get required(): boolean {
        return this._required;
    }

    public constructor(name: string, type: SectionFieldType, displayPublically: boolean, unique: boolean, required: boolean) {
        this._name = name;
        this._type = type;
        this._displayPublically = displayPublically;
        this._unique = unique;
        this._required = required;
    }
}