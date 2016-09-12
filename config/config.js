module.exports = {
    PORT: 8081,
    signKey: "REAL_SECRED_FOR_JWT_TOKEN",
    secret: "REAL_SECRED_FOR_PASSWORD_HASH",
    db: "scoreapp",
    userName: "REAL_USERNAME",
    userPassword: "REAL_PASSWORD",
    host: 'localhost',
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },
    corsOptions: {
        origin: ["https://smygmi-server.ddns.net"]
    }
};