/*jslint  esversion: 6 */

var express = require('express');

var app = express();

var Hospital = require('../models/hospital');


app.get('/todo/:busqueda', (request, response, next) => {

    var busqueda = request.params.busqueda;
    var regexp = RegExp(busqueda, 'i');

    buscarHospitales(busqueda, regexp)
        .then(hospitales => {

            response.status(200).json({
                ok: true,
                hospitales: hospitales,
            });

        });


});

function buscarHospitales(busqueda, regexp) {

    return new Promise((resolve, reject) => {

        Hospital.find({ nombre: regexp }, (err, hospitales) => {

            if (err) {

                reject('Error al cargar hospitales ', err);

            } else {

                resolve(hospitales);

            }


        });

    });

}

module.exports = app;