'use strict';

const mongoose = require('mongoose');
const AttackObject = require('./attack-object-model');

const markingObject = {
    statement: { type: String, trim: true },
    tlp: { type: String, trim: true }
};

// TBD: Marking Definition should not have modified or revoked properties.

const markingDefinitionProperties = {
    // marking definition specific properties
    name: { type: String, trim: true },
    definition_type: { type: String, trim: true },
    definition: markingObject,

    // ATT&CK custom stix properties
    x_mitre_deprecated: Boolean,
    x_mitre_attack_spec_version: { type: String, trim: true }
};

// Create the definition
const markingDefinitionDefinition = {
    stix: {
        ...markingDefinitionProperties
    }
};

// Create the schema
const markingDefinitionSchema = new mongoose.Schema(markingDefinitionDefinition);

// Create the model
const MarkingDefinitionModel = AttackObject.discriminator('MarkingDefinitionModel', markingDefinitionSchema);

module.exports = MarkingDefinitionModel;
