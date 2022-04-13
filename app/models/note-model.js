'use strict';

const mongoose = require('mongoose');
const AttackObject = require('./attack-object-model');

const noteProperties = {
    // note specific properties
    modified: { type: Date, required: true },
    abstract: { type: String, trim: true },
    content: { type: String, required: true, trim: true },
    authors: [ { type: String, trim: true } ],
    object_refs: { type: [ { type: String, trim: true } ], required: true },

    // ATT&CK custom stix properties
    x_mitre_modified_by_ref: { type: String, trim: true },
    x_mitre_deprecated: Boolean,
    x_mitre_attack_spec_version: { type: String, trim: true }
};

// Create the definition
const noteDefinition = {
    stix: {
        ...noteProperties
    }
};

// Create the schema
const noteSchema = new mongoose.Schema(noteDefinition);

// Create the model
const NoteModel = AttackObject.discriminator('NoteModel', noteSchema);

module.exports = NoteModel;
