const mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose')
const findOrCreate = require('mongoose-findorcreate')
//const bcrypt = require('bcrypt')


const userSchema = new mongoose.Schema({
    email: {
        type: String
    },
    password: {
        type: String,
        trim: true
    },
    googleId: {
        type: String
    },
    secret: {
        type: String
    }
}) 

// plugins

userSchema.plugin(passportLocalMongoose)
userSchema.plugin(findOrCreate)

//=======

/* userSchema.statics.findByCredentials = async (tryUsername, tryPassword) => {
    
    const foundUser = await User.findOne( {email: tryUsername} )
    
    if(!foundUser){
        throw new Error('unable to login')
    }

    const matchPass = await bcrypt.compare(tryPassword, foundUser.password)
    
    //best if error message is generic for information purposes
    if(!matchPass){
        throw new Error('unable to login')
    }

    return foundUser

} */


//run before user is saved

// bcrypt
/* userSchema.pre('save' , async function(next) {
    const user = this
    const saltRounds = 10

    if(user.isModified('password')){
        const hashedPassword = await bcrypt.hash(user.password, saltRounds)
        user.password = hashedPassword
    }

    next()
}) */

// define after hooks

const User = mongoose.model('user' , userSchema)

module.exports = {
    User
}