export default async (limit, offset)=>{
    const instance = global.pg_instance;  
    return (await instance.raw(
        `SELECT hotel_id, name, description, address
         FROM public.hotels
         LIMIT ?
         OFFSET ?`, [limit, offset])).rows;
}