/*jslint  esversion: 6 */

var express = require('express');

var app = express();

const path = require('path');
const fs = require('fs');


app.get('/:tipo/:img', (request, response, next) => {

    var tipo = request.params.tipo;
    var img = request.params.img;

    var pathImage = path.resolve(__dirname, `../uploads/${ tipo }/${ img}`);

    if (fs.existsSync(pathImage)) {
        response.sendFile(pathImage);
    } else {
        var pathNoImage = path.resolve(__dirname, '../assets/no-img.jpg');
        response.sendFile(pathNoImage);
    }

});

module.exports = app;