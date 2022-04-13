'use strict';

const mongoose = require('mongoose');
const AttackObject = require('./attack-object-model');

const stixDataSource = {
    // STIX x-mitre-data-source specific properties
    modified: { type: Date, required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },

    // ATT&CK custom stix properties
    x_mitre_modified_by_ref: { type: String, trim: true },
    x_mitre_platforms: [ { type: String, trim: true } ],
    x_mitre_deprecated: Boolean,
    x_mitre_domains: [ { type: String, trim: true } ],
    x_mitre_version: { type: String, trim: true },
    x_mitre_attack_spec_version: { type: String, trim: true },
    x_mitre_contributors: [ { type: String, trim: true } ],
    x_mitre_collection_layers: [ { type: String, trim: true } ]
};

// Create the definition
const dataSourceDefinition = {
    stix: {
        ...stixDataSource
    }
};

// Create the schema
const dataSourceSchema = new mongoose.Schema(dataSourceDefinition);

// Create the model
const DataSourceModel = AttackObject.discriminator('Data-Source', dataSourceSchema);

module.exports = DataSourceModel;
