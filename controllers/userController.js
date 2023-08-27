const User = require('../models/User')
const asynchandler = require('express-async-handler')
const bcrypt = require('bcrypt')
const { v4: uuidv4 } = require('uuid')
const nodemailer = require('nodemailer')
//@desc create new user 
//@route POST

const createNewUser = asynchandler(async(req, res) => {
    const { name, e_mail, password, recipient1, recipient2 } = req.body

    if (!name || !e_mail || !password || !recipient1 || !recipient2) {
        return res.status(400).json({ message: 'All fields are required.' })
    }

    const duplicate = await User.findOne({ e_mail : e_mail })

    if (duplicate) {
        return res.status(400).json({ message: `Another account already exists for ${e_mail}` })
    }

    const hashPwd = await bcrypt.hash(password, 10)

    let authKey = uuidv4()

    const dupAuth = await User.findOne({ authKey: authKey })

    while (dupAuth) {
        authKey = uuidv4()
    }

    const alertRecipients = []
    alertRecipients.push(recipient1)
    alertRecipients.push(recipient2)

    const lastSearches = ["", "", "", "", ""]

    const currentEmotion = ""

    const newUser = { name, e_mail, 'password' : hashPwd, alertRecipients, authKey, lastSearches, currentEmotion }

    const userAdded = await User.create(newUser)

    if (userAdded) {
        userAdded.preferences.isSet = false
        await userAdded.save()
        res.status(200).json({ _id: userAdded._id, name: userAdded.name })
    } else {
        res.status(400).json({ message: 'Data format invalid.' })
    }
})

//@desc get user _id
//@route POST

const getUser = asynchandler(async(req, res) => {
    const { credential, password } = req.body

    if (!credential || !password) {
        res.status(400).json({ message: 'All fields are required.' })
    }

    if (!password) {
        res.status(400).json({ message: 'Must provide account password.' })
    }

    let found = false
    let userFound

    if (!found) {
        userFound = await User.findOne({ e_mail: credential })
        if (userFound) {
            found = true
        }
    }
    if (!found) {
        userFound = await User.findOne({ user_name: credential })
        if (userFound) {
            found = true
        }
    }

    if (!found) {
        return res.status(400).json({ message: `Account doesn't exist.` })
    }

    const match = await bcrypt.compare(password, userFound.password)
    
    if (!match) {
        return res.status(400).json({ message: 'Incorrect credential or password.' })
    } else {
        return res.status(200).json({ _id: userFound._id, name: userFound.name, alertRecipients: userFound.alertRecipients })
    }
})

const getUserDetails = asynchandler(async(req, res) => {
    const { _id } = req.body

    const user = await User.findById({ _id })

    if (!user) {
        return res.status(400).json({ message: "Id invalid." })
    } else {
        const userDetails = {
            e_mail: user.e_mail,
            alertRecipients: user.alertRecipients,
            name: user.name,
            preferences: user.preferences
        }
        return res.status(200).json({ user : userDetails })
    }
})

//@desc update user
//@route PATCH
const updateUser = asynchandler(async(req, res) => {

    const { _id, mobile, user_name, recipient1, recipient2, video, books, music } = req.body

    if (!_id) {
        return res.status(400).json({ message : 'Invalid data format.' })
    }

    const user = await User.findOne({ _id : _id })

    let duplicate

    if (user.user_name !== user_name) {
        duplicate = await User.findOne({ user_name : user_name })
    }

    if (duplicate) {
        return res.status(400).json({ message : 'This user name is already taken.' })
    } else {
        if (mobile) {
            user.mobile = mobile
        }
        if (user_name) {
            user.user_name = user_name
        }
        if (recipient1) {
            user.alertRecipients[0] = recipient1;
        }
        if (recipient2) {
            user.alertRecipients[1] = recipient2;
        }
        user.preferences.video = video
        user.preferences.books = books
        user.preferences.music = music
        user.preferences.isSet = true

        await user.save()
        return res.status(200).json({ message : 'Account updated.' })
    }
})

//@desc set preferences
//@route PATCH

const setPreferences = asynchandler(async(req, res) => {

    const { _id, video, music, books } = req.body

    if (!_id || !video || !music || !books) {
        return res.status(400).json({ message : 'Invalid data format.' })
    }

    const user = await User.findOne({ _id: _id })

    if (!user) {
        return res.status(400).json({ message : 'User not found.' })
    } else {
        try {
            user.preferences.video = video
            user.preferences.music = music
            user.preferences.books = books
            user.preferences.isSet = true
            
            await user.save()

            return res.status(200).json({ message : 'New preferences saved.' })
        } catch (error) {
            console.log(error)
            return res.status(500).json({ message: 'error occurred while updating user.'})
        }
        
    }
})

const getPreferences = asynchandler(async(req, res) => {

    const { _id } = req.body

    const user = await User.findOne({ _id : _id })

    if (!user) {
        return res.status(400).json({ message: 'Account doesn\'t exist.' })
    }

    if (!user.preferences.isSet) {
        return res.status(202).json({ message: 'No preference is set so far.' })
    }

    const video = user.preferences.video
    const music = user.preferences.music
    const books = user.preferences.books

    return res.status(200).json({ video: video, music: music, books: books })
})

//@desc get user extension auth key
//@route POST

