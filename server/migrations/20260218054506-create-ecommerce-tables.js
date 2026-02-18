'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Customers table
    await queryInterface.createTable('customers', {
      customer_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      full_name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      phone: {
        type: Sequelize.STRING(50)
      },
      address: {
        type: Sequelize.TEXT
      },
      city: {
        type: Sequelize.STRING(100)
      },
      country: {
        type: Sequelize.STRING(100)
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Orders table
    await queryInterface.createTable('orders', {
      order_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      customer_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'customers',
          key: 'customer_id'
        },
        onDelete: 'SET NULL'
      },
      order_date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      total_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      status: {
        type: Sequelize.STRING(50),
        defaultValue: 'pending'
      },
      payment_intent_id: {
        type: Sequelize.STRING(255)
      },
      shipping_address: {
        type: Sequelize.TEXT
      },
      invoice_url: {
        type: Sequelize.STRING(500)
      }
    });

    // Order items table
    await queryInterface.createTable('order_items', {
      item_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      order_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'orders',
          key: 'order_id'
        },
        onDelete: 'CASCADE'
      },
      watch_id: {
        type: Sequelize.UUID,
        references: {
          model: 'watches',
          key: 'watch_id'
        }
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      unit_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      subtotal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      }
    });

    // Invoices table
    await queryInterface.createTable('invoices', {
      invoice_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      order_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'orders',
          key: 'order_id'
        }
      },
      invoice_number: {
        type: Sequelize.STRING(50),
        unique: true,
        allowNull: false
      },
      issue_date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      pdf_path: {
        type: Sequelize.STRING(500)
      },
      total: {
        type: Sequelize.DECIMAL(10, 2)
      }
    });

    // Stock movements table
    await queryInterface.createTable('stock_movements', {
      movement_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      watch_id: {
        type: Sequelize.UUID,
        references: {
          model: 'watches',
          key: 'watch_id'
        }
      },
      quantity_change: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      movement_type: {
        type: Sequelize.STRING(50)
      },
      reference_id: {
        type: Sequelize.INTEGER
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      notes: {
        type: Sequelize.TEXT
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('stock_movements');
    await queryInterface.dropTable('invoices');
    await queryInterface.dropTable('order_items');
    await queryInterface.dropTable('orders');
    await queryInterface.dropTable('customers');
  }
};