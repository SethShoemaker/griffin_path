export class SectionTag {

    protected _sisId: string;
    public get sisId(): string {
        return this._sisId;
    }

    protected _name: string;
    public get name(): string {
        return this._name;
    }

    protected _displayPublically: boolean;
    public get displayPublically(): boolean {
        return this._displayPublically;
    }

    public constructor(
        sisId: string,
        name: string,
        displayPublically: boolean
    ) {
        this._sisId = sisId;
        this._name = name;
        this._displayPublically = displayPublically;
    }
}