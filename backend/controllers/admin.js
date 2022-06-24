const User = require('../models/User')
const Car = require('../models/Car')
const Police = require('../models/Police')
const Admin = require('../models/Admin')
const Token = require('../models/Token')
const Offense = require('../models/Offense')
const CustomErrors = require('../errors')
const { StatusCodes } = require('http-status-codes')
const crypto = require('crypto')
const { attachCookiesToResponseAdmin, checkPermissions, createPayloadAdmin} = require('../utils')

const login = async (req, res) => {
    const { username, password } = req.body
    const findAdmin = await Admin.findOne({ username: username })
    if (!findAdmin) {
        throw new CustomErrors.NotFoundError('Failed')
    }
    const checkPassword = await findAdmin.comparePassword(password)
    if (!checkPassword) {
        throw new CustomErrors.UnauthenticatedError('Not found password')
    }
    let refreshToken = '';
    // check for existing token
    const existingToken = await Token.findOne({ adminMongoID: findAdmin._id });
    if (existingToken) {
        const { isValid } = existingToken;
        if (!isValid) {
            throw new CustomErrors.UnauthenticatedError('Invalid Credentials');
        }
        refreshToken = existingToken.refreshToken;
        attachCookiesToResponseAdmin({ res, admin: existingToken, refreshToken });
    } else {
        refreshToken = crypto.randomBytes(40).toString('hex');
        const userAgent = req.headers['user-agent'];
        const ip = req.ip;
        const userToken = { refreshToken, ip, userAgent, adminMongoID: findAdmin._id, role: 'admin' };
        await Token.create(userToken);
        const cookieToken = createPayloadAdmin(findAdmin)
        attachCookiesToResponseAdmin({ res, admin: cookieToken, refreshToken });
    }
    res.status(StatusCodes.OK).json({ msg: `Login succesful` });
}

const register = async (req, res) => { //assumes "role" is selectable - not self written. 
    const { username, password } = req.body
    if (!username || !password) {
        throw new CustomErrors.BadRequestError(`Bad details supplied`)
    }
    const tryFindingusername = await Admin.findOne({ username: username})
    if (tryFindingusername) {
        throw new CustomErrors.BadRequestError(`Attempting to create duplicate account`)
    }
    const admin = await Admin.create(req.body)
    res.status(StatusCodes.CREATED).json({ msg: `Register succesful`, admin: admin });
}

const showAllStaff = async (req, res) => {
    const allStaff = await Police.find({})
    res.status(StatusCodes.OK).json({ StaffList: allStaff });
}

const showOneStaff = async (req, res) => {
    const staff = await Police.find({ _id: req.params.id })
    res.status(StatusCodes.OK).json({ staff: staff });
}

const updateStaffNotPassword = async (req, res) => {
    const police = await Police.findOne({ _id: req.params.id })
    police.role = req.body.role
    police.badgenumber = req.body.badgenumber
    await police.save()
    const updateOffenseModel = await Offense.find({ policeThatIssuedOffenseID: req.params.id })
    // for (const police of updateOffenseModel) { //Not sure what this was for
    //     police.policeThatIssuedOffenseBadgenumber = req.body.badgenumber
    //     await police.save()
    // }
    updateOffenseModel.policeThatIssuedOffenseBadgeNumber = req.body.badgenumber
    
    //delete token from db
    await Token.findOneAndDelete({ policeMongoID: req.police.policeMongoID });
    res.cookie('accessToken', 'logout', {
        httpOnly: true,
        expires: new Date(Date.now()),
    });
    res.cookie('refreshToken', 'logout', {
        httpOnly: true,
        expires: new Date(Date.now()),
    });
    res.status(StatusCodes.OK).json({msg:'Updated!',police});
}

const showStaffTicketingHistory = async (req, res) => {
    const police = await Police.findOne({ _id: req.params.id })
    let history = []
    for (const ticket of police.ticketingHistory) {
        const offense = await Offense.findOne({ _id: ticket })
        history.push(offense)
    }
    res.status(StatusCodes.OK).json({history:history});
}

const logout = async (req, res) => {
    await Token.findOneAndDelete({ adminMongoID: req.admin.adminMongoID });

    res.cookie('accessToken', 'logout', {
        httpOnly: true,
        expires: new Date(Date.now()),
    });
    res.cookie('refreshToken', 'logout', {
        httpOnly: true,
        expires: new Date(Date.now()),
    });
    res.status(StatusCodes.OK).json({ msg: 'Succesfully logged out!' });
};

module.exports = {
    register,
    login,
    showAllStaff,
    showOneStaff,
    updateStaffNotPassword,
    showStaffTicketingHistory,
    logout
}