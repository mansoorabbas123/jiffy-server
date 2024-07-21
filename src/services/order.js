import sequelize from '../models/index.js';
import initModels from "../models/init-models.js";
import { Op } from 'sequelize';
import _ from 'lodash';
import Stripe from 'stripe';
import order from '../api/routes/order.js';
import e from 'express';
const stripe = new Stripe(process.env.stripeSecret);

const models = initModels(sequelize);

// this is the service class for Admin Users 
// it takes care of quering the database

export default class OrderService {

    constructor(model, logger) {
        this.model = model;
        this.defaultLimit = 20;
        this.logger = logger;
    }
    async AddOrder(input) {
        try {
            let { id, items, email, address, city, phone } = input;
            let client = await models.Client.findOne({ where: { id, email } });

            if (client) {
                let clientId = client.id;
                var amount = 0;
                let result;
                await sequelize.transaction(async function (transaction) {
                    for (const item of items) {

                        let product = await models.Products.findOne({ where: { isDeleted: false, id: item.productId } }, { transaction });
                        if (item.quantity > product.quantity) {
                            let err = new Error();
                            err.name = "unprocessable";
                            err.message = "Product out of stock";
                            err.status = 422;
                            throw err;
                        }
                        let productDiscount = product.price * (product.discount / 100)
                        let afterDiscount = product.price - productDiscount;
                        amount = amount + (afterDiscount * item.quantity);

                        if (item.couponCode) {
                            let coupon = await models.Coupon.findOne({ where: { code: item.couponCode } });
                            if (!coupon) {
                                let err = new Error();
                                err.message = "Invalid Coupon Code";
                                err.name = "notfound";
                                err.status = 404;
                                throw err;
                            }
                            var discount = (coupon.discountPercentage / 100) * amount;
                            amount = amount - discount;
                        }
                    };

                    amount = amount * 100;

                    var data = {
                        amount: amount / 100,
                        clientId,
                        address,
                        phone,
                        city
                    }

                    let order = await models.Order.create(data, { transaction });

                    let orderId = order.id;
                    items.forEach(async item => {
                        item.orderId = orderId;
                        if (item.couponId) {
                            await models.Coupon.findOne({ where: { id: item.couponId } });
                        }
                    });

                    await models.OrderProduct.bulkCreate(items, { transaction });

                    result = {
                        orderId,
                        amount,
                        items
                    }

                    // const paymentMethod = await stripe.paymentMethods.create({
                    //     type: 'card',
                    //     card,
                    // });

                    // let pm_id = paymentMethod.id;

                    // await stripe.paymentIntents.create({
                    //     amount,
                    //     currency: 'usd',
                    //     payment_method_types: ['card'],
                    //     payment_method: pm_id,
                    //     confirm: true
                    // });

                    let paymentIntent = await stripe.paymentIntents.create({
                        amount,
                        currency: 'usd',
                        payment_method_types: ['card']
                    });
                    order.set({ intentId: paymentIntent.id }, { transaction });
                    order.save();
                    result.client_secret = paymentIntent.client_secret;
                });
                return result;
            } else {
                let err = new Error();
                err.name = "permission";
                err.message = "user does not exist";
                err.status = 404;
                throw err;
            }
        } catch (e) {
            throw e;
        }
    }
    async ConfirmPayment(input) {
        try {
            // const {card} = input;
            // const paymentMethod = await stripe.paymentMethods.create({
            //         type: 'card',
            //         card,
            //     });
            //     const pm_id = paymentMethod.id;
            // const paymentIntent = await stripe.paymentIntents.update(
            //     'pi_3KjLw8LvYa516UtY0WZlsiDx',
            //     {payment_method: pm_id
            // });
            // const { intentId } = input;
            // const paymentIntent = await stripe.paymentIntents.confirm(
            //     input.intentId,
            // );
            // let order = await this.model.findOne({ where: { intentId } })
            // await order.set({ confirmed: true });
            // await order.save();
            let order = await this.model.findOne({ where: { id: input.orderId } });
            const paymentIntent = await stripe.paymentIntents.retrieve(
                order.intentId
            );
            if (order.confirmed === 1) {
                return { message: "Payment already completed" }
            }
            if (paymentIntent.status === 'succeeded') {
                let orderProduct = await models.OrderProduct.findAll({
                    where: { orderId: order.id }
                })
                for (let i = 0; i < orderProduct.length; i++) {
                    let product = await models.Products.findOne({ where: { id: orderProduct[i].dataValues.productId } });
                    if (product.quantity < orderProduct[i].dataValues.quantity) {
                        let err = new Error();
                        err.message = "Product out of stock";
                        err.name = "unprocessable";
                        err.status = 422;
                        throw err;
                    }
                    product.update({ quantity: product.quantity - orderProduct[i].dataValues.quantity });
                    await product.save();
                }

                await order.set({ confirmed: true });
                order.save();
            } else {
                return { message: "Cannot confirm payment" };
            }
        } catch (e) {
            throw e;
        }
    }
    async ViewOrders(input) {
        try {
            const { orderId, email } = input;
            let limit = 20;
            let page = 0;
            if (input.limit) {
                limit = parseInt(input.limit);
            }
            if (input.hasOwnProperty("page")) {
                page = parseInt(input.page);
            }
            let offset = parseInt(page) * limit;
            let condition = {};

            let user = await models.Client.findOne({
                where: { email }
            });
            condition.clientId = user.id;
            if (orderId) {
                condition.id = orderId;
            }
            const orders = await this.model.findAndCountAll({
                where: condition,
                include: [
                    {
                        model: models.OrderProduct,
                        as: 'productOrder',
                        required: true
                    }
                ],
                limit,
                offset,
                distinct: true,
                order: [['id', 'DESC']]
            });
            return orders;
        } catch (e) {
            throw e;
        }
    }
    async OrderDetails(id) {
        try {
            const orders = await this.model.findOne({
                where: { id },
                attributes: { exclude: ['intentId'] },
                include: [
                    {
                        model: models.Client,
                        as: 'client',
                        attributes: ['name', 'email', 'phone']
                    },
                    {
                        model: models.OrderProduct,
                        as: 'productOrder',
                        required: true,
                        include: [{
                            model: models.Products,
                            as: 'product',
                            include: [{
                                model: models.ProductImages,
                                as: 'productImages'
                            }]
                        }]
                    }
                ],
                distinct: true
            });
            return orders;
        } catch (e) {
            throw e;
        }
    }
    async ClientOrder(input) {
        try {
            const { id, email } = input
            let client = await models.Client.findOne({ where: { email } })
            const orders = await this.model.findOne({
                where: { id, clientId: client.id },
                attributes: { exclude: ['intentId', 'confirmed'] },
                include: [
                    {
                        model: models.OrderProduct,
                        as: 'productOrder',
                        required: true,
                        include: [{
                            model: models.Products,
                            as: 'product',
                            include: [{
                                model: models.ProductImages,
                                as: 'productImages'
                            }]
                        }]
                    }
                ],
                distinct: true
            });
            return orders;
        } catch (e) {
            throw e;
        }
    }
    async UpdateOrder(input) {
        try {
            let order = await this.model.findOne({
                where: { id: input.id }
            })
            if (order) {
                order.set(input);
                order.save();
            } else {
                let error = new Error();
                error.message = "Order Not Found";
                error.name = "permission"
                error.status = 404;
                throw error
            }
            return { message: "Successfully updated" };
        } catch (e) {
            throw e;
        }
    }
    async DeleteOrder(input) {
        try {
            let order = await this.model.findOne({
                where: { id: input.id }
            });
            if (order) {
                order.destroy();
            }
            if (!order) {
                let error = new Error();
                error.message = "Order Not Found";
                error.name = "permission"
                error.status = 404;
                throw error
            }
            return {
                message: 'Order Deleted Successfully'
            };
        } catch (e) {
            throw e;
        };
    }
    async ViewAllOrders(input) {
        let limit = 20;
        let page = 0;
        if (input.limit) {
            limit = parseInt(input.limit);
        }
        if (input.hasOwnProperty("page")) {
            page = parseInt(input.page);
        }
        let offset = parseInt(page) * limit;

        let condition = {};
        if (input.id) {
            condition.id = { [Op.eq]: input.id }
        }
        if (input.address) {
            condition.address = { [Op.like]: `%${input.address}%` }
        }
        //condition.confirmed = true;
        let orders = await this.model.findAndCountAll({
            where: condition,
            limit,
            offset,
            order: [['id', 'DESC']]
        });
        return orders;
    }
}