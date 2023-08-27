const asynchandler = require('express-async-handler')

const BASE_URL = "https://vitalizemind-flaskapi.onrender.com"

const videoApiURL = `${BASE_URL}/video/getVideos`
const booksApiURL = `${BASE_URL}/books/getBooks`
const musicApiURL = `${BASE_URL}/music/getMusics`

const getVideo = asynchandler((req, res) => {
    const { preferences, currentEmotion } = req.body

    try {
        fetch(videoApiURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ preferences, current_emotion: currentEmotion })
        })
        .then(response => response.json())
        .then(data => {
            videoIds = data.videoIds
            return res.status(200).json({ videoIds: videoIds })
        })
        .catch(error => {
            console.log("This is the error: " , error)
            return res.status(500).json({ message: `An error occured: ${error}` })
        })
    } catch (error) {
        return res.status(500).json({ message: `An error occured: ${error}` })
    }
    
}) 

const getMusic = asynchandler((req, res) => {
    const { preferences, currentEmotion } = req.body

    try {
        fetch(musicApiURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ preferences, current_emotion: currentEmotion })
        })
        .then(response => response.json())
        .then(data => {
            musicIds = data.musicIds
            return res.status(200).json({ musicIds: musicIds })
        })
        .catch(error => {
            console.log("This is the error: " , error)
            return res.status(500).json({ message: `An error occured: ${error}` })
        })
    } catch (error) {
        return res.status(500).json({ message: `An error occured: ${error}` })
    }
})

const getBooks = asynchandler((req, res) => {
    const { preferences, currentEmotion } = req.body

    if (!preferences || !currentEmotion) {
        return res.status(400).json({ message: 'Not enough data for fetching books.' })
    }

    try {
        fetch(booksApiURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ preferences, current_emotion: currentEmotion })
        })
        .then(response => response.json())
        .then(data => {
            console.log(data)
            books = data.books
            return res.status(200).json({ books: books })
        })
        .catch(error => {
            console.log("This is the error: " , error)
            return res.status(500).json({ message: `An error occured: ${error}` })
        })
    } catch (error) {
        return res.status(500).json({ message: `An error occured: ${error}` })
    }
})

module.exports = {
    getVideo,
    getMusic,
    getBooks
}