import express from "express";

const http_port = 8888;
const app = express();

app.listen(http_port, ()=> {
    console.log(`server started, port: ${http_port}`);
});