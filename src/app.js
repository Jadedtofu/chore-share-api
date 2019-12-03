require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const roomiesRouter = require('./roomies/roomies-router');
// const choresRouter = require('./chores/chores-router');

const app = express();

// const morganOption = (process.env.NODE_ENV === 'production')
const morganOption = (NODE_ENV === 'production')
    ? 'tiny'
    : 'common';

const { CLIENT_ORIGIN } = require('./config');

app.use(morgan(morganOption));
app.use(
    cors({
        origin: CLIENT_ORIGIN
    })
);
app.use(helmet());

app.use('/api/roomies', roomiesRouter);
// app.use('/api/chores', choresRouter);

app.get('/api/*', (req, res) => {
    res.json({ok: 'ok'});
});


app.use((error, req, res, next) => {
    let response;
    // if (process.env.NODE_ENV === 'production') {
    if (NODE_ENV === 'production') {
        response = { error: { message: 'server error'}}
    } else {
        console.error(error);
        response = { message: error.message, error}
    }
    res.status(500).json(response);
});

module.exports = app;
