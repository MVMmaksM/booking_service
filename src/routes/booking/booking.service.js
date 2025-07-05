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
                 FROM public.active_bookings 
                 WHERE room_id = ? 
                 AND date_range && daterange(?, ?)`, 
                 [room_id, start_date, end_date])).rows[0];

    if(is_booking)
        throw new AppError(400, "Номер уже забронирован на указанные даты");

    await begin_transaction(instance);

    const booking_id = (await instance.raw(`SELECT nextval('active_bookings_booking_id_seq')`))?.rows[0]?.nextval;    
    await instance.raw(
        `INSERT INTO public.active_bookings (booking_id, created_by, date_range, room_id, is_vip)
         VALUES (?, ?, daterange(?, ?), ?, ?)`,
        [booking_id, user_id, start_date, end_date, room_id, is_vip]);

    const booking = (await instance.raw(
        `SELECT 
            booking_id, 
            created_on_tz, 
            lower(date_range) AS start_date, 
            upper(date_range) AS end_date, 
            is_vip
         FROM public.active_bookings
         WHERE booking_id = ?`, [booking_id])).rows[0];

    await commit_transaction(instance);
    
    return booking;
}

//отмена брони
const cancel_booking = async(user_id, booking_id)=>{
    const instance = global.pg_instance;

    const booking = (await instance.raw(
        `SELECT 
            booking_id,
            created_on_tz,
            created_by,
            room_id,
            date_range,
            is_vip
        FROM public.active_bookings
        WHERE booking_id = ?`,
        [booking_id])).rows[0];

    if(!booking)
        throw new AppError(404, "Бронь не найдена");

    if(booking.created_by != Number(user_id))
        throw new AppError(403, "Нет доступа к указанной брони");   

    await begin_transaction(instance);   

    //говнокод
    //преносим бронь в закрытые 
    await instance.raw(`
        INSERT INTO public.cancel_bookings 
        (
            cancel_booking_id,             
            created_on_tz, 
            created_by, 
            room_id,
            date_range,
            is_vip
        )
        VALUES(?, ?, ?, ?, ?, ?)`,
        [booking.booking_id, booking.created_on_tz, booking.created_by, booking.room_id, booking.date_range, booking.is_vip]);


    //удаляем бронь из активных
    await instance.raw(`DELETE FROM public.active_bookings
                        WHERE booking_id = ?`,
                        [booking.booking_id]);   

    //отдаем юзеру инфу о закрытой брони
    const cancel_booking = (await instance.raw(
        `SELECT cancel_booking_id, cancel_on_tz
        FROM public.cancel_bookings
        WHERE cancel_booking_id = ?`, 
        [booking.booking_id])).rows[0];
    
    await commit_transaction(instance);

    return cancel_booking;
}

const get_bookings = async(limit, offset, user_id)=>{
    const instance = global.pg_instance;

    return (await instance.raw(`
        SELECT res.*
        FROM
            (SELECT 
                booking_id AS booking_id, 
                created_on_tz, 
                lower(date_range) AS start_date, 
                upper(date_range) AS end_date, 
                room_id,
                is_vip,
                null AS cancel_on_tz
            FROM public.active_bookings
            WHERE created_by = ?
            UNION ALL
            SELECT 
                cancel_booking_id AS booking_id, 
                created_on_tz, 
                lower(date_range) AS start_date, 
                upper(date_range) AS end_date,
                room_id, 
                is_vip,
                cancel_on_tz
            FROM public.cancel_bookings
            WHERE created_by = ?) res
        ORDER BY res.booking_id
        LIMIT ?
        OFFSET ?`,
        [user_id, user_id, limit, offset])).rows;
}

export {booking_room, cancel_booking, get_bookings};