const getAuthKey = asynchandler(async(req, res) => {
    const { _id } = req.body

    const user = await User.findById({_id}) 

    if (!user) {
        return res.status(400).json({ message: "Account doesn't exist." })
    }

    const authKey = user.authKey

    return res.status(200).json({ authKey: authKey })
})

//@desc compare auth key and get ID
//@route POST

const compareAuthKey = asynchandler(async(req, res) => {
    const { authKey } = req.body

    const user = await User.findOne({ authKey: authKey })

    if (!user) {
        return res.status(400).json({ message: 'Incorrect Authentication Key.' })
    }

    return res.status(200).json({ _id: user._id, name: user.name })
})

//@desc record last search
//@route POST 

const addBrowserSearch = asynchandler(async(req, res) => {

    const { _id, search } = req.body

    const user = await User.findById({ _id })

    if(!user) {
        return res.status(400).json({ message: 'User not found.' })
    }

    const dataForFlask = { newSearch: search, lastSearches: user.lastSearches }
    const flaskSearchAPI = 'https://vitalizemind-flaskapi.onrender.com/sendSearchData'

    
    const response = await fetch(flaskSearchAPI, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataForFlask),
    })

    const data = await response.json()
    console.log(data)
    const resDataMessage = data.message
    const resDataSearch = data.clearSearch
    let searchStr = ""
    resDataSearch.forEach(word => {
        if (searchStr.length > 0) {
            searchStr += " "
        }
        searchStr += word
    })
    const resDataScore = data.score
    
    const MAX_RETRIES = 10

    async function updateWithRetry(user, retries = 0) {
        try {
            if (user.lastSearches.length === 5) {
                user.lastSearches.shift();
            }
            user.lastSearches.push(searchStr)
            await user.save();
    
            console.log('User updated successfully');
        } catch (error) {
            if (error.name === 'VersionError' && retries < MAX_RETRIES) {
                console.log(`VersionError: Retrying update (retry ${retries + 1})`)
                const freshUser = await User.findById({ _id })
                await updateWithRetry(freshUser, retries + 1)
            } else {
                console.error('Error updating user:', error)
            }
        }
    }

    updateWithRetry(user)

    return res.status(200).json({ message: resDataMessage, score: resDataScore })
})

//@desc get last searches
//@route POST

const getLastSearches = asynchandler(async(req, res) => {

    const { _id } = req.body

    const user = await User.findById({ _id })

    if (!user) {
        return res.status(400).json({ messsage: 'Account doesn\'t exist.' })
    }

    const lastSearches = user.lastSearches

    return res.status(200).json({ lastSearches: lastSearches })
})

//@desc set current emotion of the user
//@route POST

const setCurrentEmotion = asynchandler(async(req, res) => {
    const { _id, currentEmotion } = req.body

    const user = await User.findById({ _id })

    if (!user) {
        return res.status(400).json({ message: 'Account doesn\'t exist.' })
    }
    try {
        user.currentEmotion = currentEmotion

        await user.save()
    } catch (error) {
        console.log(error) 
        return res.status(500).json({ message: 'error occurred while updating the user.' })
    }
    return res.status(200).json({ message: 'user updated' })
})

const getCurrentEmotion = asynchandler(async(req, res) => {
    const { _id } = req.body

    const user = await User.findById({ _id })

    if (!user) {
        return res.status(400).json({ message: 'Account doesn\'t exist.' })
    }

    const currentEmotion = user.currentEmotion

    return res.status(200).json({ currentEmotion: currentEmotion })
})

function getReverseRelation(relation) {
    if (relation == 'Mother' || relation == 'Father') {
        return "ward";
    } else if (relation == 'Relative') {
        return "relative"
    } else if (relation == 'Husband') {
        return "wife"
    } else if (relation == 'Wife') {
        return "husband"
    } else if (relation == 'friend') {
        return 'friend'
    } else {
        return 'relative'
    }
}

const sendAlert = asynchandler(async (req, res) => {
    console.log("Alert Hit!")
    const { _id } = req.body;

    const user = await User.findById({ _id });

    if (!user) {
        return res.status(400).json({ message: 'User not found.' });
    }

    const transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'vitalize.mind.team@gmail.com',
            pass: 'hlimiwizrcicvwrk',
        }
    });

    const emailPromises = user.alertRecipients.map(async (recipient) => {
        const addressingRelation = getReverseRelation(recipient.relation);
        const targetEmail = recipient.e_mail;

        const message = {
            from: 'vitalize.mind.team@gmail.com',
            to: targetEmail,
            subject: 'Alert!',
            text: `Testing... your ${addressingRelation}, ${user.name} is in danger.`,
        };

        return new Promise((resolve, reject) => {
            transport.sendMail(message, function (err, info) {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    console.log(info);
                    resolve(info);
                }
            });
        });
    });

    try {
        const emailResults = await Promise.all(emailPromises);
        return res.status(200).json({ info: emailResults });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ error: error });
    }
});

module.exports = {
    createNewUser,
    getUser,
    getUserDetails,
    updateUser,
    setPreferences,
    getPreferences,
    getAuthKey,
    compareAuthKey,
    addBrowserSearch,
    getLastSearches,
    setCurrentEmotion,
    getCurrentEmotion,
    sendAlert
}