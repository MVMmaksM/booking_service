export default async (err, req, res, next)=>{ 
    return res.status(err.status_code || 500).json(
        {       
            status_code: err.status_code || 500,        
            details: err.details || err.message || "Внутренняя ошибка"
        });     
}