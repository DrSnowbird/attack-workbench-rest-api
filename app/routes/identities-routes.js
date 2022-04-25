'use strict';

const express = require('express');

const identitiesController = require('../controllers/identities-controller');
const authn = require('../lib/authn-middleware');
const authz = require('../lib/authz-middleware');

const router = express.Router();

router.route('/identities')
    .get(
        authn.authenticate,
        authz.requireRole(authz.visitorOrHigher),
        identitiesController.retrieveAll
    )
    .post(
        authn.authenticate,
        authz.requireRole(authz.editorOrHigher),
        identitiesController.create
    );

router.route('/identities/:stixId')
    .get(
        authn.authenticate,
        authz.requireRole(authz.visitorOrHigher),
        identitiesController.retrieveById
    );

router.route('/identities/:stixId/modified/:modified')
    .get(
        authn.authenticate,
        authz.requireRole(authz.visitorOrHigher),
        identitiesController.retrieveVersionById
    )
    .put(
        authn.authenticate,
        authz.requireRole(authz.editorOrHigher),
        identitiesController.updateFull
    )
    .delete(
        authn.authenticate,
        authz.requireRole(authz.admin),
        identitiesController.delete
    );

module.exports = router;
