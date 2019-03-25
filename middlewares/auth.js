
const logger = require('./../libs/loggerLib');
const check = require('./../libs/checkLib'); 
const response = require('./../libs/responseLib');

let isAuthenticated = (req, res, next) => {

    if(req.params.authToken || req.query.authToken || req.header('authToken')) {

        if(req.params.authToken == "Admin" || req.query.authToken == "Admin" || req.header('authToken') == "Admin") {

            req.user = {fullName:'Admin', userId: 'Admin'}
            next();
        } 
        else {

            logger.error('Incorrect authentication Token', 'Authentication Middleware', 5)
            let apiResponse = response.generate(true, 'Incorrect authentication Token', 403, null)
            res.send(apiResponse);
        }
    } else {

        logger.error('Authentication Token is missing', 'Authentication Middleware', 5)
        let apiResponse = response.generate(true, 'Authentication Token is missing', 403, null)
        res.send(apiResponse)
    }
}

module.exports = {
        isAuthenticated: isAuthenticated
}