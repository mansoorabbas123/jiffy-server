import { Router } from 'express';
import middlewares from '../middlewares/index.js';
import { Container } from 'typedi';
import initModels from "../../models/init-models.js";
import sequelize from '../../models/index.js';
import Logger from '../../loaders/logger.js';
import clientService from '../../services/client.js';
import _ from 'lodash';
import helpingService from '../../services/helping.service.js';
import general from '../middlewares/general.js';
import passport from '../../config/passport.js';
import Client from '../../models/Client.js';

const route = Router();
const model = initModels(sequelize);

export default (app) => {

    const logger = Container.get('logger');

    app.use('/client', route);

    // middleware for logging the basic request info; defining directly into the route for specific logging
    route.use((req, res, next) => {
        Logger.debug(`${req.method}: /client${req.url}`);
        next();
    });

    route.post('/signup', middlewares.validation.postUser, async (req, res, next) => {
        try {

            const inputData = req.body;

            const model = Container.get('Client');
            const instance = new clientService(model, logger);

            const data = await instance.AddNew(inputData);

            return res.success(data);
        } catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.post('/resend-email', middlewares.validation.postResendEmail, async (req, res, next) => {
        try {

            const inputData = req.body;

            const model = Container.get('Client');
            const instance = new clientService(model, logger);

            const data = await instance.SendEmail(inputData);

            return res.success(data);
        } catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.post('/verify', middlewares.validation.verifyClient, async (req, res, next) => {
        try {
            let otp = req.body.otp;
            let email = req.body.email;
            let user = model.Client.findOne({
                where: { email }
            }).then(async user => {
                if (!user) {
                    res.status(404).send({ msg: "User doesn't exist" });
                } else {
                    if (user.verified === true) {
                        res.status(400).send({ msg: "User already verified" })
                    } else {
                        if (user.otp && user.otpValidTill) {
                            if (user.otpValidTill < Date.now()) {
                                res.status(400).send({ msg: "OTP expired" });
                            } else if (otp === user.otp) {
                                let clientData = {}
                                user.verified = true;
                                user.save();
                                clientData.clientInfo = user
                                const tokenData = {
                                    id: clientData.clientInfo.id,
                                    name: clientData.clientInfo.name,
                                    email: clientData.clientInfo.email
                                }

                                clientData.clientInfo = {
                                    ...tokenData,
                                }

                                let token = await helpingService.signLoginData({ data: tokenData });
                                token = await general.encryptData(token);
                                clientData.tokenInfo = token;
                                res.success(clientData);
                            } else {
                                res.status(400).send({ msg: "Invalid OTP" });
                            }
                        } else {
                            res.status(404).send({ msg: "No OTP found" });
                        }
                    }
                }
            })
        } catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.post('/login', middlewares.validation.postLogin, async (req, res, next) => {
        try {

            const inputData = req.body;

            const model = Container.get('Client');
            const instance = new clientService(model, logger);

            const data = await instance.login(inputData);

            return res.success(data);
        } catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.get('/validate', general.tokenDecrypt, passport.authenticate('jwt', { session: false }), async (req, res, next) => {
        try {

            const id = req.user.id;

            const model = Container.get('Client');
            const instance = new clientService(model, logger);

            const data = await instance.validation(id);

            return res.success(data);
        } catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.get('/profile', general.tokenDecrypt, passport.authenticate('jwt', { session: false }), async (req, res, next) => {
        try {

            const id = req.user.id;

            const model = Container.get('Client');
            const instance = new clientService(model, logger);

            const data = await instance.profile(id);

            return res.success(data);
        } catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.post('/forget-password', middlewares.validation.postForgetPassword, async (req, res, next) => {
        try {
            const inputData = req.body;

            const model = Container.get('Client');
            const instance = new clientService(model, logger);

            const data = await instance.ForgetPassword(inputData);

            return res.success(data);
        } catch (e) {
            logger.error("Error: ", e);
            return next(e)
        }
    }),
        route.put('/change-password', general.tokenDecrypt, passport.authenticate('jwt', { session: false }), middlewares.validation.postChangePassword, async (req, res, next) => {
            try {
                const inputData = req.body;
                inputData.id = req.user.id;

                const model = Container.get('Client');
                const instance = new clientService(model, logger);

                const data = await instance.ChangePassword(inputData);

                return res.success(data);
            } catch (e) {
                logger.error("Error: ", e);
                return next(e);
            }
        });
    route.post('/verify-forget-password', middlewares.validation.verifyClient, async (req, res, next) => {
        try {
            const inputData = req.body;

            const model = Container.get('Client');
            const instance = new clientService(model, logger);

            const data = await instance.VerifyToken(inputData);

            return res.success(data);
        } catch (e) {
            logger.error("Error: ", e);
            return next(e);
        }
    });
    route.post('/change-forget-password', general.tokenDecrypt, passport.authenticate('jwt', { session: false }), async (req, res, next) => {
        try {
            let input = req.body;
            input.email = req.user.email;

            const model = Container.get('Client');
            const instance = new clientService(model, logger);

            const data = await instance.ChangeForgetPassword(input);

            return res.success(data);
        } catch (e) {
            logger.error("Error: ", e);
            return next(e);
        }
    });
    route.post('/view', general.tokenDecrypt, passport.authenticate('jwt', { session: false }), general.searchUser, middlewares.validation.viewClients, async (req, res, next) => {
        try {
            let input = req.body;
            const model = Container.get('Client');
            const instance = new clientService(model, logger);

            const data = await instance.AllClients(input);

            return res.success(data);
        } catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.put('/update', general.tokenDecrypt, passport.authenticate('jwt', { session: false }), middlewares.validation.putUser, async (req, res, next) => {
        try {

            let id = req.params.id;
            let data = req.body

            let user = await model.Client.findOne({
                where: {
                    id: req.user.id
                }
            })
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
                message: 'Successfully Updated',
                user
            })

        } catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
    route.delete('/delete', general.tokenDecrypt, passport.authenticate('jwt', { session: false }), async (req, res, next) => {
        try {
            let id = req.user.id;
            let client = await Client.findByPk({ id: req.user.id });
            if (!client) {
                let error = new Error();
                error.message = "User does not exist";
                error.name = "permission"
                error.status = 404;
                throw error
            }
            await Client.destroy({
                where: { id }
            })

            return res.success({
                msg: "Account has been deleted"
            });
        } catch (e) {
            logger.error('🔥 error: %o', e);
            return next(e);
        }
    });
}