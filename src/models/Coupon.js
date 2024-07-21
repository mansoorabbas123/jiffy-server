import _sequelize from 'sequelize';

const { Model } = _sequelize;

export default class Coupon extends Model {
    static init(sequelize, DataTypes) {
        super.init({
            code: {
                type: DataTypes.STRING(100),
                allowNull: false,
                primaryKey: true
            },
            name: {
                type: DataTypes.STRING(100),
                allowNull: false
            },
            quantity: {
                type: DataTypes.INTEGER, 
                defaultValue: 0
            },
            expiry: {
                type: DataTypes.DATE(),
                allowNull: false,
            },
            discountPercentage: {
                type: DataTypes.INTEGER,
                allowNull: false
            }
        }, {
            sequelize,
            tableName: 'Coupon',
            timestamps: true,
            indexes: [
                {
                    name: "PRIMARY",
                    unique: true,
                    using: "BTREE",
                    fields: [
                        { name: "code" },
                    ]
                }
            ]
        });
        return Coupon;
    }
}