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




// to post data
app.post('/webhook/', function (req, res) {
	let messaging_events = req.body.entry[0].messaging
	for (let i = 0; i < messaging_events.length; i++) {
		let event = req.body.entry[0].messaging[i]
		let sender = event.sender.id
		if (event.message && event.message.text) {
			let text = event.message.text.toLowerCase()
			if (text === 'generic'){ 
				console.log("welcome to chatbot")
				sendGenericMessage(sender)
				continue
			}
			if (text === 'select'){ 
				select(sender)
				continue
			}

			sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200))
		}
		if (event.postback) {
			let text = JSON.stringify(event.postback)
			sendTextMessage(sender, "Postback received: "+text.substring(0, 200), token)
			continue
		}
	}
	res.sendStatus(200)
})


// recommended to inject access tokens as environmental variables, e.g.
// const token = process.env.FB_PAGE_ACCESS_TOKEN
const token = process.env.FB_PAGE_ACCESS_TOKEN

function sendTextMessage(sender, text) {
	let messageData = { text:text }
	let recipientData = { id: sender }
	let senderData = { id: process.env.FB_PAGE_ID }
	
	request({
		url: 'https://graph.facebook.com/v2.8/me/messages',
		qs: {access_token:token},
		method: 'POST',
		json: {
			sender: recipientData, 
			recipient: recipientData,
			message: messageData
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	//})

	}
	console.log("Message body:" + JSON.stringify(request))

}

function sendGenericMessage(sender) {

	let recipientData = { id: sender }
	let senderData = { id: process.env.FB_PAGE_ID }
	let messageData = {
		"attachment": {
			"type": "template",
			"payload": {
				"template_type": "generic",
				"elements": [{
					"title": "First card",
					"subtitle": "Element #1 of an hscroll",
					"image_url": "http://messengerdemo.parseapp.com/img/rift.png",
					"buttons": [{
						"type": "web_url",
						"url": "https://www.messenger.com",
						"title": "web url"
					}, {
						"type": "postback",
						"title": "Postback",
						"payload": "Payload for first element in a generic bubble",
					}],
				}, {
					"title": "Second card",
					"subtitle": "Element #2 of an hscroll",
					"image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
					"buttons": [{
						"type": "postback",
						"title": "Postback",
						"payload": "Payload for second element in a generic bubble",
					}],
				}]
			}
		}
	}
	request({
		url: 'https://graph.facebook.com/v2.8/me/messages',
		qs: {access_token:token},
		method: 'POST',
		json: {
			sender: recipientData, 
			recipient: recipientData,
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})
}




//mysql calls
function select(sender){
	var res = [];
	var mysql = require('mysql');
	var pool =  mysql.createPool({
	    host     : 'sql6.freemysqlhosting.net',
	    user     : 'sql6161201',
	    password : 'kRHyZIfWs5',
	    database : 'sql6161201'
	});
	
	pool.getConnection(function(err, connection){    
		//run the query
		connection.query('select * from taba',  function(err, rows){
	  		if(err)	throw err;
	  		else {
	  			console.log(rows);
	  			res = rows;
            
	  			sendDBResponse(sender,res);
	  		}
	  	});
	  
	connection.release();//release the connection
	});

}




//Send DBResponse
function sendDBResponse(sender, res) {

    var resTxt = "Your Tasks for Today:\n";
    for(var i = 0; i < res.length; i++){
        resTxt += "\n" + (1 + i) + ". " + res[i].task + ""; 
    }

	let messageData = { text:resTxt }
	let recipientData = { id: sender }
	let senderData = { id: process.env.FB_PAGE_ID }

    request({
        url: 'https://graph.facebook.com/v2.8/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
        	sender: recipientData, 
            recipient: recipientData,
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}







// spin spin sugar
app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'))
})