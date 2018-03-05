exports.badFormat = (errors) => {
    const result = {
        "http_code": "400",
        "message": "Bad or ill-formed request..",
        "errors": errors
    };
    return result;
};

exports.inputDontMatch = () => {
    const result = {
        "http_code": "404",
        "message": "The inputs does not match with our records..Please retry.."
    };
    return result;
};

exports.internalServerError = () => {
    const result = {
        "http_code": "500",
        "message": "Internal Server Error..Please retry.."
    };
    return result;
};

exports.outputResult = (result) => {
    const resJson = {
        "http_code": "200",
        "message": result
    };
    return resJson;
};

exports.makeResult = (statusCode, message) => {
    const result = {
        "http_code": statusCode,
        "message": message
    };
    return result;
};