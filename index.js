'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

app.set('port', (process.env.PORT || 5000))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// parse application/json
app.use(bodyParser.json())

// index
app.get('/', function (req, res) {
	res.send('hello world i am a secret bot')
})

// for facebook verification
app.get('/webhook/', function (req, res) {
	if (req.query['hub.verify_token'] === 'more_than_what_meets_the_eye') {
		res.send(req.query['hub.challenge'])
	} else {
		res.send('Error, wrong token')
	}
})



// spin spin sugar
app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'))
})