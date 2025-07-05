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
<br>для получения списка свободных номеров нужно передать **is_free, start_on_tz, finish_on_tz**: http://localhost:8888/api/v1/room?limit=200&offset=0&hotel_id=2&is_free=1&start_on_tz=2026-08-05T00:00:00.000Z&finish_on_tz=2026-08-05T00:00:00.000Z
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
    "room_id": 1,
    "start_on_tz": "2026-08-05T00:00:00.000Z",
    "finish_on_tz": "2026-08-10T00:00:00.000Z"
}
```

```
//ответ
{
    "booking_id": 1,
    "created_on_tz": "2025-07-05T15:10:46.100Z",
    "start_on_tz": "2026-08-05T00:00:00.000Z",
    "finish_on_tz": "2026-08-10T00:00:00.000Z",
    "is_vip": true
}
```

5. роут: post http://localhost:8888/api/v1/booking/cancel/:booking_id - отменяет бронь, **:booking_id - идентификатор брони**.

```
//ответ
{
    "booking_id": 1,
    "cancel_on_tz": "2025-07-05T15:11:45.074Z"
}
```
7. роут: get http://localhost:8888/api/v1/booking?limit=200&offset=0 - возвращает список броней юзера, **параметры limit, offset обязательные**.

```
//ответ
[
    {
        "booking_id": 1,
        "created_on_tz": "2025-07-05T15:10:46.100Z",
        "start_on_tz": "2026-08-05T00:00:00.000Z",
        "finish_on_tz": "2026-08-10T00:00:00.000Z",
        "cancel_on_tz": "2025-07-05T15:11:45.074Z",
        "is_vip": true
    }
]
```
