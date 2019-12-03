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
    });



module.exports = roomiesRouter;