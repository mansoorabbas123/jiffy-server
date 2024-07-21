import _ from 'lodash';
import sequelize from '../models/index.js';
import { Op } from 'sequelize';
import initModels from "../models/init-models.js";

const models = initModels(sequelize);

export default class categoryService {
    constructor(model, logger) {
        this.model = model;
        this.defaultLimit = 20;
        this.logger = logger;

    }
    async AddCategory(input) {
        try {
            await this.model.create(input);
            return input;
        } catch (e) {
            throw e;
        }
    }
    async AllCategories(input) {
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
            if (input.title) {
                condition.title = { [Op.like]: `%${input.title}%` }
            }
            if (input.id) {
                condition.id = { [Op.eq]: input.id }
            }
            condition.isDeleted = false;
            let result = await this.model.findAndCountAll({
                where: condition,
                order: [['id', 'DESC']],
                limit,
                offset,
                distinct: true
            })
            return result;
        } catch (e) {
            throw e;
        };
    }
    async SingleCategory(input) {
        try {
            let category = await this.model.findOne({
                where: {
                    isDeleted: false,
                    id: input
                },
                include: [{
                    model: models.Products,
                    as: 'products',
                    include: [{
                        model: models.ProductImages,
                        as: 'productImages'
                    }]
                }]
            });
            return category;
        } catch (e) {
            throw e;
        }
    }
    async UpdateCategory(input) {
        try {
            let category = await this.model.findOne({
                where: {
                    id: input.id
                }
            })

            if (!category) {
                let error = new Error();
                error.message = "Category Not Found";
                error.name = "permission"
                error.status = 404;
                throw error
            };
            
            // Update category
            if (input) {
                category.set(input)
                category.save()
            }
            return category;
        } catch (e) {
            throw e;
        }
    }
}