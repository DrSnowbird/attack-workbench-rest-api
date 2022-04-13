'use strict';

const mongoose = require('mongoose');
const AttackObject = require('./attack-object-model');

const identityProperties = {
    // identity specific properties
    modified: { type: Date, required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    roles: [ { type: String, trim: true } ],
    identity_class: { type: String, trim: true },
    sectors: [ { type: String, trim: true } ],
    contact_information: { type: String, trim: true },

    // ATT&CK custom stix properties
    x_mitre_modified_by_ref: { type: String, trim: true },
    x_mitre_deprecated: Boolean,
    x_mitre_version: { type: String, trim: true },
    x_mitre_attack_spec_version: { type: String, trim: true }
};

// Create the definition
const identityDefinition = {
    stix: {
        ...identityProperties
    }
};

// Create the schema
const identitySchema = new mongoose.Schema(identityDefinition);

// Create the model
const IdentityModel = AttackObject.discriminator('IdentityModel', identitySchema);

module.exports = IdentityModel;
