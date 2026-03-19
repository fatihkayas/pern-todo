'use strict';

module.exports = {
  async up(queryInterface) {
    // Real pizza menu seed disabled.
    // The menu should currently contain only doner items.
    await queryInterface.bulkDelete('pizzas', null, {});
    await queryInterface.bulkInsert('pizzas', []);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('pizzas', null, {});
  },
};
