/*jslint  esversion: 6 */

var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');


//===============================================================================
// Busqueda especifica
//===============================================================================
app.get('/coleccion/:tabla/:busqueda', (request, response, next) => {

    var busqueda = request.params.busqueda;
    var regexp = RegExp(busqueda, 'i');

    var tabla = request.params.tabla;

    var promesa;

    switch (tabla) {

        case 'usuarios':
            promesa = buscarUsuario(busqueda, regexp);
            break;

        case 'medicos':
            promesa = buscarMedicos(busqueda, regexp);
            break;

        case 'hospitales':
            promesa = buscarHospitales(busqueda, regexp);
            break;

        default:
            return response.status(400).json({
                ok: false,
                mensaje: 'Los tipos de busqueda solo son: usuarios, medicos y hospitales',
                error: { messaje: 'Tipo de tabla/colección no valida' }
            });

    }

    promesa.then(data => {

        response.status(200).json({
            ok: true,
            [tabla]: data,
        });

    });


});





//===============================================================================
// Busqueda general
//===============================================================================
app.get('/todo/:busqueda', (request, response, next) => {

    var busqueda = request.params.busqueda;
    var regexp = RegExp(busqueda, 'i');

    Promise.all(
            [buscarHospitales(busqueda, regexp), buscarMedicos(busqueda, regexp), buscarUsuario(busqueda, regexp)])
        .then(respuestas => {

            response.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2],
            });

        });

});

function buscarHospitales(busqueda, regexp) {

    return new Promise((resolve, reject) => {

        Hospital.find({ nombre: regexp })
            .populate('usuario', 'nombre email img')
            .exec(
                (err, hospitales) => {

                    if (err) {

                        reject('Error al cargar hospitales ', err);

                    } else {

                        resolve(hospitales);

                    }


                });

    });

}

function buscarMedicos(busqueda, regexp) {

    return new Promise((resolve, reject) => {

        Medico.find({ nombre: regexp })
            .populate('usuario', 'nombre email img')
            .populate('hospital', 'nombre')
            .exec(
                (err, medicos) => {

                    if (err) {

                        reject('Error al cargar medicos ', err);

                    } else {

                        resolve(medicos);

                    }


                });

    });

}

function buscarUsuario(busqueda, regexp) {

    return new Promise((resolve, reject) => {

        Usuario.find({}, 'nombre email img role')
            .or([{ 'nombre': regexp }, { 'email': regexp }])
            .exec((err, usuarios) => {

                if (err) {

                    reject('Error al buscar usuario ', err);

                } else {

                    resolve(usuarios);

                }


            });

    });

}


module.exports = app;