import sequelize from '../models/index.js';
import initModels from "../models/init-models.js";
import helpingService from './helping.service.js';
import general from '../api/middlewares/general.js';
import { Op } from 'sequelize';

const models = initModels(sequelize);

export default class ClientService {

    constructor(model, logger) {
        this.model = model;
        this.defaultLimit = 20;
        this.logger = logger;
    }

    async AddNew(input) {
        try {
            let user = await this.model.findOne({ where: { email: input.email }, attributes: ['id'] })
            if (user) {
                let error = new Error();
                error.message = "User Already Exist";
                error.name = "duplication"
                error.status = 400;
                throw error
            }
            if (!user) {
                let newClient = await this.model.create(input);

                newClient.salt = newClient.makeSalt()
                newClient.hashedPassword = newClient.encryptPassword(input.password, newClient.salt);

                let data = {
                    email: input.email,
                    name: input.name
                }
                let otp = await helpingService.verifyEmail(data);
                const expiry = Date.now() + 300000;
                newClient.otp = otp;
                newClient.otpValidTill = expiry;
                await newClient.save();
                let result = {
                    id: newClient.id,
                    name: newClient.name,
                    email: newClient.email
                }

                return result
            }

        } catch (e) {
            throw e;
        }
    }
    async SendEmail(input) {
        let email = input.email;
        let newClient = await this.model.findOne({ where: { email } });
        if (!newClient) {
            let error = new Error();
            error.message = "User doesn't exist";
            error.name = "permission"
            error.status = 404;
            throw error
        }
        let data = {
            email,
            name: newClient.name
        }
        let otp = await helpingService.verifyEmail(data);
        const expiry = Date.now() + 300000;
        newClient.otp = otp;
        newClient.otpValidTill = expiry;
        await newClient.save();


        return { msg: "Email sent successfully" }
    }
    async login(input) {
        let email = input.email
        let password = input.password
        let clientData = {};

        try {
            // check if email exist
            let user = await models.Client.findOne({
                where: { email }
            });

            if (!user || !user.salt || !user.hashedPassword) {
                let error = new Error();
                error.message = "Invalid email or Password.";
                error.name = "permission"
                error.status = 404;
                throw error
            }
            if (!user.authenticate(password)) {
                let error = new Error();
                error.message = "Invalid email or Password.";
                error.name = "permission"
                error.status = 404;
                throw error
            }
            if (!user.verified) {
                let error = new Error();
                error.message = "Email not verified";
                error.name = "permission"
                error.status = 403;
                throw error
            }

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
            return clientData;
        } catch (e) {
            throw (e);
        }
    }
    async validation(id) {
        try {
            let userData = {}
            // check if email exist
            let user = await this.model.findOne({
                where: { id }
            });

            userData.userInfo = user
            const tokenData = {
                id: userData.userInfo.id,
                name: userData.userInfo.name,
                email: userData.userInfo.email
            }

            userData.userInfo = {
                ...tokenData,
            }

            let token = await helpingService.signLoginData({ data: tokenData });
            token = await general.encryptData(token);
            userData.tokenInfo = token;
            return userData;
        } catch (e) {
            throw e;
        }
    }
    async profile(id) {
        try {
            let user = await this.model.findOne({
                where: { id }
            });
            if (!user) {
                let error = new Error();
                error.message = "User Not Found";
                error.name = "permission"
                error.status = 404;
                throw error
            }
            return user;
        } catch (e) {
            throw e;
        }
    }
    async ForgetPassword(input) {
        try {
            let user = await this.model.findOne({ where: { email: input.email } });
            if (!user) {
                let error = new Error();
                error.message = "User does not exist";
                error.name = "permission"
                error.status = 404;
                throw error
            }
            if (user) {
                let data
                data = {
                    email: input.email,
                    name: user.name
                }
                let token = await helpingService.verifyEmail(data);
                user.passwordResetToken = token;
                await user.save();
                let result = {
                    id: user.id,
                    name: user.name,
                    email: user.email
                }

                return result
            }

        } catch (e) {

            throw e;
        }
    }
    async VerifyToken(input) {
        try {
            let clientData = {}
            let user = await this.model.findOne({ where: { email: input.email } })
            if (!user) {
                let error = new Error();
                error.message = "User does not exist";
                error.name = "permission"
                error.status = 404;
                throw error
            }
            if (user && user.passwordResetToken === input.otp) {
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
                return clientData;
            } else {
                return {
                    msg: "Invalid OTP"
                }
            }
        } catch (e) {
            throw e;
        }
    }
    async ChangeForgetPassword(input) {
        try {
            let user = await this.model.findOne({ where: { email: input.email } });
            let data = {};
            if (user && (user.passwordResetToken === input.otp)) {
                
                data.hashedPassword = user.encryptPassword(input.password, user.salt);
                if(data.hashedPassword === user.hashedPassword){
                    let err = new Error();
                    err.message = "Please use a different password";
                    err.status = 400;
                    err.name = "duplicate";
                    throw err;
                }
                user.hashedPassword = data.hashedPassword;
                await user.save();
                let result = {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    msg: "Password changed"
                }
                return result
            } else if (user.passwordResetToken != input.otp) {
                let error = new Error();
                error.message = "Cannot change password";
                error.name = "permission";
                error.status = 404;
                throw error;
            } else {
                let error = new Error();
                error.message = "Something went wrong";
                error.name = "permission";
                error.status = 404;
                throw error;
            }
        } catch (e) {
            throw e;
        }
    }
    async ChangePassword(input) {
        try {
            let user = await this.model.findOne({ where: { id: input.id } })
            if (!user) {
                let error = new Error();
                error.message = "User does not exist";
                error.name = "permission"
                error.status = 404;
                throw error
            }
            if (user && user.authenticate(input.oldPassword)) {
                if(input.oldPassword === input.newPassword){
                    let err = new Error();
                    err.name = "conflict";
                    err.status = 409;
                    err.message = "New password should not match with old password. Please try a different password.";
                    throw err;
                }
                user.salt = user.makeSalt();
                user.hashedPassword = user.encryptPassword(input.newPassword, user.salt);
                await user.save();
                let result = {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    msg: "Password changed"
                }

                return result
            } else {
                let error = new Error();
                error.message = "Password didn't match";
                error.name = "unprocessable"
                error.status = 422;
                throw error
            }
        } catch (e) {
            throw e;
        }
    }
    async AllClients(input) {
        try {
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
            if (input.name) {
                condition.name = { [Op.like]: `%${input.name}%`, }
            }
            if (input.email) {
                condition.email = { [Op.eq]: input.email }
            }
            let clients = await this.model.findAndCountAll({
                where: condition,
                order: [['id', 'DESC']],
                limit,
                offset,
                distinct: true,
            })
            return clients;
        } catch (e) {
            throw e;
        };
    }

}
