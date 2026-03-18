'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('pizzas', 'category', {
      type: Sequelize.STRING(50),
      allowNull: false,
      defaultValue: 'pizza',
      comment: 'pizza | doner | panini',
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('pizzas', 'category');
  },
};
