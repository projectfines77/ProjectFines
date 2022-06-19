const CustomError = require('../errors');
const Token = require('../models/Token');
const { attachCookiesToResponse,validateAndDecipherToken } = require('../utils');

const authenticateUser = async (req, res, next) => {
  const { refreshToken, accessToken } = req.signedCookies;
  try {
    if (accessToken) {
      const payload = validateAndDecipherToken(accessToken);
      req.police = payload.police;
      return next();
    }
    const payload = validateAndDecipherToken(refreshToken);

    const existingToken = await Token.findOne({
      police: payload.police.userID,
      refreshToken: payload.refreshToken,
    });

    if (!existingToken || !existingToken?.isValid) {
      throw new CustomError.UnauthenticatedError('Authentication Invalid');
    }

    attachCookiesToResponse({
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
    console.log(req.police);
    if (!roles.includes(req.police.role)) {
      throw new CustomError.UnauthorizedError(
        'Unauthorized to access this route quick'
      );
    }
    next();
  };
};

module.exports = {
  authenticateUser,
  quickPermissionsCheck,
};
