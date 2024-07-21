'use strict'
import Sequelize from 'sequelize';
import sequelize from '../models/index.js';
import initModels from "../models/init-models.js";

const model = initModels(sequelize);
const Op = Sequelize.Op;

const dbseed = async (sequelize) => {
}

export default dbseed;
