import get_hotels from "./hotel.service.js";
import express from "express";
const router = express.Router();

router.get("/", async (req, res, next)=>{
    try{
        const limit = req.query.limit;
        const offset = req.query.offset;

        const result = await get_hotels(limit, offset);
        res.json(result);
    }
    catch(err){
        next(err);
    }
});

export default router;