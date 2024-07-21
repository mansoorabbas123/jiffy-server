import { Router } from 'express';
import middlewares from '../middlewares/index.js';
import { Container } from 'typedi';
import initModels from "../../models/init-models.js";
import sequelize from '../../models/index.js';
import Logger from '../../loaders/logger.js';
import OrderService from '../../services/order.js';
import _ from 'lodash';
import general from '../middlewares/general.js';
import passport from '../../config/passport.js';

const route = Router();
const model = initModels(sequelize);

export default (app) => {

    const logger = Container.get('logger');

    app.use('/order', route);

    route.use((req, res, next) => {
        Logger.debug(`${req.method}: /order${req.url}`);
        next();
    });
    route.post('/add', general.tokenDecrypt, passport.authenticate('jwt', { session: false }), middlewares.validation.orderPlace, async (req, res, next) => {
        try {

            let input = req.body;
            input.email = req.user.email;
            input.id = req.user.id;

            const model = Container.get('Order');
            const instance = new OrderService(model, logger);

            const data = await instance.AddOrder(input);

            return res.success(data);

        } catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.post('/confirmPayment', general.tokenDecrypt, passport.authenticate('jwt', { session: false }), middlewares.validation.orderConfirm, async (req, res, next) => {
        try {

            let input = req.body;

            const model = Container.get('Order');
            const instance = new OrderService(model, logger);

            const data = await instance.ConfirmPayment(input);

            return res.success(data);

        } catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.post('/history', general.tokenDecrypt, passport.authenticate('jwt', { session: false }), async (req, res, next) => {
        try {
            let input = req.body;
            input.email = req.user.email;

            const model = Container.get('Order');
            const instance = new OrderService(model, logger);

            const data = await instance.ViewOrders(input);

            return res.success(data);

        } catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    })
    route.get('/orderDetails/:id', general.tokenDecrypt, passport.authenticate('jwt', { session: false }), middlewares.validation.getOrderDetail, general.searchUser, async (req, res, next) => {
        try {
            let input = req.params.id;

            const model = Container.get('Order');
            const instance = new OrderService(model, logger);

            const data = await instance.OrderDetails(input);

            return res.success(data);

        } catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    })
    route.get('/orderInfo/:id', general.tokenDecrypt, passport.authenticate('jwt', { session: false }), middlewares.validation.getOrderDetail, async (req, res, next) => {
        try {
            let input = {};
            input.id = req.params.id;
            input.email = req.user.email;

            const model = Container.get('Order');
            const instance = new OrderService(model, logger);

            const data = await instance.ClientOrder(input);

            return res.success(data);

        } catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    })
    route.post('/list', general.tokenDecrypt, passport.authenticate('jwt', { session: false }), general.searchUser, middlewares.validation.viewOrders, async (req, res, next) => {
        try {
            let input = req.body;

            const model = Container.get('Order');
            const instance = new OrderService(model, logger);

            const data = await instance.ViewAllOrders(input);

            return res.success(data);

        } catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.post('/update/:id', general.tokenDecrypt, passport.authenticate('jwt', { session: false }), general.searchUser, middlewares.validation.updateOrder, async (req, res, next) => {
        try {
            let input = req.body;
            input.id = req.params.id;

            const model = Container.get('Order');
            const instance = new OrderService(model, logger);

            const data = await instance.UpdateOrder(input);

            return res.success(data);

        } catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.delete('/delete/:id', general.tokenDecrypt, passport.authenticate('jwt', { session: false }), general.searchUser, middlewares.validation.deleteOrder, async (req, res, next) => {
        try {
            let input = {};
            input.id = req.params.id;

            const model = Container.get('Order');
            const instance = new OrderService(model, logger);

            const data = await instance.DeleteOrder(input);

            return res.success(data);

        } catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
}