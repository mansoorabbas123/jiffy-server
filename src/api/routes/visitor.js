import { Router } from 'express';
import Logger from '../../loaders/logger.js';
import _ from 'lodash';
import { Container } from 'typedi';
import visitorService from '../../services/visitor.js';

const route = Router();

export default (app) => {

    const logger = Container.get('logger');

    app.use('/visitor', route);

    route.use((req, res, next) => {
        Logger.debug(`${req.method}: /visitor${req.url}`);
        next();
    });
    route.post('/add', async (req, res, next) => {
        try {
            const model = Container.get('Visitor');
            const instance = new visitorService(model, logger);

            const data = await instance.AddVisitor();

            return res.success(data);

        } catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
}