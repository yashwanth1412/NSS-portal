const {DataTypes, Model} = require("sequelize")
const db_sequelize = require("../db.js")
const Event = require("./event.js")

class Category extends Model {}

Category.init({
  // Model attributes are defined here
    number: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    minHrs: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0
    }
}, {
    // Other model options go here
    sequelize: db_sequelize,
    modelName: 'Category',
    freezeTableName: true
});

Category.hasMany(Event, {foreignKey: 'fk_category', targetKey: 'number'})

module.exports = Category
