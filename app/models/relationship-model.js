'use strict';

const mongoose = require('mongoose');
const workspaceDefinitions = require('./subschemas/workspace');
const stixCoreDefinitions = require('./subschemas/stix-core');

const relationshipProperties = {
    // relationship specific properties
    modified: { type: Date, required: true },
    name: { type: String, trim: true },
    description: { type: String, trim: true },
    relationship_type: { type: String, required: true, trim: true },
    source_ref: { type: String, required: true, trim: true },
    target_ref: { type: String, required: true, trim: true },
    start_time: Date,
    stop_time: Date,

    // ATT&CK custom stix properties
    x_mitre_modified_by_ref: { type: String, trim: true },
    x_mitre_deprecated: Boolean,
    x_mitre_version: { type: String, trim: true },
    x_mitre_attack_spec_version: { type: String, trim: true }
};

// Create the definition
const relationshipDefinition = {
    workspace: {
        ...workspaceDefinitions.common
    },
    stix: {
        ...stixCoreDefinitions.commonRequiredSDO,
        ...stixCoreDefinitions.commonOptionalSDO,
        ...relationshipProperties
    }
};

// Create the schema
const relationshipSchema = new mongoose.Schema(relationshipDefinition);

relationshipSchema.index({ 'stix.id': 1, 'stix.modified': -1 }, { unique: true });

// Create the model
const RelationshipModel = mongoose.model('Relationship', relationshipSchema);

module.exports = RelationshipModel;
