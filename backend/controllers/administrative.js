const Police = require('../models/Police')
const Token = require('../models/Token')
const Offense = require('../models/Offense')
const CustomErrors = require('../errors')
const {StatusCodes} = require('http-status-codes')
const crypto = require('crypto')
const {attachCookiesToResponse, checkPermissions, createPayload} = require('../utils')

const login = async (req,res) =>{
    const {badgenumber, password} = req.body
    const findPolice = await Police.findOne({badgenumber:badgenumber})
    if(!findPolice){
        throw new CustomErrors.NotFoundError('Failed')
    }
    const checkPassword = await findPolice.comparePassword(password)
    if(!checkPassword){
        throw new CustomErrors.UnauthenticatedError('Not found password')
    }
    let refreshToken = '';
    // check for existing token
    const existingToken = await Token.findOne({ policeMongoID: findPolice._id });
    if (existingToken) {
        const { isValid } = existingToken;
        if (!isValid) {
            throw new CustomErrors.UnauthenticatedError('Invalid Credentials');
        }
        refreshToken = existingToken.refreshToken;
        attachCookiesToResponse({ res, police: existingToken, refreshToken });
    }else{
        refreshToken = crypto.randomBytes(40).toString('hex');
        const userAgent = req.headers['user-agent'];
        const ip = req.ip;
        const userToken = { refreshToken, ip, userAgent, policeMongoID: findPolice._id, role: findPolice.role };
        await Token.create(userToken);
        const cookieToken = createPayload(findPolice)
        attachCookiesToResponse({ res, police: cookieToken, refreshToken });
    }
    findPolice.loginHistory.push(Date.now())
    await findPolice.save()
    res.status(StatusCodes.OK).json({msg:`Login succesful`});
}

const register = async (req,res) =>{ //assumes "role" is selectable - not self written. 
    const {badgenumber, role} = req.body
    if(!badgenumber){
        throw new CustomErrors.BadRequestError(`Bad badgenumber`)
    }
    const tryFindingBadgeNumber = await Police.findOne({badgenumber:badgenumber, role:role})
    if(tryFindingBadgeNumber){
        throw new CustomErrors.BadRequestError(`Attempting to create duplicate account`)
    }
    const police = await Police.create(req.body)
    police.loginHistory = []
    res.status(StatusCodes.CREATED).json({msg: `Register succesful`, police: police});
}

const loginHistory = async (req,res) =>{
    if(req.police.badgenumber != req.body.badgenumber){
        throw new CustomErrors.UnauthorizedError(`Unauthenticated`)
    }
    const {badgenumber} = req.body
    const findPolice = await Police.findOne({badgenumber:badgenumber})
    if(!findPolice){
        throw new CustomErrors.NotFoundError(`Counldn't find account`)
    }
    res.status(StatusCodes.OK).json({history: findPolice.loginHistory});
}

const showAllStaff = async (req,res) => {
    const allStaff = await Police.find({})
    res.status(StatusCodes.OK).json({StaffList: allStaff});
}

const showOneStaff = async (req,res) => {
    checkPermissions(req.police, req.params.id)
    const staff = await Police.find({_id:req.params.id})
    res.status(StatusCodes.OK).json({staff: staff});
}

const showMe = async (req,res) => {
    const {policeMongoID} = req.police
    const findMe = await Police.findOne({_id:policeMongoID})
    const message = {badgenumber: findMe.badgenumber, role: findMe.role, forDebugging: req.police}
    res.status(StatusCodes.OK).json(message);
}

const updateStaffNotPassword = async (req,res) => {
    checkPermissions(req.police, req.params.id)
    const police = await Police.findOne({_id:req.params.id})
    police.role = req.body.role
    police.badgenumber = req.body.badgenumber
    await police.save()
    const newToken = createPayload(police)
    const existingToken = await Token.findOne({ policeMongoID: police._id });
    attachCookiesToResponse({res,police: newToken, refreshToken: existingToken.refreshToken})
    res.status(StatusCodes.OK).json(police);
}

const updateStaffPassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      throw new CustomErrors.BadRequestError('Please provide both values');
    }
    const {policeMongoID} = req.police
    const police = await Police.findOne({_id:policeMongoID})
    const isPasswordCorrect = await police.comparePassword(oldPassword);
    if (!isPasswordCorrect) {
      throw new CustomErrors.UnauthenticatedError('Invalid Credentials');
    }
    police.password = newPassword;
    await police.save();
    res.status(StatusCodes.OK).json({ msg: 'Success! Password Updated.' });
};

const showMyTicketingHistory = async (req,res) => {
    const {policeMongoID} = req.police
    const police = await Police.findOne({_id:policeMongoID})
    let history = []
    for(const ticket of police.ticketingHistory){
        const offense = await Offense.findOne({_id:ticket})
        history.push(offense)
    }
    res.status(StatusCodes.OK).json(history);
}

const showStaffTicketingHistory = async (req,res) => {
    const police = await Police.findOne({_id:req.params.id})
    let history = []
    for(const ticket of police.ticketingHistory){
        const offense = await Offense.findOne({_id:ticket})
        history.push(offense)
    }
    res.status(StatusCodes.OK).json(history);
}

const logout = async (req, res) => {
    await Token.findOneAndDelete({ policeMongoID: req.police.policeMongoID });

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

module.exports = {login,
                register,
                loginHistory,
                showAllStaff,
                showMe,showOneStaff,
                updateStaffNotPassword, 
                updateStaffPassword,
                logout, 
                showMyTicketingHistory,
                showStaffTicketingHistory}
