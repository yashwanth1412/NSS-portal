const {DataTypes, Model} = require("sequelize")
const db_sequelize = require("../db.js")

class Event extends Model {}

Event.init({
  // Model attributes are defined here
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unique: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        primaryKey: true
    }
}, {
    // Other model options go here
    sequelize: db_sequelize, 
    modelName: 'Event',
    freezeTableName: true
});

module.exports = Event