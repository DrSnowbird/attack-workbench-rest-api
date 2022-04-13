'use strict';

const mongoose = require('mongoose');

// Create the definition
const collectionVersionDefinition = {
    version: { type: String, required: true, trim: true },
    modified: { type: Date, required: true },
    url: { type: String, trim: true },
    taxii_url: { type: String, trim: true },
    release_notes: { type: String, trim: true }
};
const collectionVersionSchema = new mongoose.Schema(collectionVersionDefinition, { _id: false });

const collectionReferenceDefinition = {
    id: { type: String, required: true },
    name : { type: String, required: true, trim: true },
    description : { type: String, trim: true },
    created : { type: Date, required: true },
    versions : [ collectionVersionSchema ]
};
const collectionReferenceSchema = new mongoose.Schema(collectionReferenceDefinition, { _id: false });

// This is the collection index that was retrieved
const collectionIndexObjectDefinition = {
    id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    created: { type: Date, required: true },
    modified: { type: Date, required: true },
    collections: [ collectionReferenceSchema ]
};

// This is the collection index with its workspace data
const collectionIndexWrapperDefinition = {
    collection_index: {
        ...collectionIndexObjectDefinition
    },
    workspace: {
        remote_url: { type: String, trim: true },
        update_policy: {
            automatic: { type: Boolean },
            interval: { type: Number },
            last_retrieval: { type: Date },
            subscriptions: [ { type: String, trim: true } ]
        }
    }
};

// Create the schema
const options = {
    collection: 'collectionIndexes'
};
const collectionIndexSchema = new mongoose.Schema(collectionIndexWrapperDefinition, options);

// Add an index on id
// This improves the efficiency of queries and enforces uniqueness on this property
collectionIndexSchema.index({ 'collection_index.id': 1 }, { unique: true });

// Create the model
const CollectionIndexModel = mongoose.model('CollectionIndexModel', collectionIndexSchema);

module.exports = CollectionIndexModel;
