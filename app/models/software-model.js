'use strict';

const mongoose = require('mongoose');
const AttackObject = require('./attack-object-model');

const stixMalware = {
    // STIX malware and tool specific properties
    modified: { type: Date, required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    is_family: Boolean,
    labels: [ { type: String, trim: true } ],

    // ATT&CK custom stix properties
    x_mitre_modified_by_ref: { type: String, trim: true },
    x_mitre_platforms: [ { type: String, trim: true } ],
    x_mitre_deprecated: Boolean,
    x_mitre_domains: [ { type: String, trim: true } ],
    x_mitre_version: { type: String, trim: true },
    x_mitre_attack_spec_version: { type: String, trim: true },
    x_mitre_contributors: [ { type: String, trim: true } ],
    x_mitre_aliases: [ { type: String, trim: true } ],
};

// Create the definition
const softwareDefinition = {
    stix: {
        ...stixMalware
    }
};

// Create the schema
const softwareSchema = new mongoose.Schema(softwareDefinition);

// Create the model
const SoftwareModel = AttackObject.discriminator('Software', softwareSchema);

module.exports = SoftwareModel;
