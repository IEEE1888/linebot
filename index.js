'use strict';
const fs = require('fs');
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

app.get('/api/delete', function(req,res){
    console.log(req.query.num)
    var txt=`rm python/image/${req.query.num}`

    const exec = require('child_process').exec;

    exec(txt, (err, stdout, stderr) =>{
	 if (err) { console.log(err); }
	    console.log(stdout);
	});

    res.send(`delete ${req.query.num}`)
});
app.use('/image', express.static('python/image'));

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
    if(event.message.type=='text' && event.message.text=="テスト"){
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
    }else if(event.message.type=='image'){
	console.log(event)
	var echo = { type: 'text', text: "画像を受け付けました" };
	//ファイル取得
	var messageid=event.message.id
	var num=1
	var txt=`python python/lineGetImage.py ${messageid} ${num} python/image`

	console.log(txt)
	const exec = require('child_process').exec;

	exec(txt, (err, stdout, stderr) => {
	    if (err) { console.log(err); }
	    console.log(stdout);
	});

	return client.replyMessage(event.replyToken, echo);
    }
  }else{
      console.log(event);
      const echo = { type: 'text', text: "解析中" };
      return client.replyMEssage(event.replyToken,echo);
  }
    console.log("error mizissou")
    var echo = { type: 'text', text: event.message.text };
    // use reply API
    return client.replyMessage(event.replyToken, echo);
}

//画像アップロード
app.post('/upimage', (req, res) => {
    let buffers = [];
    let cnt = 0;

    req.on('data', (chunk) => {
	buffers.push(chunk);
	console.log(++cnt);
    });

    req.on('end', () => {
	console.log(`[done] Image upload`);
	req.rawBody = Buffer.concat(buffers);
	//書き込み
	fs.writeFile('local/1.jpg', req.rawBody, 'utf-8',(err) => {
	    if(err) res.send('failure');
	    console.log(`[done] Image save`);
	    res.send('success');
	});
    });
});

// listen on port
const port = process.env.PORT || 80;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
