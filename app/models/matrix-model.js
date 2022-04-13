'use strict';

const mongoose = require('mongoose');
const AttackObject = require('./attack-object-model');

const matrixProperties = {
    // x-mitre-matrix specific properties
    modified: { type: Date, required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },

    // ATT&CK custom stix properties
    tactic_refs: [ { type: String, trim: true } ],
    x_mitre_modified_by_ref: { type: String, trim: true },
    x_mitre_deprecated: Boolean,
    x_mitre_domains: [ { type: String, trim: true } ], // TBD drop this property
    x_mitre_version: { type: String, trim: true },
    x_mitre_attack_spec_version: { type: String, trim: true }
};

// Create the definition
const matrixDefinition = {
    stix: {
        ...matrixProperties
    }
};

// Create the schema
const matrixSchema = new mongoose.Schema(matrixDefinition);

// Create the model
const MatrixModel = AttackObject.discriminator('MatrixModel', matrixSchema);

module.exports = MatrixModel;
