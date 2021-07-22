const {DataTypes, Model} = require("sequelize")
const db_sequelize = require("../db.js");
const User = require('./user.js')
const Event = require('./event.js')

class User_Events extends Model {}

User_Events.init({
    UserEmail: {
        type: DataTypes.INTEGER,
        references: {
            model: User, 
            key: 'email'
        }
    },
    EventId: {
        type: DataTypes.INTEGER,
        references: {
            model: Event, 
            key: 'id'
        }
    },
    hours: {
        type: DataTypes.DOUBLE,
        defaultValue: 0
    }
}, {
    sequelize: db_sequelize, 
    modelName: 'Participate',
    freezeTableName: true
});


Event.belongsToMany(User, { through: User_Events });
User.belongsToMany(Event, { through: User_Events });

module.exports = User_Events