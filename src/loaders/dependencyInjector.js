import { Container } from 'typedi';
import LoggerInstance from './logger.js';


// this is the depencdency injection loader
// passed models from main loaders index file
// setting mongoose models and loggers

export default ({ models }) => {
    try {
        models.forEach(m => {
            Container.set(m.name, m.model);
        });
        Container.set('logger', LoggerInstance);
        LoggerInstance.info('✌️ Logger attached');
    } catch (e) {
        LoggerInstance.error('🔥 Error on dependency injector loader: %o', e);
        throw e;
    }
};
