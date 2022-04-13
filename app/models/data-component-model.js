'use strict';

const mongoose = require('mongoose');
const AttackObject = require('./attack-object-model');

const stixDataComponent = {
    // STIX x-mitre-data-component specific properties
    modified: { type: Date, required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },

    // ATT&CK custom stix properties
    x_mitre_data_source_ref: { type: String, trim: true },
    x_mitre_modified_by_ref: { type: String, trim: true },
    x_mitre_deprecated: Boolean,
    x_mitre_domains: [ { type: String, trim: true } ],
    x_mitre_version: { type: String, trim: true },
    x_mitre_attack_spec_version: { type: String, trim: true }
};

// Create the definition
const dataComponentDefinition = {
    stix: {
        ...stixDataComponent
    }
};

// Create the schema
const dataComponentSchema = new mongoose.Schema(dataComponentDefinition);

// Create the model
const DataComponentModel = AttackObject.discriminator('Data-Component', dataComponentSchema);

module.exports = DataComponentModel;
