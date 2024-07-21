import { Router } from 'express';
import user from './routes/user.js';
import product from './routes/product.js';
import category from './routes/category.js';
import client from './routes/client.js';
import order from './routes/order.js';
import coupon from './routes/coupon.js';
import stats from './routes/stats.js';
import visitor from './routes/visitor.js';


// this is the single entry point for loading all the routes
export default () => {
	const app = Router();

	user(app);
	product(app);
	category(app);
	client(app);
	order(app);
	coupon(app);
	stats(app);
	visitor(app);

	return app
}