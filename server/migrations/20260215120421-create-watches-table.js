'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('watches', {
      watch_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      watch_name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      brand: {
        type: Sequelize.STRING(100)
      },
      model_code: {
        type: Sequelize.STRING(50)
      },
      description: {
        type: Sequelize.TEXT
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      stock_quantity: {
        type: Sequelize.INTEGER
      },
      image_url: {
        type: Sequelize.TEXT
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('watches');
  }
};
