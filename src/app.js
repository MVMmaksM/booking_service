import express from "express";
import app_config from "./config/app.dev.js";
import create_instance from "./db/create_instance.js";
import db_init from "./db/db_init.js";
import errors_handler from "./middlewares/errors_handler.js";
import authorization from "./middlewares/authorization.js"; 

const http_port = app_config.http_port || 8888;
const app = express();
app.use(express.json());

//авторизация
app.use("/", authorization);

//обработка ошибок
app.use("/", errors_handler)

app.listen(http_port, async()=> {
    console.log(`server started, port: ${http_port}`);
    global.pg_instance = create_instance();  
    //await db_init(global.pg_instance);  
});