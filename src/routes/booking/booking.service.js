import AppError from "../../errors/app_error.js";
import begin_transaction from "../../db/begin_transaction.js";
import commit_transaction from "../../db/commit_transaction.js";

//бронирование номера
const booking_room = async(user_id, start_on_tz, finish_on_tz, room_id)=>{
    //проверить, является ли пользователь vip
    const response = await fetch(`http://remote_service:8889/api/v1/user?user_id=${user_id}`);
    if(!response.ok)
        throw new AppError(response.status, `Ошибка проверки пользователя на vip: ${response}`);
    
    const is_vip = (await response.json()).is_vip;   

    const instance = global.pg_instance;    

    //проверяем забронирован ли номер на указанные даты
    const is_booking = (await instance.raw(
                `SELECT 1
                 FROM public.bookings b
                 WHERE room_id = ? 
                 AND (b.start_on_tz, b.finish_on_tz) OVERLAPS (?, ?)
                 AND cancel_on_tz IS NULL`, 
                 [room_id, start_on_tz, finish_on_tz])).rows[0];

    if(is_booking)
        throw new AppError(400, "Номер уже забронирован на указанные даты");

    await begin_transaction(instance);

    const booking_id = (await instance.raw(`SELECT nextval('bookings_booking_id_seq')`))?.rows[0]?.nextval;
    await instance.raw(
        `INSERT INTO public.bookings (booking_id, created_by, start_on_tz, finish_on_tz, room_id, is_vip)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [booking_id, user_id, start_on_tz, finish_on_tz, room_id, is_vip]);

    const booking = (await instance.raw(
        `SELECT booking_id, created_on_tz, start_on_tz, finish_on_tz, is_vip
         FROM public.bookings
         WHERE booking_id = ?`, [booking_id])).rows[0];

    await commit_transaction(instance);
    
    return booking;
}

//отмена брони
const cancel_booking = async(user_id, booking_id)=>{
    const instance = global.pg_instance;

    const booking = (await instance.raw(
        `SELECT created_by, cancel_on_tz
        FROM public.bookings
        WHERE booking_id = ?`,
        [booking_id])).rows[0];

    if(!booking)
        throw new AppError(404, "Бронь не найдена");

    if(booking.created_by != Number(user_id))
        throw new AppError(403, "Нет доступа к указанной брони");

    if(booking.cancel_booking)
        throw new AppError(400, "Указанная бронь уже отменена");

    await begin_transaction(instance);
    
    await instance.raw(
        `UPDATE public.bookings
         SET cancel_on_tz = now() AT TIME ZONE 'utc'
         WHERE booking_id = ?`,
        [booking_id]);

    const cancel_booking = (await instance.raw(
        `SELECT booking_id, cancel_on_tz
        FROM public.bookings
        WHERE booking_id = ?`, 
        [booking_id])).rows[0];
    
    await commit_transaction(instance);

    return cancel_booking;
}

const get_bookings = async(limit, offset, user_id)=>{
    const instance = global.pg_instance;

    return (await instance.raw(`
        SELECT booking_id, created_on_tz, start_on_tz, finish_on_tz, cancel_on_tz, is_vip
        FROM public.bookings
        WHERE created_by = ?
        LIMIT ?
        OFFSET ?`,
        [user_id, limit, offset])).rows;
}

export {booking_room, cancel_booking, get_bookings};