import expressLoader from './express.js';
import Logger from './logger.js';
import sequelize from '../models/index.js';
import config from '../config/config.js';
import dbseed from '../config/dbseed.js';
import initModels from "../models/init-models.js";
import dependencyInjectorLoader from './dependencyInjector.js';

const model = initModels(sequelize);

// this is the main index file for loading all the required dependencies before listening to requests
// loading of express-js that includes setup of all routes and middleware
// loading of DI and attach the model class objects and logger to be access from other parts of application

export default async ({ expressApp }) => {
    try {
        // finally load the express routes and middleware

        sequelize.authenticate().then(async () => {
            Logger.info("*** Database connected ***")
            try {
                await sequelize.sync({ force: false, alter: true })
                if (config.FORCE_DB_SYNC) {
                    Logger.info('|||======================> ');
                    Logger.info('   DB Sync True Data');
                    Logger.info('   inserting to Database');
                    Logger.info('|||======================> ');
                    // let obj = await globalConfig(sequelize);
                    // global.configurationInfo = obj
                    // dbseed(sequelize)
                }
            } catch (error) {
                Logger.error(error.message)
            }
        }).catch((e) => {
            Logger.error(e.message);
        })

        const userModel = { name: 'User', model: model.User };
        const productsModel = { name: 'Products', model: model.Products };
        const productImagesModel = { name: 'ProductImages', model: model.ProductImages };
        const categoryModel = { name: 'Category', model: model.Category };
        const clientModel = { name: 'Client', model: model.Client };
        const orderModel = { name: 'Order', model: model.Order };
        const orderProductModel = { name: 'OrderProduct', model: model.OrderProduct };
        const couponModel = { name: 'Coupon', model: model.Coupon };
        const visitorModel = { name: 'Visitor', model: model.Visitor };

        // now load the dependency injector 
        // this will set the provided models classes and logger
        // its not necessary for this assignment as mentioned in pdf, but using DI to show how it may be useful for writing test cases
        await dependencyInjectorLoader({
            models: [
                userModel,
                productsModel,
                productImagesModel,
                categoryModel,
                clientModel,
                orderModel,
                orderProductModel,
                couponModel,
                visitorModel
            ],
        });

        Logger.info('✌️ Dependency Injector loaded');

        await expressLoader({ app: expressApp });
        Logger.info('✌️ Express loaded');
    } catch (e) {
        Logger.error('🔥 Error on dependency injector loader: %o', e);
        throw e;

    }

};