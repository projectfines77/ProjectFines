const { createJWT, validateAndDecipherToken, attachCookiesToResponse } = require('./jwt');
const createPayload = require('./createPayload');
const checkPermissions = require('./checkPermissions');
const createHash = require('./createHash');

module.exports = {
  createJWT,
  validateAndDecipherToken,
  attachCookiesToResponse,
  createPayload,
  checkPermissions,
  createHash,
};
