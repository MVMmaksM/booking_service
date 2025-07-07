import AppError from "../../errors/app_error.js";
import begin_transaction from "../../db/begin_transaction.js";
import commit_transaction from "../../db/commit_transaction.js";

//бронирование номера
const booking_room = async(user_id, start_date, end_date, room_id)=>{
    //проверить, является ли пользователь vip
    const response = await fetch(`http://remote_service:8889/api/v1/user?user_id=${user_id}`);
    if(!response.ok)
        throw new AppError(response.status, `Ошибка проверки пользователя на vip: ${response}`);
    
    const is_vip = (await response.json()).is_vip;   

    const instance = global.pg_instance;    

    //проверяем забронирован ли номер на указанные даты
    const is_booking = (await instance.raw(
                `SELECT 1
                 FROM public.bookings 
                 WHERE room_id = ? 
                 AND date_range && daterange(?, ?)
                 AND cancel_on_tz IS NULL`, 
                 [room_id, start_date, end_date])).rows[0];

    if(is_booking)
        throw new AppError(400, "Выбранный номер уже забронирован на указанные даты");

    await begin_transaction(instance);

    const booking_id = (await instance.raw(`SELECT nextval('bookings_booking_id_seq')`))?.rows[0]?.nextval;    
    await instance.raw(
        `INSERT INTO public.bookings (booking_id, created_by, date_range, room_id, is_vip)
         VALUES (?, ?, daterange(?, ?), ?, ?)`,
        [booking_id, user_id, start_date, end_date, room_id, is_vip]);

    const booking = (await instance.raw(
        `SELECT 
            booking_id, 
            created_on_tz, 
            lower(date_range) AS start_date, 
            upper(date_range) AS end_date, 
            is_vip
         FROM public.bookings
         WHERE booking_id = ?`, [booking_id])).rows[0];

    await commit_transaction(instance);
    
    return booking;
}

//отмена брони
const cancel_booking = async(user_id, booking_id)=>{
    const instance = global.pg_instance;

    const booking = (await instance.raw(
        `SELECT booking_id, created_by, cancel_on_tz          
        FROM public.bookings
        WHERE booking_id = ?`,
        [booking_id])).rows[0];

    if(!booking)
        throw new AppError(404, "Бронь не найдена");

    if(booking.created_by != Number(user_id))
        throw new AppError(403, "Нет доступа к указанной брони");   

    //тут бы сравнивать часовые пояса отеля и юзера,
    //т.к. по часовому поясу отеля бронь может уже наступила,
    //а по часовому поясу юзера еще нет, может ли юзер отменить
    //такую бронь?
    if(booking.cancel_on_tz)
        throw new AppError(400, "Выбранная бронь уже отменена");

    await begin_transaction(instance);
    
    //отмена
    await instance.raw(
        `UPDATE public.bookings
        SET cancel_on_tz = now () AT TIME ZONE 'utc'
        WHERE booking_id = ?`,
        [booking.booking_id]);        

    //отдаем юзеру инфу о отмененной брони
    const cancel_booking = (await instance.raw(
        `SELECT booking_id, cancel_on_tz
        FROM public.bookings
        WHERE booking_id = ?`, 
        [booking.booking_id])).rows[0];
    
    await commit_transaction(instance);

    return cancel_booking;
}

const get_bookings = async(limit, offset, user_id)=>{
    const instance = global.pg_instance;

    return (await instance.raw(`
        SELECT 
                booking_id, 
                created_on_tz, 
                lower(date_range) AS start_date, 
                upper(date_range) AS end_date, 
                room_id,
                is_vip,
                cancel_on_tz
        FROM public.bookings
        WHERE created_by = ?           
        ORDER BY booking_id
        LIMIT ?
        OFFSET ?`,
        [user_id, limit, offset])).rows;
}

export {booking_room, cancel_booking, get_bookings};