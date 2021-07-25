const {DataTypes, Model} = require("sequelize")
const db_sequelize = require("../db.js");
const User = require('./user.js')
const Event = require('./event.js')

class User_Events extends Model {}

User_Events.init({
    UserEmail: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        references: {
            model: User,
            key: 'email'
        }
    },
    EventId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
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

Event.hasMany(User_Events);
User_Events.belongsTo(Event);

User.hasMany(User_Events);
User_Events.belongsTo(User);


//Event.belongsToMany(User, { through: User_Events });
//User.belongsToMany(Event, { through: User_Events });

module.exports = User_Events
