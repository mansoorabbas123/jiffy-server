import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid'

export default class VisitorService {
    constructor(model, logger) {
        this.model = model;
        this.defaultLimit = 20;
        this.logger = logger;

    }
    async AddVisitor() {
        try {
            let token = uuidv4();
            await this.model.create({ token });
            let data = { token }
            return data;
        } catch (e) {
            throw e;
        }
    }
}