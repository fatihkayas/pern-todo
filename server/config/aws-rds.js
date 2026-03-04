// TEMPORARY — used only for running migrations against AWS RDS
// DO NOT commit this file — contains DB credentials
// Delete after migrations are complete
module.exports = {
  "aws-rds": {
    username: "psqladmin",
    password: "SeikoAWS2026!",          // match your terraform.tfvars db_password
    database: "jwtauth",
    host: "seiko-postgres.cvqcmygu8efa.eu-central-1.rds.amazonaws.com",
    port: 5432,
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};
