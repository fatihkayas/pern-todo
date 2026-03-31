'use strict';

module.exports = {
  async up(queryInterface) {
    // Real pizza menu seed disabled.
    // The menu should currently contain only doner items.
    // nothing to insert
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('pizzas', null, {});
  },
};
