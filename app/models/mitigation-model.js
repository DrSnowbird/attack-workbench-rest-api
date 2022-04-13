'use strict';

const mongoose = require('mongoose');
const AttackObject = require('./attack-object-model');

const stixCourseOfAction = {
    // STIX course-of-action specific properties
    modified: { type: Date, required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },

    // ATT&CK custom stix properties
    x_mitre_modified_by_ref: { type: String, trim: true },
    x_mitre_deprecated: Boolean,
    x_mitre_domains: [ { type: String, trim: true } ],
    x_mitre_version: { type: String, trim: true },
    x_mitre_attack_spec_version: { type: String, trim: true }
};

// Create the definition
const mitigationDefinition = {
    stix: {
        ...stixCourseOfAction
    }
};

// Create the schema
const mitigationSchema = new mongoose.Schema(mitigationDefinition);

// Create the model
const MitigationModel = AttackObject.discriminator('Course-of-Action', mitigationSchema);

module.exports = MitigationModel;
