'use strict';

const Busboy = require('busboy');

// workaround for AWS Lambda's weird headers  
const getContentType = (event) => {
    let contentType = event.headers['content-type']
    if (!contentType){
        return event.headers['Content-Type'];
    }
    return contentType;
};

module.exports.parseAWSLambdaEvent = (event) => new Promise((resolve, reject) => {
    const busboy = createBusboy({'content-type': getContentType(event)}, resolve, reject);
    busboy.write(event.body, event.isBase64Encoded ? 'base64' : 'binary');
    busboy.end();
});

module.exports.parseHTTPRequest = (req) => new Promise((resolve, reject) => {
    const busboy = createBusboy(req.headers, resolve, reject);
    req.pipe(busboy);
});

function createBusboy(headers, resolve, reject) {
    const busboy = new Busboy({ headers });

    const result = {};

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        file.on('data', data => {
            result.file = data;
        });

        file.on('end', () => {
            result.filename = filename;
            result.contentType = mimetype;
        });
    });

    busboy.on('field', (fieldname, value) => {
        result[fieldname] = value;
    });

    busboy.on('error', error => reject(`Parse error: ${error}`));
    busboy.on('finish', () => resolve(result));

    return busboy;
}