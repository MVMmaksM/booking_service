import get_rooms from "./room.service.js";
import express from "express";
const router = express.Router();

router.get("/", async(req, res, next)=>{
    try{
        const hotel_id = req.query.hotel_id;
        const limit = req.query.limit;
        const offset = req.query.offset;
          
        //если нужны свободные номера
        const is_free = req.query.is_free;    
        //даты 
        const start_on_tz = req.query.start_on_tz;
        const finish_on_tz = req.query.finish_on_tz;

        const result = await get_rooms(limit, offset, hotel_id, start_on_tz, finish_on_tz, is_free);
        res.json(result);
    }
    catch(err){
        next(err);
    }
});


export default router;