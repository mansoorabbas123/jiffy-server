import _sequelize from 'sequelize';

const { Model } = _sequelize;

export default class Visitor extends Model {
    static init(sequelize, DataTypes) {
        super.init({
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false,
                autoIncrement: true
            },
            token: {
                type: DataTypes.STRING(255),
                allowNull: false
            }
        }, {
            sequelize,
            tableName: 'Visitor',
            timestamps: true,
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
        })
        return Visitor
    }
}