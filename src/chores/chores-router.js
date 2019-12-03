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
    })
    .post(jsonParser, (req, res, next) => {
        const { chore, roomie_id } = req.body;
        const newChore = { chore, roomie_id };
        
        for(const [key, value] of Object.entries(newChore)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body`}
                });
            }
        }
        ChoresService.insertChore(
            req.app.get('db'),
            newChore
        )
        .then(chore => {
            logger.info(`Chore with id ${chore.id} created`)
            res.status(201)
                .location(path.posix.join(req.originalUrl, `/${chore.id}`))
                .json(serializedChore(chore));
        })
        .catch(next);
    });

choresRouter


module.exports = choresRouter;