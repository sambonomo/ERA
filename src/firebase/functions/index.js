// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Admin SDK
admin.initializeApp();

// If your new functions are in these paths:
const { inviteEmployee } = require('./inviteEmployee');
const { onKudosCreate } = require('./triggers/onKudosCreate');

// Export callable function(s)
exports.inviteEmployee = inviteEmployee;

// Export trigger function(s)
exports.onKudosCreate = onKudosCreate;
