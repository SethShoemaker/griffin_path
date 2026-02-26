export function tableName(tableName: string): string {
    return `${process.env.DB_SCHEMA ? process.env.DB_SCHEMA + '.' : ''}${tableName}`
}