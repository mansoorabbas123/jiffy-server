import _sequelize from "sequelize";
const DataTypes = _sequelize.DataTypes;
import _User from "./User.js";
import _Category from "./Category.js";
import _Products from "./Products.js";
import _Client from "./Client.js";
import _ProductImages from "./ProductImages.js";
import _Order from "./Order.js";
import _OrderProduct from "./OrderProduct.js";
import _Coupon from "./Coupon.js";
import _ComboProduct from "./ComboProduct.js";
import _Visitor from "./Visitor.js";

export default function initModels(sequelize) {

  var User = _User.init(sequelize, DataTypes);
  var Category = _Category.init(sequelize, DataTypes);
  var Products = _Products.init(sequelize, DataTypes);
  var ProductImages = _ProductImages.init(sequelize, DataTypes);
  var Client = _Client.init(sequelize, DataTypes);
  var Order = _Order.init(sequelize, DataTypes);
  var OrderProduct = _OrderProduct.init(sequelize, DataTypes);
  var Coupon = _Coupon.init(sequelize, DataTypes);
  var ComboProduct = _ComboProduct.init(sequelize, DataTypes);
  var Visitor = _Visitor.init(sequelize, DataTypes);

  Products.hasMany(ProductImages, { as: 'productImages', foreignKey: 'productId' });
  ProductImages.belongsTo(Products, { as: 'products', foreignKey: 'productId' });

  Category.hasMany(Products, { as: 'products', foreignKey: 'categoryId' });
  Products.belongsTo(Category, { as: 'category', foreignKey: 'categoryId' });

  Client.hasMany(Order, { as: 'order', foreignKey: 'clientId' });
  Order.belongsTo(Client, { as: 'client', foreignKey: 'clientId' });

  Order.hasMany(OrderProduct, { as: 'productOrder', foreignKey: 'orderId' });
  OrderProduct.belongsTo(Order, { as: 'order', foreignKey: 'orderId' });

  Products.hasMany(OrderProduct, { as: "orderProduct", foreignKey: 'productId' });
  OrderProduct.belongsTo(Products, { as: 'product', foreignKey: 'productId' });

  Coupon.hasMany(OrderProduct, { as: 'orderProduct', foreignKey: 'couponCode' });
  OrderProduct.belongsTo(Coupon, { as: 'coupon', foreignKey: 'couponCode' });

  Products.belongsToMany(Products, { through: 'ComboProduct', foreignKey: 'parentId', as: 'product' });
  Products.belongsToMany(Products, { through: 'ComboProduct', foreignKey: 'childId', as: 'cProduct' });
  return {
    User,
    Category,
    Products,
    ProductImages,
    Client,
    Order,
    OrderProduct,
    Coupon,
    ComboProduct,
    Visitor
  };
}
