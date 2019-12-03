const path = require('path');
const express = require('express');
const xss = require('xss');
const logger = require('../logger');
const RoomiesService = require('./roomies-service');

const roomiesRouter = express.Router();
const jsonParser = express.json();

const serializedRoomie = roomie => ({
    id: roomie.id,
    name: xss(roomie.name),
    note: xss(roomie.note)
});

roomiesRouter
    .route('/')
    .get((req, res, next) => {
        RoomiesService.getAllRoomies(
            req.app.get('db')
        )
        .then(roomies => {
            res.json(roomies.map(serializedRoomie));
        })
        .catch(next);
    })
    .post(jsonParser, (req, res, next) => {
        const { name, note } = req.body;
        const newRoomie = { name, note };
        
        for(const [key, value] of Object.entries(newRoomie)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body`}
                });
            }
        }
        RoomiesService.insertRoomie(
            req.app.get('db'),
            newRoomie
        )
        .then(roomie => {
            logger.info(`Roomie with id ${roomie.id} created`)
            res.status(201)
                .location(path.posix.join(req.originalUrl, `/${roomie.id}`))
                .json(serializedRoomie(roomie));
        })
        .catch(next);
    });

roomiesRouter
    .route('/:roomie_id')
    .all((req, res, next) => {
        RoomiesService.getById(
            req.app.get('db'),
            req.params.roomie_id
        )
        .then(roomie => {
            if(!roomie) {
                return res.status(404).json({
                    error: { message: `Roomie doesn't exist`}
                });
            }
            res.roomie = roomie; // save roomie for next middleware
            next();
        })
        .catch(next);
    })
    .get((req, res, next) => {
        res.json(serializedRoomie(res.roomie));
    })
    .delete((req, res, next) => {
        RoomiesService.deleteRoomie(
            req.app.get('db'),
            req.params.roomie_id
        )
        .then(() => {
            logger.info(`Roomie with id ${req.params.roomie_id} deleted`);
            res.status(204).end();
        })
        .catch(next);
    })
    .patch(jsonParser, (req, res, next) => {
        const { name, note } = req.body;
        const roomieToUpdate = { name, note };

        const numberOfValues = Object.values(roomieToUpdate).filter(Boolean).length;
        if(numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain 'name' and 'note'`
                }
            });
        }

        RoomiesService.updateRoomie(
            req.app.get('db'),
            req.params.roomie_id,
            roomieToUpdate
        )
        .then(() => {
            logger.info(`Roomie with id ${req.params.roomie_id} updated`);
            res.status(204).end();
        })
        .catch(next);
    });

module.exports = roomiesRouter;