const db_config = {
    client: 'pg',
    pool: {min: 0, max: 10 },
    connection: {
        host: "postgres",
        port: "5432",
        user: "admin",
        database: "bookings",
        password: "123456"
    }
}

export default db_config;