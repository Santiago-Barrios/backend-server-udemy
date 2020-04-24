/*jslint  esversion: 6 */

var express = require('express');

var app = express();


app.get('/', (request, response, next) => {

    response.status(200).json({
        ok: true,
        mensaje: 'Petición realizada correctamente',
    });
});

module.exports = app;