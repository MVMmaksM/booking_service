import db_config from "../config/db.dev.js";
import knex from "knex";

export default () => {
    return new knex(db_config);
};