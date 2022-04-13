'use strict';

const mongoose = require('mongoose');

const externalReference = {
    source_name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    url: { type: String, trim: true },
    external_id: { type: String, trim: true }
};
const externalReferenceSchema = new mongoose.Schema(externalReference, { _id: false });

const killChainPhase = {
    kill_chain_name: { type: String, required: true, trim: true },
    phase_name : { type: String, required: true, trim: true }
};
module.exports.killChainPhaseSchema = new mongoose.Schema(killChainPhase, { _id: false });

module.exports.commonRequiredSDO = {
    type: {
        type: String,
        enum: [
            'attack-pattern',
            'course-of-action',
            'identity',
            'intrusion-set',
            'malware',
            'marking-definition',
            'note',
            'relationship',
            'tool',
            'x-mitre-collection',
            'x-mitre-data-source',
            'x-mitre-data-component',
            'x-mitre-matrix',
            'x-mitre-tactic'
        ]
    },
    spec_version: { type: String, required: true },
    id: { type: String, required: true },
    created: { type: Date, required: true }
};

module.exports.commonOptionalSDO = {
    created_by_ref: { type: String, trim: true },
    revoked: { type: Boolean },
    external_references: [ externalReferenceSchema ],
    object_marking_refs: [ { type: String, trim: true } ]
};
