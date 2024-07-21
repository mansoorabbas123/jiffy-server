import validation from './validator.js';
import response from './response.js';
import errorHandler from './error.js';
//import permissionHandler from './permission.js';

export default {
    validation,
    response,
    errorHandler
};

// consolidating common middlewares into a single file
// not adding authentication middleware as mentioned in task requirement