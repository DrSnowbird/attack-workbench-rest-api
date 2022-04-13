'use strict';

const mongoose = require('mongoose');

// Create the definition
const systemConfigurationDefinition = {
    organization_identity_ref: { type: String, required: true, trim: true },
    anonymous_user_account_id: { type: String, trim: true },
    default_marking_definitions: [ { type: String, trim: true } ],
    organization_namespace: {
        range_start: { type: Number, default: null },
        prefix: { type: String, trim: true, default: null }
    }
};

// Create the schema
const systemConfigurationSchema = new mongoose.Schema(systemConfigurationDefinition, { bufferCommands: false });

// Create the model
const SystemConfigurationModel = mongoose.model('SystemConfiguration', systemConfigurationSchema);

module.exports = SystemConfigurationModel;
