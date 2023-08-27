require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')

const PORT = process.env.PORT || 3500
const mongoose = require('mongoose')
const connectDB = require('./config/dbConn')

connectDB()

app.use(cors({
    origin: ['http://localhost:3000', 'chrome-extension://ghigbblhibbfagimlkdjogjfcnijikpf'],
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE',
    credentials: true
}))

app.use(express.json())

app.use('/user', require('./routes/userRoute'))
app.use('/content', require('./routes/contentRoute'))

mongoose.connection.once('open', () => {
    console.log("Connected to MongoDB!")
    app.listen(PORT, () => {
        console.log(`Server listening to port ${PORT}`)
    })
})

mongoose.connection.on('error', err => {
    console.log(err)
})