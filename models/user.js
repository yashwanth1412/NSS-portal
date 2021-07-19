const {Sequelize, DataTypes, Model} = require("sequelize")
const db_sequelize = require("../db.js")

class User extends Model {}

User.init({
  // Model attributes are defined here
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    rollno: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
    }
}, {
    // Other model options go here
    sequelize: db_sequelize, 
    modelName: 'User' 
});

module.exports = User