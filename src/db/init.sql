DO $$
    BEGIN     
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

            create table active_bookings
                (
                    booking_id serial4 not null,
                    created_on_tz timestamp DEFAULT (now() AT TIME ZONE 'utc'::text) NOT NULL,
                    created_by int not null,	
                    room_id int not null,
                    date_range daterange not null,
                    is_vip bool default false,
                    CONSTRAINT pk_bookings_booking_id primary key (booking_id),
                    CONSTRAINT uq_active_bookings_room_id_date_range UNIQUE(room_id, date_range)
                );

                ALTER TABLE public.active_bookings ADD CONSTRAINT active_bookings_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(room_id);
                ALTER TABLE public.active_bookings ADD CONSTRAINT active_bookings_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(user_id);
                --create index idx_active_bookings on active_bookings using gist (date_range_booking)

                create table cancel_bookings
                (                   
                    cancel_booking_id int not null,
                    created_on_tz timestamp NOT NULL,
                    created_by int not null,	
                    room_id int not null,
                    date_range daterange not null,
                    cancel_on_tz timestamp DEFAULT (now() AT TIME ZONE 'utc'::text) NOT NULL,
                    is_vip bool default false,
                    CONSTRAINT pk_cancel_bookings primary key (cancel_booking_id)                    
                );

            ALTER TABLE public.cancel_bookings ADD CONSTRAINT cancel_bookings_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(room_id);
            ALTER TABLE public.cancel_bookings ADD CONSTRAINT cancel_bookings_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(user_id);

            INSERT INTO hotels (hotel_id, name, description, address) 
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

END
$$;