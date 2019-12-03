const ChoresService = {
    getAllChores(knex) {
        return knex.select('*').from('choreshare_chores');
    },

    insertChore(knex, newChore) {
        return knex
            .insert(newChore)
            .into('choreshare_chores')
            .returning('*')
            .then(rows => {
                return rows[0]
            });
    },

    getById(knex, id) {
        return knex
            .from('choreshare_chores')
            .select('*') 
            .where('id', id)
            .first();
    },

    deleteChore(knex, id) {
        return knex('choreshare_chores')
            .where({ id })
            .delete();
    },

    updateChore(knex, id, newChoreFields) {
        return knex('choreshare_chores')
            .where({ id })
            .update(newChoreFields);
    }
};

module.exports = ChoresService;