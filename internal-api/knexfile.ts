import type { Knex } from "knex";
import _knex from "knex";

export const config: { [key: string]: Knex.Config } = {
  development: {
    client: "better-sqlite3",
    connection: {
      filename: "./local_data/classmap.db"
    },
    useNullAsDefault: true,
  },
};
export default config;

export const knex = _knex(config["development"]);
