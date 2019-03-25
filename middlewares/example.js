
// example middleware function
let exampleMiddleware = (req, res, next) => {

    req.user = { 'firstName': 'AKash' , 'lastName': 'Kehsauri'}
    next();
}

module.exports = {

    exampleMiddleware: exampleMiddleware
}