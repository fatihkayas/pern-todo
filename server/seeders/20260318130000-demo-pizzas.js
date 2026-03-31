'use strict';

module.exports = {
  async up(queryInterface) {
    // Pizza demo seed disabled.
    // We want to keep only doner menu items in the local dataset.
    // nothing to insert
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('pizzas', null, {});
  },
};
