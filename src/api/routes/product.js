import { Router } from 'express';
import middlewares from '../middlewares/index.js';
import Logger from '../../loaders/logger.js';
import passport from '../../config/passport.js';
import sequelize from '../../models/index.js';
import initModels from "../../models/init-models.js";
import _ from 'lodash';
import { Container } from 'typedi';
import productService from '../../services/product.js';
import general from '../middlewares/general.js';
import seq from 'sequelize';
import multer from 'multer';
import ProductImages from '../../models/ProductImages.js';


var storage = multer.diskStorage(
    {
        destination: process.env.imagePath,
        filename: async (req, file, cb) => {
            let name = file.originalname.split('.');
            name[0] = name[0] + '-' + Date.now();
            let fullFileName = '';
            name.forEach(part => {
                if (fullFileName === '') {
                    fullFileName = fullFileName + part;
                } else {
                    fullFileName = fullFileName + '.' + part;
                }
            })
            cb(null, fullFileName);
        }
    }
);

const upload = multer({
    storage,
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, true);
        } else if (!file) {
            return;
        } else {
            cb(null, false);
            return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
        }
    }
})

const route = Router();
const model = initModels(sequelize);
const Op = seq.Op;

export default (app) => {

    const logger = Container.get('logger');

    app.use('/product', route);

    route.use((req, res, next) => {
        Logger.debug(`${req.method}: /product${req.url}`);
        next();
    });

    route.post('/add', general.tokenDecrypt, passport.authenticate('jwt', { session: false }), general.searchUser, upload.array('uploaded_file',5), middlewares.validation.postProduct, async (req, res, next) => {

        try {
            let input = req.body;
            input.file = req.files;

            const model = Container.get('Products');
            const instance = new productService(model, logger);

            const data = await instance.AddProduct(input);

            return res.success(data);
        }
        catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.post('/view', middlewares.validation.viewProducts, async (req, res, next) => {
        try {
            let input = req.body;
            const model = Container.get('Products');
            const instance = new productService(model, logger);

            const data = await instance.AllProducts(input);

            return res.success(data);
        } catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.get('/view/:id', middlewares.validation.viewSingleProduct, async (req, res, next) => {
        try {
            let input = req.params.id;
            const model = Container.get('Products');
            const instance = new productService(model, logger);

            const data = await instance.SingleProduct(input);

            return res.success(data)
        } catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.put('/delete/:id', general.tokenDecrypt, passport.authenticate('jwt', { session: false }), general.searchUser, middlewares.validation.deleteProduct, async (req, res, next) => {
        try {
            let input = {};
            input.id = req.params.id;

            const model = Container.get('Products');
            const instance = new productService(model, logger);

            const data = await instance.RemoveProduct(input);
            return res.success(data);
        } catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.put('/update/:id', upload.array('uploaded_file', 5), general.tokenDecrypt, passport.authenticate('jwt', { session: false }), general.searchUser, middlewares.validation.updateProduct, async (req, res, next) => {
        try {
            let input = req.body;
            input.id = req.params.id;
            input.file = req.files;

            const model = Container.get('Products');
            const instance = new productService(model, logger);

            const data = await instance.UpdateProduct(input);
            res.success(data);
        } catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        };
    });

}