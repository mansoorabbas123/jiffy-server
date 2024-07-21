import _sequelize from 'sequelize';

const { Model } = _sequelize;

export default class Products extends Model {
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
            price: {
                type: DataTypes.FLOAT(),
                allowNull: false
            },
            discount: {
                type: DataTypes.INTEGER,
                defaultValue: 0
            },
            quantity: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            description: {
                type: DataTypes.STRING(1000),
                allowNull: true
            },
            isDeleted: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            unitQuantity: {
                type: DataTypes.STRING(255),
                allowNull: true
            }
        }, {
            sequelize,
            tableName: 'Products',
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
        return Products;
    }

}
Products.prototype.toJSON = function () {
    var values = this.get()
    delete values.isDeleted
    return values
}