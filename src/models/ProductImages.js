import _sequelize from 'sequelize';

const { Model } = _sequelize;

export default class ProductImages extends Model {
    static init(sequelize, DataTypes) {
        super.init({
            id: {
                autoIncrement: true,
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true
            },
            url: {
                type: DataTypes.STRING(255),
                allowNull: false
            }
        }, {
            sequelize,
            tableName: 'ProductImages',
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
        return ProductImages;
    }
}