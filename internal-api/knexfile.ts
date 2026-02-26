import type { Knex } from "knex";
import _knex from "knex";
import dotenv from 'dotenv';
dotenv.config({ quiet: true })

export const config: { [key: string]: Knex.Config } = {
  development: {
    client: "better-sqlite3",
    connection: {
      filename: "./local_data/classmap.db"
    },
    useNullAsDefault: true,
  },
  production: {
    client: "mssql",
    connection: {
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 1433,
      user: process.env.DB_USER || 'sa',
      password: process.env.DB_PASSWORD || 'sa',
      database: process.env.DB_NAME || 'database',
      options: {
        encrypt: false,
        trustServerCertificate: true
      }
    },
    migrations: {
      schemaName: process.env.DB_SCHEMA || 'dbo'
    },
    searchPath: [process.env.DB_SCHEMA || 'dbo'],
  }
};
export default config;

export const knex = _knex(config["production"]);
