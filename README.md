# booking_service
## Инструкция по запуску

1. Клонируем репозиторий
2. Выполняем команду: docker-compose -f docker-compose.dev.yml up --build
3. При билде в БД создаются таблицы и заполняются тестовыми данными, добавляются 2 юзера с user_id: 1 и user_id: 2 - vip
 

## Проверка

1. Для каждого роута в хедере указываем: ```authorization: user_id``` (1 или 2)
2. роут: get http://localhost:8888/api/v1/hotel?limit=200&offset=0 - возвращает список отелей, **параметры limit, offset обязательные**.

```
//ответ
[
    {
        "hotel_id": 1,
        "name": "Тестовый отель 5 звезд",
        "description": "Супер отель",
        "address": "г. Курган, ул. Тестовая, д.33"
    },
    {
        "hotel_id": 2,
        "name": "Тестовый отель 3 звезды",
        "description": "Отель недалеко от моря",
        "address": "г. Курган, ул. Ленина, д.54"
    }
]
```
3. роут: get http://localhost:8888/api/v1/room?limit=200&offset=0&hotel_id=2 - возвращает список номеров отеля, **параметры limit, offset, hotel_id обязательные**; 
<br>для получения списка свободных номеров нужно передать **is_free, start_date, end_date**: http://localhost:8888/api/v1/room?limit=200&offset=0&hotel_id=1&start_date=2022-10-01&end_date=2022-10-06
```
//ответ
[
    {
        "room_id": 6,
        "name": "Тестовый номер с видом на море с 6 звездами",
        "description": "Номер с видом на море и чайником",
        "area": 21,
        "hotel_id": 2,
        "floor": 2
    },
    {
        "room_id": 7,
        "name": "Тестовый номер с видом на море с 7 звездами",
        "description": "Номер с видом на море и чайником",
        "area": 22,
        "hotel_id": 2,
        "floor": 10
    }
]
```
4. роут: post http://localhost:8888/api/v1/booking - бронирует номер на указанные даты, 
 
```
//body
{
    "room_id": 2,
    "start_date": "2023-10-05",
    "end_date": "2023-10-10"
}
```

```
//ответ
{
    "booking_id": 34,
    "created_on_tz": "2025-07-05T19:24:13.504Z",
    "start_date": "2023-10-05T00:00:00.000Z",
    "end_date": "2023-10-10T00:00:00.000Z",
    "is_vip": false
}
```

5. роут: post http://localhost:8888/api/v1/booking/cancel/:booking_id - отменяет бронь, **:booking_id - идентификатор брони**.

```
//ответ
{
    "booking_id": 34,
    "cancel_on_tz": "2025-07-07T06:33:01.981Z"
}
```
7. роут: get http://localhost:8888/api/v1/booking?limit=200&offset=0 - возвращает список броней юзера, **параметры limit, offset обязательные**.

```
//ответ
[
    {
        "booking_id": 1,
        "created_on_tz": "2025-07-05T19:02:47.046Z",
        "start_date": "2022-11-05T00:00:00.000Z",
        "end_date": "2022-11-10T00:00:00.000Z",
        "room_id": 1,
        "is_vip": true,
        "cancel_on_tz": "2025-07-05T19:06:23.019Z"
    },
    {
        "booking_id": 2,
        "created_on_tz": "2025-07-05T19:03:01.440Z",
        "start_date": "2022-10-05T00:00:00.000Z",
        "end_date": "2022-10-10T00:00:00.000Z",
        "room_id": 1,
        "is_vip": true,
        "cancel_on_tz": null
    }
]
```
