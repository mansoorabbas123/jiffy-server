import { Router } from 'express';
import { Container } from 'typedi';
import initModels from "../../models/init-models.js";
import sequelize from '../../models/index.js';
import Logger from '../../loaders/logger.js';
import CouponService from '../../services/coupon.js';
import _ from 'lodash';
import general from '../middlewares/general.js';
import passport from '../../config/passport.js';

const route = Router();
const model = initModels(sequelize);

export default (app) => {

    const logger = Container.get('logger');

    app.use('/coupon', route);

    route.use((req, res, next) => {
        Logger.debug(`${req.method}: /coupon${req.url}`);
        next();
    });
    route.post('/add', general.tokenDecrypt, passport.authenticate('jwt', { session: false }), general.searchUser, async (req, res, next) => {
        try {

            let input = req.body;

            const model = Container.get('Coupon');
            const instance = new CouponService(model, logger);

            const data = await instance.AddCoupon(input);

            return res.success(data);

        } catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    })
    route.post('/view', general.tokenDecrypt, passport.authenticate('jwt', { session: false }), general.searchUser, async (req, res, next) => {
        try {
            const model = Container.get('Coupon');
            const instance = new CouponService(model, logger);

            const data = await instance.ViewCoupon();

            return res.success(data);

        } catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    })
    route.put('/update/:code', general.tokenDecrypt, passport.authenticate('jwt', { session: false }), general.searchUser, async (req, res, next) => {
        try {

            let input = req.body;
            input.code = req.params.code;

            const model = Container.get('Coupon');
            const instance = new CouponService(model, logger);

            const data = await instance.UpdateCoupon(input);

            return res.success(data);

        } catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    })
    route.delete('/delete/:code', general.tokenDecrypt, passport.authenticate('jwt', { session: false }), general.searchUser, async (req, res, next) => {
        try {
            let input = req.params.code;

            const model = Container.get('Coupon');
            const instance = new CouponService(model, logger);

            const data = await instance.DeleteCoupon(input);

            return res.success(data);

        } catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    })
    route.post('/check/:code', general.tokenDecrypt, passport.authenticate('jwt', { session: false }), general.searchUser, async (req, res, next) => {
        try {
            let input = req.params.code;

            const model = Container.get('Coupon');
            const instance = new CouponService(model, logger);

            const data = await instance.CheckCoupon(input);

            return res.success(data);

        } catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    })
    route.post('/count', general.tokenDecrypt, passport.authenticate('jwt', { session: false }), general.searchUser, async (req, res, next) => {
        try {
            let input = req.params.code;

            const model = Container.get('Coupon');
            const instance = new CouponService(model, logger);

            const data = await instance.TotalCount(input);

            return res.success(data);

        } catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    })
}