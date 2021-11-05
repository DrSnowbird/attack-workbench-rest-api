'use strict';

const mongoose = require('mongoose');

// Create the definition
const userAccountDefinition = {
    id: { type: String, required: true },
    email: String,
    username: { type: String, required: true },
    status: { type: String, required: true },
    role: { type: String }
};

// Create the schema
const userAccountSchema = new mongoose.Schema(userAccountDefinition, { bufferCommands: false });

// Create the model
const UserAccountModel = mongoose.model('UserAccount', userAccountSchema);

module.exports = UserAccountModel;
