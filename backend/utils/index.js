const { createJWT, validateAndDecipherToken, attachCookiesToResponsePolice, attachCookiesToResponseUser } = require('./jwt');
const {createPayloadPolice,createPayloadUser} = require('./createPayload');
const checkPermissions = require('./checkPermissions');
const createHash = require('./createHash');

module.exports = {
  createJWT,
  validateAndDecipherToken,
  attachCookiesToResponsePolice,
  createPayloadPolice,
  checkPermissions,
  createHash,
  attachCookiesToResponseUser,
  createPayloadUser
};
