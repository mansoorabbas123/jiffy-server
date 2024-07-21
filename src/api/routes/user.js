import { Router } from 'express';
import middlewares from '../middlewares/index.js';
import Logger from '../../loaders/logger.js';
import passport from '../../config/passport.js';
import sequelize from '../../models/index.js';
import initModels from "../../models/init-models.js";
import _ from 'lodash';
import { Container } from 'typedi';
import userService from '../../services/user.js';
import general from '../middlewares/general.js';
const route = Router();
const model = initModels(sequelize);

export default (app) => {

    // for this assignment I could use this logger directly
    // but i am using this DI for getting logger
    const logger = Container.get('logger');

    app.use('/user', route);

    // middleware for logging the basic request info; defining directly into the route for specific logging
    route.use((req, res, next) => {
        Logger.debug(`${req.method}: /user${req.url}`);
        next();
    });

    // route.post('/signup', middlewares.validation.postUser, async (req, res, next) => {
    //     try {

    //         const inputData = req.body;

    //         const model = Container.get('User');
    //         const instance = new userService(model, logger);

    //         const data = await instance.AddNew(inputData);

    //         return res.success(data);
    //     } catch (e) {
    //         // logger.error('🔥 error: %o', e);
    //         return next(e);
    //     }
    // });

    route.post('/login', middlewares.validation.postLogin, async (req, res, next) => {
        try {

            const inputData = req.body;

            const model = Container.get('User');
            const instance = new userService(model, logger);

            const data = await instance.login(inputData);

            return res.success(data);
        } catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });

    route.post('/change-password', general.tokenDecrypt, passport.authenticate('jwt', { session: false }), middlewares.validation.postChangePassword, async (req, res, next) => {
        try {

            const inputData = req.body;
            let id = req.user.id;

            const model = Container.get('User');
            const instance = new userService(model, logger);

            const data = await instance.changePassword(inputData, id);

            return res.success(data);
        } catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });

    route.post('/forget-password', general.tokenDecrypt, middlewares.validation.postForgetPassword, async (req, res, next) => {
        let email = req.body.email;
        try {
            let user = await model.User.findOne({
                where: { email },
            });
            if (!user) {
                return res
                    .status(401)
                    .json({ success: false, msg: "No user found" });
            }

            // To Generate Random Token
            let passwordResetToken = await helpingService.generateRandomToken(36);
            user.passwordResetToken = passwordResetToken;
            await user.save();

            // Verification Email With Reset Token
            const verificationLink = `${process.env.domain
                }?emToken=${passwordResetToken}&e=${encodeURIComponent(
                    email
                )}`;

            // // Send Email With verification Link
            helpingService.passResetMail(verificationLink, email);
            return res
                .success({ success: true, msg: "email has been sent" });
        } catch (error) {
            res.status(401).json({ success: false, msg: "No User found" });
        }
    });

    route.get('/validate', general.tokenDecrypt, passport.authenticate('jwt', { session: false }), async (req, res, next) => {
        try {

            const id = req.user.id;

            const model = Container.get('User');
            const instance = new userService(model, logger);

            const data = await instance.validation(id);

            return res.success(data);
        } catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.post('/search', general.tokenDecrypt, passport.authenticate('jwt', { session: false }), middlewares.validation.searchUser, async (req, res, next) => {
        try {

            const input = req.body;
            const model = Container.get('User');
            const instance = new userService(model, logger);

            const data = await instance.getUsers(input);

            return res.success(data);
        } catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });

    route.put('/update', general.tokenDecrypt, passport.authenticate('jwt', { session: false }), middlewares.validation.putUser, async (req, res, next) => {
        try {

            let id = req.user.id;
            let data = req.body

            model.User.findOne({
                where: {
                    id
                }
            })
                .then(async (user) => {
                    if (!user) {
                        let error = new Error();
                        error.message = "User Not Found";
                        error.name = "permission"
                        error.status = 404;
                        throw error
                    };
                    // Update user
                    if (data) {
                        user.set(data)
                        user.save()
                    }
                    res.success({
                        success: true,
                        msg: 'Successfully Updated',
                        user
                    })
                }).catch((e) => {
                    Logger.error('% Error %', e)
                    throw e
                })
        } catch (e) {
            Logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
};
