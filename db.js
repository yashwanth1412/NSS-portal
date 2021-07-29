const Sequelize = require("sequelize");

const db_sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host : process.env.DB_HOST,
        logging : false,
        dialect : 'mysql',
        operatorsAliases: 0,
        define: {
          timestamps: false
        }
    }
)

module.exports = db_sequelize
