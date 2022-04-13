'use strict';

const mongoose = require('mongoose');

const collectionVersion = {
    collection_ref: { type: String, required: true },
    collection_modified : { type: Date, required: true }
}
const collectionVersionSchema = new mongoose.Schema(collectionVersion, { _id: false });

/**
 * Workspace property definition for most object types
 */
module.exports.common = {
    workflow: {
        state: {
            type: String,
            enum: [
                'work-in-progress',
                'awaiting-review',
                'reviewed',
                'static'
            ]
        },
        created_by_user_account: { type: String, trim: true }
    },
    attack_id: { type: String, trim: true },
    collections: [ collectionVersionSchema ]
};

// x-mitre-collection workspace structure

const exportData = {
    export_timestamp: Date,
    bundle_id: { type: String, trim: true }
};
const exportDataSchema = new mongoose.Schema(exportData, { _id: false });

const importError = {
    object_ref: { type: String, required: true },
    object_modified : { type: Date },
    error_type: { type: String, required: true },
    error_message: { type: String, trim: true }
};
const importErrorSchema = new mongoose.Schema(importError, { _id: false });

/**
 * Workspace property definition for collection objects
 */
const importCategories = {
    additions: [ { type: String, trim: true } ],
    changes: [ { type: String, trim: true } ],
    minor_changes: [ { type: String, trim: true } ],
    revocations: [ { type: String, trim: true } ],
    deprecations: [ { type: String, trim: true } ],
    supersedes_user_edits: [ { type: String, trim: true } ],
    supersedes_collection_changes: [ { type: String, trim: true } ],
    duplicates: [ { type: String, trim: true } ],
    out_of_date: [ { type: String, trim: true } ],
    errors: [ importErrorSchema ]
};

const importReferences = {
    additions: [ { type: String, trim: true } ],
    changes: [ { type: String, trim: true } ]
};

const reimportData = {
    imported: Date,
    import_categories: importCategories,
    import_references: importReferences
};

module.exports.collection = {
    imported: Date,
    exported: [ exportDataSchema ],
    import_categories: importCategories,
    import_references: importReferences,
    reimports: [ reimportData ],
    workflow: {
        state: {
            type: String,
            enum: [
                'work-in-progress',
                'awaiting-review',
                'reviewed'
            ]
        },
        created_by_user_account: { type: String, trim: true },
        release: Boolean
    }
};
