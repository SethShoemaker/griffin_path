import { SectionTag } from "./tag";

export class Section {

    protected _sisId: string;
    public get sisId(): string {
        return this._sisId;
    }

    protected _courseCode: string;
    public get courseCode(): string {
        return this._courseCode;
    }

    protected _sectionCode: string;
    public get sectionCode(): string {
        return this._sectionCode;
    }

    protected _termCode: string;
    public get termCode(): string {
        return this.termCode;
    }

    protected _credits: number;
    public get credits(): number {
        return this._credits;
    }

    protected _tags: SectionTag[];
    public get tags(): SectionTag[] {
        return [...this.tags];
    }

    protected _academicYear: string;
    public get academicYear(): string {
        return this._academicYear;
    }

    protected _academicTerm: string;
    public get academicTerm(): string {
        return this._academicTerm;
    }

    protected _title: string;
    public get title(): string {
        return this._title;
    }

    protected _meetingsText: string;
    public get meetingsText(): string {
        return this._meetingsText;
    }

    protected _instructorText: string;
    public get instructorText(): string {
        return this._instructorText;
    }

    protected _openSeatsText: string;
    public get openSeatsText(): string {
        return this._openSeatsText;
    }

    public constructor(
        sisId: string,
        courseCode: string,
        sectionCode: string,
        termCode: string,
        credits: number,
        tags: SectionTag[],
        academicYear: string,
        academicTerm: string,
        title: string,
        meetingsText: string,
        instructorText: string,
        openSeatsText: string,
    ) {
        this._sisId = sisId;
        this._courseCode = courseCode;
        this._sectionCode = sectionCode;
        this._termCode = termCode;
        this._credits = credits;
        this._tags = tags;
        this._academicYear = academicYear;
        this._academicTerm = academicTerm;
        this._title = title;
        this._meetingsText = meetingsText;
        this._instructorText = instructorText;
        this._openSeatsText = openSeatsText;
    }
}