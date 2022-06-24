const CustomError = require('../errors');
const Token = require('../models/Token');
const { attachCookiesToResponsePolice, validateAndDecipherTokenPolice } = require('../utils');

const authenticatePolice = async (req, res, next) => {
  const { refreshToken, accessToken } = req.signedCookies;
  try {
    if (accessToken) {
      const payload = validateAndDecipherTokenPolice(accessToken);
      req.police = payload.police;
      return next();
    }
    const payload = validateAndDecipherTokenPolice(refreshToken);

    const existingToken = await Token.findOne({//policeMongoID: payload.police.policeMongoID
      police: payload.police.userID,
      refreshToken: payload.refreshToken,
    });

    if (!existingToken || !existingToken?.isValid) {
      throw new CustomError.UnauthenticatedError('Authentication Invalid');
    }

    attachCookiesToResponsePolice({
      res,
      police: req.police,
      refreshToken: existingToken.refreshToken,
    });
    req.police = payload.police;
    next();
  } catch (error) {
    throw new CustomError.UnauthenticatedError('Authentication Invalid');
  }
};

const quickPermissionsCheck = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.police.role)) {
      throw new CustomError.UnauthorizedError(
        'Unauthorized to access this route quick'
      );
    }
    next();
  };
};

module.exports = {
  authenticatePolice,
  quickPermissionsCheck,
};
