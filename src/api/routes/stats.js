import { Router } from 'express';
import middlewares from '../middlewares/index.js';
import { Container } from 'typedi';
import initModels from "../../models/init-models.js";
import sequelize from '../../models/index.js';
import Logger from '../../loaders/logger.js';
import StatsService from '../../services/stats.js';
import _ from 'lodash';
import general from '../middlewares/general.js';
import passport from '../../config/passport.js';

const route = Router();
const model = initModels(sequelize);

export default (app) => {

    const logger = Container.get('logger');

    app.use('/stats', route);

    route.use((req, res, next) => {
        Logger.debug(`${req.method}: /stats${req.url}`);
        next();
    });
    route.get('/all', general.tokenDecrypt, passport.authenticate('jwt', {session: false}), general.searchUser, async (req, res, next) => {
        try {
            const instance = new StatsService(logger);

            const data = await instance.AllStats();
            res.success(data)
        } catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    })
}