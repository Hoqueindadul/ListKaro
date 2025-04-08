import HandleError from '../utils/handleError.js';

export default (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Internal Server Error';

    if(err.name === 'CastError') {
        const message = `Resource not found. Invalid: ${err.path}`;
        err = new HandleError(message, 404);
    }

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 3f6e797 (finish the working on proudct and start on user)
    // mongodb duplicate key error
    if(err.code === 11000) {
        const message = `This ${Object.keys(err.keyValue)} already exists. Please try again.`;
        err = new HandleError(message, 404);
    }
<<<<<<< HEAD
=======
>>>>>>> 1301830 (work in product api)
=======
>>>>>>> 3f6e797 (finish the working on proudct and start on user)
    res.status(err.statusCode).json({
        success: false,
        message: err.message
    })
}