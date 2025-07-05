export default async (limit, offset, hotel_id, start_date, end_date, is_free)=>{
    const instance = global.pg_instance;     

    let where = `WHERE hotel_id = ? `;
    let parameters = [hotel_id];

    //свободные номера на дату
    if(is_free){        
        where += `AND r.room_id NOT IN (SELECT room_id
										FROM public.active_bookings 
										WHERE date_range && daterange(?,?))`;
        parameters.push(start_date, end_date);
    }    

    parameters.push(limit, offset);
 
    return (await instance.raw(
        `SELECT r.room_id, r.name, r.description, r.area, r.hotel_id, f.number as floor
         FROM public.rooms r
         INNER JOIN public.floors f ON r.floor_id = f.floor_id
         ${where}
         LIMIT ?
         OFFSET ?`, parameters)).rows;
}
