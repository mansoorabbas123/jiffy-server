import sequelize from '../models/index.js';
import initModels from "../models/init-models.js";
import moment from 'moment';
import { Op } from 'sequelize';
import _ from 'lodash';

const model = initModels(sequelize);

export default class ClientService {
    constructor(model, logger) {
        this.model = model;
        this.defaultLimit = 20;
        this.logger = logger;
    }
    async AllStats() {
        var data = {};
        var labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        //Orders count => 1 day
        const getOrders = async () => {
            let orders = await model.Order.count({
                where: {
                    dateOrderPlaced: {
                        [Op.gte]: moment().subtract(1, 'days').toDate()
                    },
                    confirmed: 0
                },
                group: ['confirmed']
            });

            let data = orders[0] ? orders[0].count : 0;

            return data
        }

        //All month orders count of current year
        const monthlyOrders = async () => {
            let month = 1;
            let ordersPerMonth = [];
            let ordersMonthly;
            let total = 0;
            while (month < 13) {
                ordersMonthly = await model.Order.findAndCountAll({
                    where: {
                        dateOrderPlaced: {
                            [Op.gte]: moment("0101", "MMDD").add(month - 1, 'months').toDate(),
                            [Op.lt]: moment("0101", "MMDD").add(month, 'months').toDate(),
                        }
                    },
                    attributes: [
                        [sequelize.fn('sum', sequelize.col('amount')), 'totalRevenue'],
                    ],
                    raw: true
                });
                ordersPerMonth.push(ordersMonthly.count);
                month++;
                if (ordersMonthly.rows[0]) {
                    const { totalRevenue } = ordersMonthly.rows[0];
                    total = total + parseFloat(totalRevenue);
                }
            }
            let data = {
                ordersPerMonth,
                totalRevenue: total
            }
            return data;
        }

        //Statuswise count of orders
        const allOrderStatus = async () => {
            let status = await model.Order.count({
                //where: { confirmed: true },
                group: ['status']
            });
            let label = [], data = [];
            status.map(stat => {
                label.push(stat.status);
                data.push(stat.count);
            });
            let result = { label, data };
            return result;
        }

        //Recent 5 orders
        const recentOrders = async () => {
            let recent = await model.Order.findAll({
                limit: 5,
                attributes: ['id', 'amount', 'status'],
                order: [['dateOrderPlaced', 'DESC']],
                include: [{
                    model: model.Client,
                    as: 'client',
                    attributes: ['name', 'email']
                }]
            });
            return recent;
        }

        //New visitors count for each month
        const newVisitors = async () => {
            let month = 1;
            let visitorsPerMonth = [];
            while (month < 13) {
                let visitors = await model.Visitor.count({
                    where: {
                        createdAt: {
                            [Op.gte]: moment("0101", "MMDD").add(month - 1, 'months').toDate(),
                            [Op.lt]: moment("0101", "MMDD").add(month, 'months').toDate(),
                        }
                    }
                })
                visitorsPerMonth.push(visitors);
                month++;
            }
            return visitorsPerMonth;
        }

        //Current week visitors count
        const weekVisitor = async () => {
            let visitors = await model.Visitor.count({
                where: {
                    createdAt: {
                        [Op.gte]: moment().subtract(7, 'days').toDate()
                    }
                }
            });
            return visitors;
        }

        //Sales count for today
        const dailySales = async () => {
            let sales = await model.Order.count({
                where: {
                    dateOrderPlaced: {
                        [Op.gte]: moment().subtract(1, 'days').toDate()
                    },
                    status: 'pending'
                }
            });

            let data = sales[0] ? sales[0].count : 0;

            return data
        }

        const Monthlysales = async () => {
            let month = 1;
            let salesPerMonth = [];
            let sales;
            let total = 0;
            while (month < 13) {
                sales = await model.Order.findAndCountAll({
                    where: {
                        dateOrderPlaced: {
                            [Op.gte]: moment("0101", "MMDD").add(month - 1, 'months').toDate(),
                            [Op.lt]: moment("0101", "MMDD").add(month, 'months').toDate(),
                        },
                        status: 'delivered'
                    },
                    attributes: [
                        [sequelize.fn('sum', sequelize.col('amount')), 'totalRevenue'],
                    ],
                    raw: true
                })
                salesPerMonth.push(sales.count);
                month++;
                if (sales.rows[0]) {
                    const { totalRevenue } = sales.rows[0];
                    total = total + parseFloat(totalRevenue);
                }
            }
            let data = {};
            if (sales) {
                data = {
                    salesPerMonth,
                    totalRevenue: total
                }
            }

            return data;
        }

        let values = Promise.all([getOrders(), monthlyOrders(), recentOrders(), allOrderStatus(), newVisitors(), weekVisitor(), Monthlysales(), dailySales()]).then(function (values) {
            let total = 0;

            values[3].data.map(order => {
                total = total + order;
            });
            let visitors = {
                chartData: {
                    labels,
                    data: values[4]
                },
                monthly: values[4][moment().month()],
                weekly: values[5]
            }

            let sales = {
                chartData: {
                    labels,
                    data: values[6].salesPerMonth
                },
                today: values[7],
                totalRevenue: values[6].totalRevenue
            }
            let ordersData = {
                chartData: {
                    labels,
                    data: values[1].ordersPerMonth,
                },
                today: values[0],
                totalRevenue: values[1].totalRevenue
            }

            data = {
                ordersData,
                recentOrders: values[2],
                orderStatus: values[3],
                visitors,
                totalOrders: total,
                sales
            }
            return data;
        });

        return values
    }
}
