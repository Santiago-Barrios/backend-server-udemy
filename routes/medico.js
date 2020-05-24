/*jslint  esversion: 6 */

var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutebtificacion = require('../middlewares/autentificacion');

var app = express();

var Medico = require('../models/medico');



//==================================================================
//Obtener todos los medicos
//==================================================================
app.get('/', (request, response, next) => {

    var desde = request.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(
            (err, medicos) => {

                if (err) {
                    return response.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando medicos',
                        errors: err
                    });
                }

                Medico.count({}, (err, conteo) => {

                    response.status(200).json({
                        ok: true,
                        total_Medicos: conteo,
                        medicos: medicos,
                    });

                });


            });

});

//===============================================================================
// Obtener médico
//===============================================================================

app.get('/:id', (request, response) => {

    var id = request.params.id;

    Medico.findById(id)
        .populate('usuario', 'nombre email img')
        .populate('hospital')
        .exec((err, medico) => {

            if (err) {
                return response.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar medico',
                    errors: err
                });
            }

            if (!medico) {

                return response.status(400).json({
                    ok: false,
                    mensaje: 'Elmedico con el id ' + id + ' no existe',
                    errors: { message: 'No existe un medico con ese ID' }
                });
            }

            response.status(200).json({
                ok: true,
                medico: medico,
            });



        });

});

//===============================================================================
// Actualizar medico
//===============================================================================
app.put('/:id', mdAutebtificacion.verificaToken, (request, response) => {

    var id = request.params.id;
    var body = request.body;

    Medico.findById(id, (err, medico) => {

        if (err) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });
        }

        if (!medico) {

            return response.status(400).json({
                ok: false,
                mensaje: 'Elmedico con el id ' + id + ' no existe',
                errors: { message: 'No existe un medico con ese ID' }
            });
        }

        medico.nombre = body.nombre;
        medico.usuario = request.usuario._id;
        medico.hospital = body.hospital;

        medico.save((err, medicoGuardado) => {

            if (err) {
                return response.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });
            }

            response.status(200).json({
                ok: true,
                medico: medicoGuardado,
            });

        });

    });

});

//===============================================================================
// Crear un nuevo medico
//===============================================================================
app.post('/', mdAutebtificacion.verificaToken, (request, response) => {

    var body = request.body;
    var medico = new Medico({

        nombre: body.nombre,
        usuario: request.usuario._id,
        hospital: body.hospital,

    });

    medico.save((err, medicoGuardado) => {

        if (err) {
            return response.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico',
                errors: err
            });
        }
        response.status(201).json({
            ok: true,
            medico: medicoGuardado,
        });
    });

});

//===============================================================================
// Borrar un Medico por el id
//===============================================================================
app.delete('/:id', mdAutebtificacion.verificaToken, (request, response) => {

    var id = request.params.id;

    Medico.findByIdAndRemove(id, (err, medicoDelete) => {

        if (err) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al borrar Medico',
                errors: err
            });
        }

        if (!medicoDelete) {
            return response.status(400).json({
                ok: false,
                mensaje: 'No existe un medico con ese ID',
                errors: { message: 'El medico ha sido borrado o el ID no existe' },
            });
        }

        response.status(200).json({
            ok: true,
            medico: medicoDelete,
        });
    });


});

module.exports = app;