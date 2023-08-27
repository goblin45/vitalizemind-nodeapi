const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    user_name: {
        type: String
    },
    e_mail: {
        type: String,
        required: true
    },
    mobile: {
        type: Number
    },
    alertRecipients: [{
        e_mail: {
            type: String
        },
        relation: {
            type: String
        }
    }],
    password: {
        type: String,
        required: true
    },
    authKey: {
        type: String,
        required: true
    },
    preferences: {
        isSet: {
            type: Boolean
        },
        video: [{
            type: String
        }],
        music: [{
            type: String
        }],
        books: [{
            type: String
        }]
    },
    lastSearches: [{
        type: String
    }],
    currentEmotion: {
        type: String
    }
})

module.exports = mongoose.model('User', userSchema)