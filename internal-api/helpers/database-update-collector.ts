import { Knex } from "knex";

export class UpdateCollector {
    private updates = new Map<string, Record<string, any>>();

    constructor(
        private knex: Knex | Knex.Transaction,
        private tableName: string,
        private keyColumn: string
    ) {}

    for(key: string) {
        if (!this.updates.has(key)) {
            this.updates.set(key, {});
        }

        const row = this.updates.get(key)!;

        return {
            set: (column: string, value: any) => {
                row[column] = value;
                return this.for(key);
            }
        };
    }

    hasUpdates(): boolean {
        return this.updates.size > 0;
    }

    async execute(): Promise<void> {
        if (!this.hasUpdates()) return;

        const keys = [...this.updates.keys()];
        const allColumns = new Set<string>();

        for (const update of this.updates.values()) {
            Object.keys(update).forEach(col => allColumns.add(col));
        }

        const updateObject: Record<string, any> = {};

        for (const column of allColumns) {
            const cases: string[] = [];
            const bindings: any[] = [];

            for (const [key, update] of this.updates.entries()) {
                if (column in update) {
                    cases.push(`WHEN ? THEN ?`);
                    bindings.push(key, update[column]);
                }
            }

            if (cases.length > 0) {
                updateObject[column] = this.knex.raw(
                    `CASE ${this.keyColumn} ${cases.join(" ")} ELSE ${column} END`,
                    bindings
                );
            }
        }

        await this.knex(this.tableName)
            .whereIn(this.keyColumn, keys)
            .update(updateObject);
    }
}
