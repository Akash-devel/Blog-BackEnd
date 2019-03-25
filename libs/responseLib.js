/*Response Generation library for api */
let generate = (err, message, status, data) => {

    let response = {
        error: err,
        mesaage: message,
        status: status,
        data: data
    }

    return response;
}

module.exports = {
    generate: generate
}