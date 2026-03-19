'use strict';

module.exports = {
  async up(queryInterface) {
    // Pizza demo seed disabled.
    // We want to keep only doner menu items in the local dataset.
    await queryInterface.bulkInsert('pizzas', []);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('pizzas', null, {});
  },
};
