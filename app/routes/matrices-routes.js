'use strict';

const express = require('express');

const matricesController = require('../controllers/matrices-controller');
const authn = require('../lib/authn-middleware');
const authz = require('../lib/authz-middleware');

const router = express.Router();

router.route('/matrices')
    .get(
        authn.authenticate,
        authz.requireRole(authz.visitorOrHigher),
        matricesController.retrieveAll
    )
    .post(
        authn.authenticate,
        authz.requireRole(authz.editorOrHigher),
        matricesController.create
    );

router.route('/matrices/:stixId')
    .get(
        authn.authenticate,
        authz.requireRole(authz.visitorOrHigher),
        matricesController.retrieveById
    );

router.route('/matrices/:stixId/modified/:modified')
    .get(
        authn.authenticate,
        authz.requireRole(authz.visitorOrHigher),
        matricesController.retrieveVersionById
    )
    .put(
        authn.authenticate,
        authz.requireRole(authz.editorOrHigher),
        matricesController.updateFull
    )
    .delete(
        authn.authenticate,
        authz.requireRole(authz.admin),
        matricesController.delete
    );

module.exports = router;
