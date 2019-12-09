const { expect } = require('chai');
const supertest = require('supertest');
const knex = require('knex');
const app = require('../src/app');
const { makeRoomiesArray, makeRoomiesNoId } = require('./roomies.fixtures');

describe('Roomies Endpoints', () => {
    let db;

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        });

        app.set('db', db);
    });

    after('disconnect from db', () => db.destroy());

    before('clean the table', () => db.raw('TRUNCATE choreshare_roomies, choreshare_chores RESTART IDENTITY CASCADE'));

    afterEach('cleanup', () => db.raw('TRUNCATE choreshare_roomies, choreshare_chores RESTART IDENTITY CASCADE'));
    
    describe(`GET /api/roomies`, () => {
        context(`Given no roomies`, () => {
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get(`/api/roomies`)
                    .expect(200, []);
            });
        });

        context(`Given there are roomies in the database`, () => {
            const testRoomies = makeRoomiesArray();

            beforeEach(`insert roomies`, () => {
                return db
                    .into('choreshare_roomies')
                    .insert(testRoomies)
            });

            it(`responds with 200 and all the roomies`, () => {
                return supertest(app)
                    .get(`/api/roomies`)
                    .expect(200, testRoomies)
            });
        });
    });

    describe(`GET /api/roomies/:roomie_id`, () => {
        context(`Given there are no roomies`, () => {
            it(`responds with 404`, () => {
                const roomieId = 12345;
                return supertest(app)
                    .get(`/api/roomies/${roomieId}`)
                    .expect(404, {
                        error: {
                            message: `Roomie doesn't exist`
                        }
                    });
            });
        });

        context(`Given there are roomies in the database`, () => {
            const testRoomies = makeRoomiesArray();

            beforeEach(`insert roomies`, () => {
                return db
                    .into('choreshare_roomies')
                    .insert(testRoomies)
            });

            it(`responds with 200 and the specified roomie`, () => {
                const roomieId = 2;
                const expectedRoomie = testRoomies[roomieId - 1];
                return supertest(app)
                    .get(`/api/roomies/${roomieId}`)
                    .expect(200, expectedRoomie);
            });
        });
    });

    describe(`POST /api/roomies`, () => {
        const testRoomies = makeRoomiesNoId();
        beforeEach(`insert roomies`, () => {
            return db
                .into(`choreshare_roomies`)
                .insert(testRoomies);
        });

        it(`creates a roomie, responds with 201 and the new roomie`, () => {
            const newRoomie = {
                name: 'Nathan Darius',
                note: 'Rooming for 1 year, goes to the gym a lot'
            }

            return supertest(app)
                .post(`/api/roomies`)
                .send(newRoomie)
                .expect(201)
                .expect(res => {
                    expect(res.body.name).to.eql(newRoomie.name)
                    expect(res.body.note).to.eql(newRoomie.note)
                    expect(res.body).to.have.property('id')
                    expect(res.headers.location).to.eql(`/api/roomies/${res.body.id}`);
                })
                .then(res => {
                    supertest(app)
                        .get(`/api/roomies/${res.body.id}`)
                        .expect(res.body);
                });
        });
    })

    describe(`DELETE /api/roomies/:roomie_id`, () => {
        context(`Given no roomies`, () => {
            it(`responds with 404`, () => {
                const roomieId = 123456;
                return supertest(app)
                    .delete(`/api/roomies/${roomieId}`)
                    .expect(404, {
                        error: { message: `Roomie doesn't exist`}
                    });
            });
        });

        context(`Given there are roomies in the database`, () => {
            const testRoomies = makeRoomiesArray();

            beforeEach(`insert roomies`, () => {
                return db
                    .into(`choreshare_roomies`)
                    .insert(testRoomies)
            });

            it(`responds with 204 and removes the roomie`, () => {
                const idToRemove = 2;
                const expectedRoomies = testRoomies.filter(roomie => roomie.id !== idToRemove);
                return supertest(app)
                    .delete(`/api/roomies/${idToRemove}`)
                    .expect(204)
                    .then(() => 
                        supertest(app)
                            .get(`/api/roomies`)
                            .expect(expectedRoomies)
                    );
            });
        });
    });

    describe(`PATCH api/roomies/:roomie_id`, () => {
        context(`Given no roomies`, () => {
            it(`responds with 404`, () => {
                const roomieId = 123456;
                return supertest(app)
                    .patch(`/api/roomies/${roomieId}`)
                    .expect(404, { error:
                                    { message: `Roomie doesn't exist`}});
            });
        });

        context(`Given there are roomies in the database`, () => {
            const testRoomies = makeRoomiesArray();

            beforeEach(`insert roomies`, () => {
                return db
                    .into('choreshare_roomies')
                    .insert(testRoomies)
            });

            it(`responds with 204 and updates the roomie`, () => {
                const idToUpdate = 2;
                const updatedRoomie = {
                    name: 'Joshua Calin',
                    note: 'Rooming for 1 year, likes big dogs'
                }

                const expectedRoomie = {
                    ...testRoomies[idToUpdate - 1],
                    ...updatedRoomie
                }

                return supertest(app)
                    .patch(`/api/roomies/${idToUpdate}`)
                    .send(updatedRoomie)
                    .expect(204)
                    .then(() => 
                        supertest(app)
                            .get(`/api/roomies/${idToUpdate}`)
                            .expect(expectedRoomie)
                    );
            });

            it(`responds with 204 when updating subset of fields`, () => {
                const idtoUpdate = 2;
                const updatedRoomie = {
                    name: 'Alex Meyers'
                }

                const expectedRoomie = {
                    ...testRoomies[idtoUpdate - 1],
                    ...updatedRoomie
                }

                return supertest(app)
                    .patch(`/api/roomies/${idtoUpdate}`)
                    .send({
                        ...updatedRoomie,
                        fieldToIgnore: `should not be in GET response`
                    })
                    .expect(204)
                    .then(() => 
                        supertest(app)
                            .get(`/api/roomies/${idtoUpdate}`)
                            .expect(expectedRoomie)
                    );
            });
        });
    });
});
