'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('pizzas', [
      {
        pizza_id: uuidv4(),
        name: 'Margherita',
        description: 'Klasik domates sosu, mozzarella ve fesleğen.',
        base_price: 12.99,
        image_url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600',
        sizes: JSON.stringify(['S', 'M', 'L']),
        toppings: JSON.stringify(['extra cheese', 'basil', 'olives']),
        is_available: true,
        created_at: new Date(),
      },
      {
        pizza_id: uuidv4(),
        name: 'Pepperoni',
        description: 'Bol pepperoni, mozzarella ve domates sosu.',
        base_price: 14.99,
        image_url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600',
        sizes: JSON.stringify(['S', 'M', 'L']),
        toppings: JSON.stringify(['extra pepperoni', 'mushrooms', 'jalapeño']),
        is_available: true,
        created_at: new Date(),
      },
      {
        pizza_id: uuidv4(),
        name: 'BBQ Chicken',
        description: 'BBQ sosu, tavuk, kırmızı soğan ve mozzarella.',
        base_price: 15.99,
        image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600',
        sizes: JSON.stringify(['S', 'M', 'L']),
        toppings: JSON.stringify(['extra chicken', 'corn', 'red onion']),
        is_available: true,
        created_at: new Date(),
      },
      {
        pizza_id: uuidv4(),
        name: 'Quattro Stagioni',
        description: 'Mantar, siyah zeytin, enginar ve jambon.',
        base_price: 16.99,
        image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600',
        sizes: JSON.stringify(['S', 'M', 'L']),
        toppings: JSON.stringify(['mushrooms', 'olives', 'artichoke', 'ham']),
        is_available: true,
        created_at: new Date(),
      },
      {
        pizza_id: uuidv4(),
        name: 'Veggie Supreme',
        description: 'Biber, mantar, zeytin, soğan ve domates.',
        base_price: 13.99,
        image_url: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=600',
        sizes: JSON.stringify(['S', 'M', 'L']),
        toppings: JSON.stringify(['bell pepper', 'mushrooms', 'spinach', 'tomato']),
        is_available: true,
        created_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('pizzas', null, {});
  },
};
