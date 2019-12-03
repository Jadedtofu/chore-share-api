const RoomiesService = {
    getAllRoomies(knex) {
        return knex.select('*').from('choreshare_roomies');
    },

    insertRoomie(knex, newRoomie) {
        return knex
            .insert(newRoomie)
            .into('choreshare_roomies')
            .returning('*')
            .then(rows => {
                return rows[0];
            });
    },

    getById(knex, id) {
        return knex
            .from('choreshare_roomies')
            .select('*')
            .where('id', id)
            .first();
    },

    deleteRoomie(knex, id) {
        return knex('choreshare_roomies')
            .where({ id })
            .delete();
    },

    updateRoomie(knex, id, newRoomieFields) {
        return knex('choreshare_roomies')
            .where({ id })
            .update(newRoomieFields);
    },
};

module.exports = RoomiesService;