import sequelize from '../models/index.js';
import initModels from "../models/init-models.js";
import { Op } from 'sequelize';
import _ from 'lodash';
import general from '../api/middlewares/general.js';
import fs, { link } from 'fs';

const model = initModels(sequelize);

export default class productService {
    constructor(model, logger) {
        this.model = model;
        this.defaultLimit = 20;
        this.logger = logger;

    }
    async AddProduct(input) {
        try {
            var dir = process.env.imagePath;

            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            let data = [],
                flag = 0,
                addWatermark;

            let product = await this.model.create(input);
            if (input.file) {
                input.file.map(file => {
                    data[flag] = {
                        url: process.env.imageAccessUrl + file.filename,
                        productId: product.id
                    }
                    // addWatermark = {
                    //     waterMarkImage: process.env.imagePath + process.env.watermark,
                    //     filename: file.filename
                    // }
                    // general.waterMark(addWatermark);
                    flag++;
                })
                await model.ProductImages.bulkCreate(data);
            }
            return input;


        } catch (e) {
            throw e;
        }
    }
    async SingleProduct(input) {
        try {
            let product = await this.model.findOne({
                where: { isDeleted: false, id: input },
                include: [
                    {
                        model: model.ProductImages,
                        as: 'productImages',
                        required: false
                    }
                ],
                distinct: true
            });
            return product;
        } catch (e) {
            throw e;
        }
    }
    async AllProducts(input) {
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
            if (input.title && input.title !== "") {
                condition.title = { [Op.like]: `%${input.title}%` }
            }

            if (input.price && input.price.upperLimit) {
                condition.price = { [Op.between]: [input.price.lowerLimit, input.price.upperLimit] }
                console.log("hi")
            }
            if (input.category_id && input.category_id !== "") {
                condition.categoryId = { [Op.eq]: input.category_id }
            }
            if (input.hasOwnProperty("discount")) {
                condition.discount = { [Op.gt]: input.discount }
            }
            condition.isDeleted = false;
            let products = await this.model.findAndCountAll({
                where: condition,
                include: [
                    {
                        model: model.ProductImages,
                        as: 'productImages',
                    }
                ],
                order: [['id', 'DESC']],
                limit,
                offset,
                distinct: true,
            });
            let price = await this.model.findAll({
                attributes: {
                    include: [
                        [sequelize.fn('min', sequelize.col('price')), 'minPrice'],
                        [sequelize.fn('max', sequelize.col('price')), 'maxPrice']
                    ]
                },
                raw: true
            })
            let data = {}
            data = products;
            data.minPrice = price[0].minPrice;
            data.maxPrice = price[0].maxPrice;
            return data;
        } catch (e) {
            throw e;
        };
    }
    async RemoveProduct(input) {
        try {
            let location = '';
            let product = await this.model.findOne({ where: { id: input.id, isDeleted: false } })
            if (!product) {
                let error = new Error();
                error.message = "Product Not Found";
                error.name = "permission"
                error.status = 404;
                throw error
            }

            product.set({ isDeleted: true });
            product.save();

            let images = await model.ProductImages.findAll({ where: { productId: product.id } })

            images.map(image => {
                let path = image.url.toString();
                let name = path.replace(process.env.imageAccessUrl, "");
                location = process.env.imagePath + name;

                if (fs.existsSync(location)) {
                    fs.unlinkSync(location)
                }
                image.destroy();
            })

            return {
                msg: 'Successfully Deleted'
            };
        } catch (e) {
            throw e;
        };
    }
    async UpdateProduct(input) {
        const { id } = input;
        let location = '', flag;
        input.isDeleted = false;
        let url = JSON.parse(input.url);

        let product = await this.model.findOne({
            where: { id, isDeleted: false }
        });
        if (product) {

            await product.set(input);
            await product.save();
            let images = await model.ProductImages.findAll({
                where: { productId: id }
            });
            //Matching url array with database
            images.map(image => {
                flag = 0;
                url.map(link => {
                    if (link === image.url) {
                        flag = 1;
                    }
                })
                //If not in url then delete image from storage and database
                if (!flag) {
                    let path = image.url.toString();
                    let name = path.replace(process.env.imageAccessUrl, "");
                    location = process.env.imagePath + name;

                    if (fs.existsSync(location)) {
                        fs.unlinkSync(location)
                    }
                    image.destroy();
                }
            })

            let imageData = [], index = 0, addWatermark;

            //Upload all new Images
            if (input.file) {
                input.file.map(file => {
                    imageData[index] = {
                        url: process.env.imageAccessUrl + file.filename,
                        productId: id
                    }
                    // addWatermark = {
                    //     waterMarkImage: process.env.imagePath + process.env.watermark,
                    //     filename: file.filename
                    // }
                    // general.waterMark(addWatermark);
                    index++;
                })
            }
            await model.ProductImages.bulkCreate(imageData)
        }
        if (!product) {
            let error = new Error();
            error.message = "Product Not Found";
            error.name = "permission"
            error.status = 404;
            throw error
        }
        return {
            message: "Product updated successfully",
            product
        }
    }
}