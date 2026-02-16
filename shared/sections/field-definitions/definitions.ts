import { SectionFieldDefinition } from "./definition";
import { SectionFieldType } from "./type";
import * as z from "zod";

export class SectionFieldDefinitions {

    protected _fields = new Map<string, SectionFieldDefinition>();

    public definitionExists(name: string): boolean {
        return this._fields.has(name);
    }

    public addDefinition(definition: SectionFieldDefinition) {
        if (this.definitionExists(definition.name)) {
            throw new Error(`a "${definition.name}" field definition already exists`);
        }
        this._fields.set(definition.name, definition);
    }

    public removeDefinition(name: string) {
        this._fields.delete(name);
    }

    public getDefinitions(): SectionFieldDefinition[] {
        return [...this._fields.values()];
    }

    /**
     * Gets a Zod schema that applies to a single section
     * @returns the ZodObject object which represents the schema for a single section
     */
    public sectionSchema(): z.ZodObject {
        return z.object(Object.fromEntries(this.getDefinitions().map((field) => {
            const key = field.name;

            let value;

            switch (field.type) {
                case SectionFieldType.text:
                    value = z.string()
                    break;
                case SectionFieldType.number:
                    value = z.number();
                    break;
                default:
                    throw new Error(`unhandled field type ${field.type}`)
            }

            if (!field.required) {
                value = z.optional(value);
            }

            return [key, value];
        })));
    }

    /**
     * Gets a zod schema which applies to an array of all sections
     * @returns the ZodArray object which represents the schema for all of the sections
     */
    public sectionsSchema(): z.ZodArray {

        let zod = z.array(this.sectionSchema());

        const definitions = this.getDefinitions();

        // unique fields
        definitions
            .filter(def => def.unique)
            .forEach(def => {
                zod = zod.refine(
                    (sections) => {
                        const values = sections.map(s => s[def.name]);
                        return new Set(values).size === values.length;
                    },
                    {
                        message: `${def.name} values must be unique`,
                        path: [def.name],
                    }
                );
            });

        return zod;
    }
}
