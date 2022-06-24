const User = require('../models/User')
const Car = require('../models/Car')
const Token = require('../models/Token')
const CustomErrors = require('../errors')
const { StatusCodes } = require('http-status-codes')
const crypto = require('crypto')
const { attachCookiesToResponseUser, checkPermissions, createPayloadUser } = require('../utils')

const register = async (req,res) => {
    const {name,email, password} = req.body
    if(!name || !email || !password){
        throw new CustomErrors.BadRequestError(`Please supply all fields`)
    }
    const tryFindingUser = await User.findOne({name:name, email:email})
    if(tryFindingUser){
        throw new CustomErrors.BadRequestError(`Attempting to create duplicate account`)
    }
    const user = await User.create(req.body)
    res.status(StatusCodes.CREATED).json({ msg: `Register succesful`,user: user});
}

const login = async (req,res) => {
    const {email,password} = req.body
    const findUser = await User.findOne({email:email})
    if(!findUser){
        throw new CustomErrors.NotFoundError('Failed')
    }
    const checkPassword = await findUser.comparePassword(password)
    if (!checkPassword) {
        throw new CustomErrors.UnauthenticatedError('Not found password')
    }
    const existingToken = await Token.findOne({ userMongoID: findUser._id });
    if (existingToken) {
        const { isValid } = existingToken;
        if (!isValid) {
            throw new CustomErrors.UnauthenticatedError('Invalid Credentials');
        }
        refreshToken = existingToken.refreshToken;
        attachCookiesToResponseUser({ res, user: existingToken, refreshToken });
    } else {
        refreshToken = crypto.randomBytes(40).toString('hex');
        const userAgent = req.headers['user-agent'];
        const ip = req.ip;
        const userToken = { refreshToken, ip, userAgent, userMongoID: findUser._id, role: 'user' };
        await Token.create(userToken);
        const cookieToken = createPayloadUser(findUser)
        attachCookiesToResponseUser({ res, user: cookieToken, refreshToken });
    }
    res.status(StatusCodes.OK).json({ msg: `Login succesful` });
}

const showMe = async (req,res) => {
    const {userMongoID} = req.user
    const findMe = await User.findOne({_id:userMongoID})
    const message = {name: findMe.name, email: findMe.email}
    res.status(StatusCodes.OK).json({message});
}

const updateAccount = async (req,res) => {
    const {oldPassword, newPassword, email, name} = req.body
    if(oldPassword && !newPassword || newPassword && !oldPassword){
        throw new CustomErrors.BadRequestError('Please provide old and new passwords');
    }
    const { userMongoID } = req.user
    const user = await User.findOne({ _id: userMongoID })
    if(oldPassword && newPassword){
        const isPasswordCorrect = await user.comparePassword(oldPassword);
        if (!isPasswordCorrect) {
            throw new CustomErrors.UnauthenticatedError('Invalid Credentials');
        }
        user.password = newPassword;
        await user.save();
    }
    if(name){
        user.name = name
        await user.save()
        const newToken = createPayloadUser(user)
        const existingToken = await Token.findOne({ userMongoID: user._id });
        attachCookiesToResponseUser({ res, user: newToken, refreshToken: existingToken.refreshToken })
    }
    if(email){
        user.email = email
        await user.save()
    }
    res.status(StatusCodes.OK).json({ msg: `Update succesful`});
}

const deleteAccount = async (req,res) => {
    const del = await User.findOne({_id:req.user.userMongoID})
    await Token.findOneAndDelete({ userMongoID: req.user.userMongoID });
    res.cookie('accessToken', 'deleteAccount', {
        httpOnly: true,
        expires: new Date(Date.now()),
    });
    res.cookie('refreshToken', 'deleteAccount', {
        httpOnly: true,
        expires: new Date(Date.now()),
    });
    await del.remove()
    res.status(StatusCodes.OK).json({ msg: `Delete succesful` });
}

const logout = async (req,res) =>{
    await Token.findOneAndDelete({ userMongoID: req.user.userMongoID });
    res.cookie('accessToken', 'logout', {
        httpOnly: true,
        expires: new Date(Date.now()),
    });
    res.cookie('refreshToken', 'logout', {
        httpOnly: true,
        expires: new Date(Date.now()),
    });
    res.status(StatusCodes.OK).json({ msg: `Logout succesful` });
}

module.exports = {register,login,updateAccount,deleteAccount,showMe, logout}