export default (err, req, res, next) => {
    const isProduction = process.env.NODE_ENV === 'production';

    if (err.name === "MongoError") {
        if (err.code === 11000) {
            return res.status(400).json({
                statusCode: 400,
                error: "Duplicate Entry Error",
                message: isProduction ? "The value you are trying to add is already exists" : err.message
            });
        }
        return res.status(400).json({
            statusCode: 400,
            error: "Database Error",
            message: isProduction ? "There was some error. Please try again later" : err.message
        });
    }

    return res.status(500).json({
        statusCode: err.status,
        error: "Internal Server Error",
        message: isProduction ? "There was some error. Please try again later" : err.message
    });
};

// the proper way is to extend error class and define and throw you custom error; but for this one, that works
