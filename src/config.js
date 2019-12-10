module.exports = {
    PORT: process.env.PORT || 8000,
    API_BASE_URL: process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api",
    NODE_ENV: process.env.NODE_ENV || 'development',
    DB_URL: process.env.DB_URL || 'postgresql://choreshare_user:chore@localhost/choreshare',
    TEST_DB_URL: process.env.TEST_DB_URL || 'postgresql://choreshare_user:chore@localhost/choreshare-test'
}