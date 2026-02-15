'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('watches', [
      {
        watch_id: queryInterface.sequelize.fn('gen_random_uuid'),
        watch_name: 'Seiko 5 Sports SRPD79K1 All Black',
        brand: 'Seiko',
        model_code: 'SRPD79K1',
        description: 'The Seiko SRPD79K1 is the ultimate tactical timepiece.',
        price: 340.00,
        stock_quantity: 80,
        image_url: 'https://drive.google.com/uc?export=view&id=1Fw5yVculmlFxp4DZAVDb1WuJJ1cSDCse',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        watch_id: queryInterface.sequelize.fn('gen_random_uuid'),
        watch_name: 'Seiko Alpinist',
        brand: 'Seiko',
        model_code: 'SPB121',
        description: 'Yeşil kadranlı ikonik macera saati.',
        price: 750.00,
        stock_quantity: 25,
        image_url: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=400',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        watch_id: queryInterface.sequelize.fn('gen_random_uuid'),
        watch_name: 'Seiko SKX007',
        brand: 'Seiko',
        model_code: 'SKX007K2',
        description: 'Efsanevi dalgıç saati, modifiye dostu.',
        price: 450.00,
        stock_quantity: 50,
        image_url: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        watch_id: queryInterface.sequelize.fn('gen_random_uuid'),
        watch_name: 'Seiko Presage Cocktail',
        brand: 'Seiko',
        model_code: 'SRPB41',
        description: 'Zarif kadran işlemesiyle gece şıklığı.',
        price: 500.00,
        stock_quantity: 30,
        image_url: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('watches', null, {});
  }
};
