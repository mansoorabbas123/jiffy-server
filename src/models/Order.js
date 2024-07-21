import _sequelize from 'sequelize';

const { Model } = _sequelize;

export default class Order extends Model {
    static init(sequelize, DataTypes) {
        super.init({
            id: {
                autoIncrement: true,
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true
            },
            amount: {
                type: DataTypes.DECIMAL(8, 2),
                allowNull: false
            },
            address: {
                type: DataTypes.STRING(999),
                allowNull: false
            },
            phone: {
                type: DataTypes.STRING(50),
                allowNull: false
            },
            city: {
                type: DataTypes.STRING(255),
                allowNull: false
            },
            note: {
                type: DataTypes.STRING(999),
                allowNull: true
            },
            intentId: {
                type: DataTypes.STRING(500),
                allowNull: true
            },
            confirmed: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
            status: {
                type: DataTypes.STRING(255),
                defaultValue: 'pending'
            }
        }, {
            sequelize,
            tableName: 'Order',
            timestamps: true,
            createdAt: "dateOrderPlaced",
            updatedAt: false,
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
        return Order;
    }
}