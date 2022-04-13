'use strict';

const mongoose = require('mongoose');
const AttackObject = require('./attack-object-model');

const stixTactic = {
    // STIX x-mitre-tactic specific properties
    modified: { type: Date, required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },

    // ATT&CK custom stix properties
    x_mitre_modified_by_ref: { type: String, trim: true },
    x_mitre_deprecated: Boolean,
    x_mitre_domains: [ { type: String, trim: true } ],
    x_mitre_version: { type: String, trim: true },
    x_mitre_attack_spec_version: { type: String, trim: true },
    x_mitre_contributors: [ { type: String, trim: true } ],
    x_mitre_shortname: { type: String, trim: true }
};

// Create the definition
const tacticDefinition = {
    stix: {
        ...stixTactic
    }
};

// Create the schema
const tacticSchema = new mongoose.Schema(tacticDefinition);

// Create the model
const TacticModel = AttackObject.discriminator('Tactic', tacticSchema);

module.exports = TacticModel;
