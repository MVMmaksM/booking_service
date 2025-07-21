import AppError from "../errors/app_error.js";

//примитивная авторизация, просто проверяем существование юзера по ид
export default async (req, res, next)=>{
    try{ 
        const user_id = req.headers["authorization"];

        if(!user_id)
            throw new AppError(401, "Не передан user_id");

        const instance = global.pg_instance;
        const user = (await instance.raw(`SELECT user_id FROM users WHERE user_id = ?`, [user_id])).rows;        

        if (user.length == 0)
            throw new AppError(404, "Пользователь не найден");
        
        next();
    }
    catch(err){
        next(err);
    }
}