'use strict';

const mongoose = require('mongoose');

// Create the definition
const systemConfigurationDefinition = {
    organization_identity_ref: { type: String, required: true }
};

// Create the schema
const systemConfigurationSchema = new mongoose.Schema(systemConfigurationDefinition, { bufferCommands: false });

// Create the model
const SystemConfigurationModel = mongoose.model('SystemConfiguration', systemConfigurationSchema);

module.exports = SystemConfigurationModel;
