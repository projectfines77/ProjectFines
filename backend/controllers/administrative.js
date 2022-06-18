const Police = require('../models/Police')
const Token = require('../models/Token')
const CustomErrors = require('../errors')
const {StatusCodes} = require('http-status-codes')
const crypto = require('crypto')
const {attachCookiesToResponse} = require('../utils')

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
    const existingToken = await Token.findOne({ police: findPolice._id });
    if (existingToken) {
        const { isValid } = existingToken;
        if (!isValid) {
            throw new CustomErrors.UnauthenticatedError('Invalid Credentials');
        }
        refreshToken = existingToken.refreshToken;
    }else{
        refreshToken = crypto.randomBytes(40).toString('hex');
        const userAgent = req.headers['user-agent'];
        const ip = req.ip;
        const userToken = { refreshToken, ip, userAgent, policeMongoID: findPolice._id, role: findPolice.role };
        await Token.create(userToken);
        attachCookiesToResponse({ res, police: userToken, refreshToken });
    }
    findPolice.loginHistory.push(Date.now())
    await findPolice.save()
    res.status(StatusCodes.OK).json({msg:`Login succesful`});
}

const register = async (req,res) =>{
    const {badgenumber, role} = req.body
    if(!badgenumber || role !==( 'admin' || 'police')){
        throw new CustomErrors.BadRequestError(`Bad request`)
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
    const {badgenumber} = req.body
    const findPolice = await Police.findOne({badgenumber:badgenumber})
    res.status(StatusCodes.OK).json({history: findPolice.loginHistory});
}

const showAllStaff = async (req,res) => {
    const allStaff = await Police.find({})
    res.status(StatusCodes.OK).json({StaffList: allStaff});
}

const showMe = async (req,res) => {
    const {policeMongoID} = req.police
    const findMe = await Police.findOne({_id:policeMongoID})
    const message = {badgenumber: findMe.badgenumber, role: findMe.role, forDebugging: req.police}
    res.status(StatusCodes.OK).json(message);
}

const updateStaff = async (req,res) => {
    //const {police} = req.police
    //const findPolice = await Police.
}

module.exports = {login,register,loginHistory,showAllStaff,showMe}
