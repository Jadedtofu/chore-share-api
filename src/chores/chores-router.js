const path = require('path');
const express = require('express');
const xss = require('xss');
const logger = require('../logger');
const ChoresService = require('./chores-service');

const choresRouter = express.Router();
const jsonParser = express.json();

const serializedChore = chore => ({
    id: chore.id,
    chore: xss(chore.chore),
    roomie_id: chore.roomie_id
});

choresRouter
    .route('/')
    .get((req, res, next) => {
        ChoresService.getAllChores(
            req.app.get('db')
        )
        .then(chores => {
            res.json(chores.map(serializedChore));
        })
        .catch(next);
    });

module.exports = choresRouter;