import { booking_room, cancel_booking, get_bookings } from "./booking.service.js";
import express from "express";
const router = express.Router();

router.post("/", async(req, res, next)=>{
    try{
        //кто бронирует
        const user_id = req.headers["authorization"];
        //даты бронирования
        const start_on_tz = req.body.start_on_tz;
        const finish_on_tz = req.body.finish_on_tz;
        //номер
        const room_id = req.body.room_id;

        const result = await booking_room(user_id, start_on_tz, finish_on_tz, room_id);
        res.json(result);
    }
    catch(err){
        next(err);
    }
});

router.post("/cancel/:booking_id", async(req, res, next)=>{
    try{
        const booking_id = req.params.booking_id;
        const user_id = req.headers["authorization"];

        const result = await cancel_booking(user_id, booking_id);
        res.json(result);
    }
    catch(err){
        next(err);
    }
});

router.get("/", async(req, res, next)=>{
    try{
        const limit = req.query.limit;
        const offset = req.query.offset;
        const user_id = req.headers["authorization"];       

        const result = await get_bookings(limit, offset, user_id);
        res.json(result);
    }
    catch(err){
        next(err);
    }
});

export default router;