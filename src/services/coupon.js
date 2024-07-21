import sequelize from '../models/index.js';
import initModels from "../models/init-models.js";

const model = initModels(sequelize);

export default class ClientService {

    constructor(model, logger) {
        this.model = model;
        this.defaultLimit = 20;
        this.logger = logger;
    }
    async AddCoupon(input) {
        try {
            let couponCheck = await this.model.findOne({where: {code: input.code}});
            if(couponCheck){
                let err = new Error();
                err.name = "duplication";
                err.message = "Coupon code already exists";
                err.status = 400;
                throw err;
            }
            const { name, code, quantity, expiry, discountPercentage } = input;
            let data = { name, code, quantity, discountPercentage };
            data.expiry = Date.getDate + data.expiry;
            var dt = new Date();
            dt.setDate(dt.getDate() + expiry);
            let coupon = await this.model.create({ ...data, expiry: dt })
            return coupon;
        } catch (e) {
            throw e;
        }
    }
    async ViewCoupon() {
        try {
            let coupon = await this.model.findAndCountAll({
                order: [['id', 'DESC']]
            });
            return coupon;
        } catch (e) {
            throw e;
        }
    }
    async CheckCoupon(code) {
        try {
            let coupon = await this.model.findOne({ where: { code } });
            return coupon;
        } catch (e) {
            throw e;
        }
    }
    async UpdateCoupon(input) {
        try {

            let coupon = await this.model.findOne({ where: { code: input.code } });
            if (coupon) {
                await coupon.set(input);
                await coupon.save();
            } else {
                let err = new Error();
                err.name = 'notfound';
                err.status = 404;
                err.message = 'Coupon Not Found';
                throw err;
            }
            return coupon;
        } catch (e) {
            throw e;
        }
    }
    async DeleteCoupon(code) {
        try {

            let coupon = await this.model.destroy({ where: { code } });
            if (!coupon) {
                let err = new Error();
                err.name = 'notfound';
                err.status = 404;
                err.message = 'Coupon Not Found';
                throw err;
            }
            return { message: "Coupon Deleted Successfully" };
        } catch (e) {
            throw e;
        }
    }
    async TotalCount(code) {
        try {
            let coupon = await this.model.count()
            return coupon;
        } catch (e) {
            throw e;
        }
    }
}