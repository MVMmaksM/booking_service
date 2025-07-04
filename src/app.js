import express from "express";
import app_config from "./config/app.dev.js";
import create_instance from "./db/create_instance.js";
import db_init from "./db/db_init.js";

const http_port = app_config.http_port || 8888;
const app = express();

app.listen(http_port, async()=> {
    console.log(`server started, port: ${http_port}`);
    global.pg_instance = create_instance();  
    //await db_init(global.pg_instance);  
});