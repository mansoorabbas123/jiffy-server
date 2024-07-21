import _sequelize from 'sequelize';

const { Model } = _sequelize;

export default class Category extends Model {
    static init(sequelize, DataTypes) {
        super.init({
            id: {
                autoIncrement: true,
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true
            },
            title: {
                type: DataTypes.STRING(100),
                allowNull: false
            },
            description: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            icon: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            isDeleted: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            }
        }, {
            sequelize,
            tableName: 'Category',
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
        return Category;
    }
}
Category.prototype.toJSON = function () {
    var values = this.get()
    delete values.isDeleted
    return values
}