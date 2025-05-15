const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.sendBirthdayNotification = require("./sendBirthdayNotification");
exports.sendAnniversaryTeams = require("./sendAnniversaryTeams");
exports.generateKudosSummary = require("./generateKudosSummary");
