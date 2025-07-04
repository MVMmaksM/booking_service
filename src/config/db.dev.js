const db_config = {
    client: 'pg',
    pool: {min: 0, max: 10 },
    connection: {
        host: "localhost",
        port: "5432",
        user: "admin",
        database: "articles",
        password: "123456"
    }
}

export default db_config;