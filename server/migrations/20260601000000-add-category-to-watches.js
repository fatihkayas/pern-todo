'use strict';

// Category assignment rules (applied in order — later rules override earlier ones):
// 1. Default everyone to 'classic'
// 2. Automatic: brands/series known for mechanical movements
// 3. Chronograph: model codes with chrono patterns
// 4. Diver: diving series model codes
// 5. Sport: sport brands and series
// 6. Luxury: premium brands (overrides above)

const LUXURY_BRANDS = [
  'TAG Heuer', 'Longines', 'MIDO', 'Gucci', 'Raymond Weil',
  'Hamilton', 'Breitling', 'IWC', 'Omega', 'Grand Seiko',
];

const AUTOMATIC_BRANDS = [
  'Orient', 'Seiko', 'Tissot', 'Citizen', 'Longines', 'MIDO',
  'Hamilton', 'Grand Seiko',
];

// Model code prefixes known to be automatic/mechanical
const AUTO_PREFIXES = [
  'SARB', 'SARA', 'SARY', 'SARG', 'SRP', 'SRPA', 'SRPB', 'SRPC', 'SRPD', 'SRPE',
  'SRPF', 'SRPG', 'SRPH', 'SRPJ', 'SPB', 'SLA', 'SNR', 'SJE',
  'NH', 'NH35', 'NE15', // Seiko movement codes
  'FHF', 'ETA', 'SW200', // movement codes sometimes in names
];

// Chronograph model code patterns
const CHRONO_PATTERNS = [
  'CHRONO', 'CAR', 'CBM', 'CBA', 'WAZ', 'WAP', 'CBN', 'WAR',  // TAG Heuer
  'T101', 'T086', 'T116',  // Tissot chrono series
  'SNDX', 'SNDD', 'SNDB', 'SNDA', 'SNDG',  // Seiko chrono
  'SSB', 'SSC',  // Seiko chrono
  'CA', 'CB',    // Citizen chrono prefix
];

// Diver model code patterns
const DIVER_PATTERNS = [
  'SKX', 'SKXA', 'SKA', 'SNE', 'SNEA', 'SNEE',  // Seiko diver
  'SRPA', 'SRP', 'SBDC', 'SBDJ', 'SPB', 'SRPB', 'SRPC', 'SRPD',  // Seiko Prospex diver
  'SBBN', 'SLA',  // Seiko Marine Master / diver
  'NY', 'NDY',  // Orient diver
  'BN',  // Citizen diver (Promaster)
];

// Sport model code patterns
const SPORT_PATTERNS = [
  'GW', 'GBA', 'GST', 'GBD', 'GA', 'GB', 'GG', 'GD', 'GL', 'GLS',  // Casio G-Shock
  'EFV', 'EFR', 'EFS', 'ECB', 'EQB', 'EQS',  // Casio Edifice
  'SGEH', 'SGED',  // Citizen sport
  'T014', 'T048', 'T095',  // Tissot T-Race / T-Sport
];

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Add category column
    await queryInterface.addColumn('watches', 'category', {
      type: Sequelize.STRING(50),
      allowNull: true,
      defaultValue: null,
    });

    // Helper: build a safe SQL IN list
    const inList = (arr) => arr.map((v) => `'${v.replace(/'/g, "''")}'`).join(', ');

    // Helper: build ILIKE OR chain for model_code prefix matching
    const prefixOr = (prefixes) =>
      prefixes.map((p) => `model_code ILIKE '${p}%'`).join(' OR ');

    // 2. Default: classic
    await queryInterface.sequelize.query(
      `UPDATE watches SET category = 'classic' WHERE category IS NULL`
    );

    // 3. Automatic: by brand
    if (AUTOMATIC_BRANDS.length) {
      await queryInterface.sequelize.query(
        `UPDATE watches SET category = 'automatic'
         WHERE brand IN (${inList(AUTOMATIC_BRANDS)})`
      );
    }

    // 4. Automatic: by model code prefix (more precise)
    await queryInterface.sequelize.query(
      `UPDATE watches SET category = 'automatic'
       WHERE ${prefixOr(AUTO_PREFIXES)}`
    );

    // 5. Chronograph: by model code
    await queryInterface.sequelize.query(
      `UPDATE watches SET category = 'chronograph'
       WHERE (${prefixOr(CHRONO_PATTERNS)})
          OR LOWER(watch_name) LIKE '%chronograph%'
          OR LOWER(watch_name) LIKE '%chrono%'`
    );

    // 6. Diver: by model code
    await queryInterface.sequelize.query(
      `UPDATE watches SET category = 'diver'
       WHERE (${prefixOr(DIVER_PATTERNS)})
          OR LOWER(watch_name) LIKE '%diver%'
          OR LOWER(watch_name) LIKE '%200m%'
          OR LOWER(watch_name) LIKE '%300m%'`
    );

    // 7. Sport: by model code
    await queryInterface.sequelize.query(
      `UPDATE watches SET category = 'sport'
       WHERE (${prefixOr(SPORT_PATTERNS)})
          OR LOWER(watch_name) LIKE '%sport%'
          OR LOWER(watch_name) LIKE '%racing%'
          OR LOWER(brand) = 'casio'`
    );

    // 8. Luxury: overrides everything (premium brands)
    if (LUXURY_BRANDS.length) {
      await queryInterface.sequelize.query(
        `UPDATE watches SET category = 'luxury'
         WHERE brand IN (${inList(LUXURY_BRANDS)})`
      );
    }

    console.log('Category migration complete. Counts:');
    const [results] = await queryInterface.sequelize.query(
      `SELECT category, COUNT(*) as count FROM watches GROUP BY category ORDER BY count DESC`
    );
    console.table(results);
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('watches', 'category');
  },
};
