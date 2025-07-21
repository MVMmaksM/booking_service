import express from "express";

const app = express();
app.use(express.json());

const http_port = 8889;

app.get("/api/v1/user", async(req, res)=>{
    const user_id = req.query.user_id;

    const result = user_id == 2 ? {is_vip: true} : {is_vip: false};
    res.json(result);
});

app.listen(http_port, ()=>{
    console.log(`remote service started, port ${http_port}`);
});