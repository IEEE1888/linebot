'use strict';

const line = require('@line/bot-sdk');
const express = require('express');

// create LINE SDK config from env variables
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,

};

// create LINE SDK client
const client = new line.Client(config);

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

app.get('/', function (req, res) {
  res.send('Hello World!');
});
app.get('/test', function (req, res) {
  res.send('Hello World!test');
});
// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/callback', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

// event handler
function handleEvent(event) {

  if(event.type == 'message'){
    console.log(event)
    if(event.message.type=='text' && event.message.text=="テスト"){
	//const echo ={ type: 'text', text: "路面"};
	const echo ={
	    "type": "template",
	    "altText": "this is a confirm template",
	    "template": {
		"type": "confirm",
		"text": "写真はありますか？",
		"actions": [
		    {
			"type": "message",
			"label": "Yes",
			"text": "photoyes"
		    },
		    {
			"type": "message",
			"label": "No",
			"text": "photono"
		    }
		]
	    }
	}
	return client.replyMessage(event.replyToken, echo);
    }else if(evnet.message.type=='image'){
	var echo = { type: 'text', text: "画像を受け付けました" };
	return client.replyMessage(event.replyToken, echo);
    }
  }else{
      console.log(event);
      const echo = { type: 'text', text: "解析中" };
      return client.replyMEssage(event.replyToken,echo);
  }
 // create a echoing text message
  const echo = { type: 'text', text: event.message.text };

  // use reply API
  return client.replyMessage(event.replyToken, echo);
}

// listen on port
const port = process.env.PORT || 80;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
