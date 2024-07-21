import _sequelize from 'sequelize';

const { Model } = _sequelize;

export default class Address extends Model {
    static init(sequelize, DataTypes) {
        super.init({
            id: {
                autoIncrement: true,
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true
            },
            hno: {
                type: DataTypes.STRING(50),
                allowNull: true
            },
            street: {
                type: DataTypes.STRING(255),
                allowNull: false
            },
            city: {
                type: DataTypes.STRING(50),
                allowNull: false
            },
            zip: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            state: {
                type: DataTypes.STRING(50),
                allowNull: false
            },
            country: {
                type: DataTypes.STRING(50),
                allowNull: false
            },
            addType: {
                type: DataTypes.STRING(50),
                allowNull: false,
                defaultValue: 'home'
            },
            isDefault: {
                type: DataTypes.BOOLEAN,
                allowNull: false
            }
        }, {
            sequelize,
            tableName: 'Address',
            timestamps: true,
            indexes: [
                {
                    name: "PRIMARY",
                    unique: true,
                    using: "BTREE",
                    fields: [
                        { name: "id" },
                    ]
                }
            ]
        });
        return Address;
    }
}