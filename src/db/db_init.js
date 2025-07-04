import db_config from "../config/db.dev.js";
import begin_transaction from "./begin_transaction.js";
import commit_transaction from "./commit_transaction.js";

export default async (instance)=>{
    await begin_transaction(instance);

    /*const db_exists = (await instance.raw(`select null from pg_catalog.pg_database where datname='${db_config.connection.database}'`)).rows;
    if(db_exists.length == 0)
        await instance.raw(`create database ${db_config.connection.database}`);*/

    //создаем таблицы
    await instance.raw(`
            CREATE TABLE public.hotels (
                    hotel_id serial4 NOT NULL,
                    "name" varchar(50) NOT NULL,
                    description varchar(1000) NULL,
                    address varchar(100) NOT NULL,
                    CONSTRAINT pk_hotels PRIMARY KEY (hotel_id)
                );

            CREATE TABLE public.floors (
                    floor_id serial4 NOT NULL,
                    "number" int2 NOT NULL,
                    CONSTRAINT pk_floors PRIMARY KEY (floor_id),
                    CONSTRAINT uq_number UNIQUE (number)
                );
                
            CREATE TABLE public.rooms (
                    room_id serial4 NOT NULL,
                    "name" varchar(100) NOT NULL,
                    description varchar(1000) NULL,
                    area int4 NULL,
                    hotel_id int4 NOT NULL,
                    floor_id int4 NOT NULL,
                    CONSTRAINT pk_rooms PRIMARY KEY (room_id)
                );
           
            ALTER TABLE public.rooms ADD CONSTRAINT rooms_floor_id_fkey FOREIGN KEY (floor_id) REFERENCES public.floors(floor_id);
            ALTER TABLE public.rooms ADD CONSTRAINT rooms_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES public.hotels(hotel_id);
            
            CREATE TABLE public.users (
                    user_id serial4 NOT NULL,
                    login varchar(100) NOT NULL,
                    "password" varchar(100) NOT NULL,
                    phone varchar(10) NOT NULL,
                    created_on_tz timestamp DEFAULT (now() AT TIME ZONE 'utc'::text) NOT NULL,
                    fio varchar(100) NOT NULL,
                    CONSTRAINT pk_users PRIMARY KEY (user_id),
                    CONSTRAINT uq_login UNIQUE (login),
                    CONSTRAINT uq_phone UNIQUE (phone)
                );

            CREATE TABLE public.bookings (
                    booking_id serial4 NOT NULL,
                    created_on_tz timestamp DEFAULT (now() AT TIME ZONE 'utc'::text) NOT NULL,
                    created_by int4 NOT NULL,
                    start_on_tz timestamp NOT NULL,
                    finish_on_tz timestamp NOT NULL,
                    cancel_on_tz timestamp NULL,
                    room_id int4 NOT NULL,
                    CONSTRAINT pk_bookings PRIMARY KEY (booking_id)
                );

            ALTER TABLE public.bookings ADD CONSTRAINT bookings_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(room_id);
            ALTER TABLE public.bookings ADD CONSTRAINT bookings_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(user_id);`);

    //добавляем данные
    await instance.raw(`INSERT INTO hotels (hotel_id, name, description, address) 
                        VALUES(1, 'Тестовый отель 5 звезд', 'Супер отель', 'г. Курган, ул. Тестовая, д.33'),
                        (2, 'Тестовый отель 3 звезды', 'Отель недалеко от моря', 'г. Курган, ул. Ленина, д.54');

                        --добавляем этажи
                        FOR i IN 1..10 LOOP
                            INSERT INTO floors (floor_id, number)	
                            VALUES(i, i);
                        END LOOP;	

                        --добавляем номера для 1 отеля
                        FOR i IN 1..5 LOOP 
                            INSERT INTO rooms (room_id, name, description, area, hotel_id, floor_id)
                            VALUES (i, 'Тестовый номер с видом на море с ' || i || ' звездами', 'Номер с видом на море и чайником', 10 + i, 1, floor(random() * 10) + 1);
                        END LOOP;

                        --добавляем этажи для 2 отеля
                        FOR i IN 6..10 LOOP 
                            INSERT INTO rooms (room_id, name, description, area, hotel_id, floor_id)
                            VALUES (i, 'Тестовый номер с видом на море с ' || i || ' звездами', 'Номер с видом на море и чайником', 15 + i, 2, floor(random() * 10) + 1);
                        END LOOP;

                        -- добавляем юзеров
                        INSERT INTO users (user_id, login, password, phone, fio)
                        VALUES (1, 'test', 'md5hashpassword', '9004561212', 'testoviy user'),
                        (2, 'test_1', 'md5hashpassword', '9004561213', 'testoviy user_1');

                        -- добавляем одну бронь на 1 номер 1 юзера
                        INSERT INTO bookings (booking_id, created_by, start_on_tz, finish_on_tz, room_id)
                        VALUES (1, 1, '2025-07-04 10:14:40.600', '2025-07-10 10:14:40.600', 1);`);

    await commit_transaction(instance);
}