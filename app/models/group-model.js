'use strict';

const mongoose = require('mongoose');
const AttackObject = require('./attack-object-model');

const stixIntrusionSet = {
    // STIX intrusion-set specific properties
    modified: { type: Date, required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },

    // ATT&CK custom stix properties
    aliases: [ { type: String, trim: true } ],
    x_mitre_modified_by_ref: { type: String, trim: true },
    x_mitre_deprecated: Boolean,
    x_mitre_domains: [ { type: String, trim: true } ], // TBD drop this property
    x_mitre_version: { type: String, trim: true },
    x_mitre_attack_spec_version: { type: String, trim: true },
    x_mitre_contributors: [ { type: String, trim: true } ]
};

// Create the definition
const groupDefinition = {
    stix: {
        ...stixIntrusionSet
    }
};

// Create the schema
const groupSchema = new mongoose.Schema(groupDefinition);

// Create the model
const GroupModel = AttackObject.discriminator('Intrusion-Set', groupSchema);

module.exports = GroupModel;
