import express from "express";
import app_config from "./config/app.dev.js";
import create_instance from "./db/create_instance.js";
import errors_handler from "./middlewares/errors_handler.js";
import authorization from "./middlewares/authorization.js"; 
import hotel_router from "./routes/hotel/hotel.routes.js";
import rooms_router from "./routes/room/room.routes.js";
import booking_router from "./routes/booking/booking.routes.js";

const http_port = app_config.http_port || 8888;
const app = express();
app.use(express.json());

//авторизация
app.use("/", authorization);

app.use("/api/v1/hotel", hotel_router);
app.use("/api/v1/room", rooms_router);
app.use("/api/v1/booking", booking_router);

//обработка ошибок
app.use("/", errors_handler)

app.listen(http_port, async()=> {
    console.log(`server started, port: ${http_port}`);
    global.pg_instance = create_instance();
});