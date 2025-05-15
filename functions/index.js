// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp();

// Export scheduled/trigger-based functions
exports.sendBirthdayNotification = require('./sendBirthdayNotification');
exports.sendAnniversaryTeams = require('./sendAnniversaryTeams');
exports.generateKudosSummary = require('./generateKudosSummary');

// Export callable functions (like Stripe checkout)
exports.createCheckoutSession = require('./createCheckoutSession').createCheckoutSession;
