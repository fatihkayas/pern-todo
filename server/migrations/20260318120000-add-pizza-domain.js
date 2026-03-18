'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Pizza ürünleri tablosu
    await queryInterface.createTable('pizzas', {
      pizza_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
      },
      base_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      image_url: {
        type: Sequelize.TEXT,
      },
      // Boyutlar ve toppingler JSON olarak tutulur
      // Örnek: sizes = ["S","M","L"], toppings = ["mushroom","olive"]
      sizes: {
        type: Sequelize.JSONB,
        defaultValue: ['S', 'M', 'L'],
      },
      toppings: {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      is_available: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // 2. order_items tablosuna 2 yeni kolon ekle
    // watch_id zaten var ve dokunmuyoruz — saat siparişleri bozulmaz
    // pizza_id: pizza siparişlerinde dolu, saat siparişlerinde NULL
    await queryInterface.addColumn('order_items', 'pizza_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'pizzas', key: 'pizza_id' },
    });

    // options: boyut ve topping seçimlerini saklar
    // Örnek: { "size": "L", "toppings": ["mushroom", "olive"] }
    await queryInterface.addColumn('order_items', 'options', {
      type: Sequelize.JSONB,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    // Geri alma sırası önemli: önce kolonlar, sonra tablo
    await queryInterface.removeColumn('order_items', 'options');
    await queryInterface.removeColumn('order_items', 'pizza_id');
    await queryInterface.dropTable('pizzas');
  },
};
