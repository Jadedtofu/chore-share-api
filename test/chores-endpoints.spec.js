const { expect } = require('chai');
const supertest = require('supertest');
const knex = require('knex');
const app = require('../src/app');
const { makeChoresArray, makeChoresNoId } = require('./chores.fixtures');
const { makeRoomiesArray } = require('./roomies.fixtures');

describe('Chores Endpoints', () => {
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

    describe(`GET /api/chores`, () => {
        context(`Given no chores`, () => {
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get(`/api/chores`)
                    .expect(200, []);
            });
        });

        context(`Given there are chores in the database`, () => {
            const testRoomies = makeRoomiesArray();
            const testChores = makeChoresArray();
    
            beforeEach(`insert chores`, () => {
                return db
                    .into(`choreshare_roomies`)
                    .insert(testRoomies)
                    .then(() => {
                        return db
                            .into(`choreshare_chores`)
                            .insert(testChores)
                    });
            });

            it(`responds with 200 and all the chores`, () => {
                return supertest(app)
                    .get(`/api/chores`)
                    .expect(200, testChores);
            });
        });
    });

    describe(`GET /api/chores/:chore_id`, () => {
        context(`Given there are no chores`, () => {
            it(`responds with 404`, () => {
                const choreId = 123456;
                return supertest(app)
                    .get(`/api/chores/${choreId}`)
                    .expect(404, {
                        error: {
                            message: `Chore doesn't exist`
                        }
                    });
            });
        });

        context(`Given there are chores in the database`, () => {
            const testRoomies = makeRoomiesArray();
            const testChores = makeChoresArray();

            beforeEach('insert chores', () => {
                return db
                    .into('choreshare_roomies')
                    .insert(testRoomies)
                    .then(() => {
                        return db
                            .into(`choreshare_chores`)
                            .insert(testChores);
                    });
            });

            it(`responds with 200 and the specified chore`, () => {
                const choreId = 2;
                const expectedChore = testChores[choreId - 1];
                return supertest(app)
                    .get(`/api/chores/${choreId}`)
                    .expect(200, expectedChore);
            });
        });
    });

    describe(`POST /api/chores`, () => {
        const testRoomies = makeRoomiesArray();
        const testChores = makeChoresNoId();

        beforeEach(`insert chores`, () => {
            return db
                .into(`choreshare_roomies`)
                .insert(testRoomies)
                .then(() => {
                    return db
                        .into(`choreshare_chores`)
                        .insert(testChores);
                });
        });

        it(`creates a chore, responds with 201 and the new chore`, () => {
            const newChore = {
                chore: 'Dust the bookshelf',
                checked: false,
                roomie_id: 1
            }

            return supertest(app)
                .post(`/api/chores`)
                .send(newChore)
                .expect(201)
                .expect(res => {
                    expect(res.body.chore).to.eql(newChore.chore)
                    expect(res.body.checked).to.eql(newChore.checked)
                    expect(res.body).to.have.property('id')
                    expect(res.body).to.have.property('roomie_id')
                    expect(res.headers.location).to.eql(`/api/chores/${res.body.id}`);
                })
                .then(res => {
                    supertest(app)
                        .get(`/api/chores/${res.body.id}`)
                        .expect(res.body);
                });
        });
    });

    describe(`DELETE /api/chores/:chore_id`, () => {
        context(`Given no chores`, () => {
            it(`responds with 404`, () => {
                const choreId = 123456;
                return supertest(app)
                    .delete(`/api/chores/${choreId}`)
                    .expect(404, {
                        error: { message: `Chore doesn't exist` }
                    });
            });
        });

        context(`Given there are chores in the database`, () => {
            const testRoomies = makeRoomiesArray();
            const testChores = makeChoresArray();

            beforeEach(`insert chores`, () => {
                return db
                    .into(`choreshare_roomies`)
                    .insert(testRoomies)
                    .then(() => {
                        return db
                            .into(`choreshare_chores`)
                            .insert(testChores);
                    });
            });

            it(`responds with 204 and removes the chore`, () => {
                const idToRemove = 2;
                const expectedChores = testChores.filter(chore => chore.id !== idToRemove);
                return supertest(app)
                    .delete(`/api/chores/${idToRemove}`)
                    .expect(204)
                    .then(() => 
                        supertest(app)
                            .get(`/api/chores`)
                            .expect(expectedChores)
                    );
            });
        })
    })

    describe(`PATCH /api/chores/:chore_id`, () => {
        context(`Given no chores`, () => {
            it(`responds with 404`, () => {
                const choreId = 123456;
                return supertest(app)
                    .patch(`/api/chores/${choreId}`)
                    .expect(404, { error: { message: `Chore doesn't exist`}});
            });
        });

        context(`Given there are chores in the database`, () => {
            const testRoomies = makeRoomiesArray();
            const testChores = makeChoresArray();

            beforeEach(`insert chores`, () => {
                return db
                    .into(`choreshare_roomies`)
                    .insert(testRoomies)
                    .then(() => {
                        return db
                            .into(`choreshare_chores`)
                            .insert(testChores);
                    });
            });

            it(`responds with 204 and updates the chore`, () => {
                const idToUpdate = 2;
                const updatedChore = {
                    chore: 'Clean the oven',
                    checked: false,
                    roomie_id: 2
                }
    
                const expectedChore = {
                    ...testChores[idToUpdate - 1],
                    ...updatedChore
                }
    
                return supertest(app)
                    .patch(`/api/chores/${idToUpdate}`)
                    .send(updatedChore)
                    .expect(204)
                    .then(() =>
                        supertest(app)
                            .get(`/api/chores/${idToUpdate}`)
                            .expect(expectedChore)
                    );
            });

            it(`responds with 204 when updating a subset of fields`, () => {
                const idToUpdate = 3;
                const updatedChore = {
                    chore: 'Vacuum the master bedroom'
                }
    
                const expectedChore = {
                    ...testChores[idToUpdate - 1],
                    ...updatedChore
                }
    
                return supertest(app)
                    .patch(`/api/chores/${idToUpdate}`)
                    .send({
                        ...updatedChore,
                        fieldToIgnore: `should not be in GET response`
                    })
                    .expect(204)
                    .then(() => 
                        supertest(app)
                            .get(`/api/chores/${idToUpdate}`)
                            .expect(expectedChore)
                    );
            });
        });
    });
});
