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
var flag = false
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
app.use('/location',express.static('local/location'));
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
			    "text": "yes"
			},
			{
			    "type": "message",
			    "label": "No",
			    "text": "no"
			}
		    ]
		}
	    }
	    return client.replyMessage(event.replyToken, echo);
	}else if(event.message.type=='image'){
	    console.log(event)
	    var echo = { type: 'text', text: "画像受付完了、地点を登録してください" };
	    //ファイル取得
	    var messageid=event.message.id
	    var num=1
	    var txt=`python python/lineGetImage.py ${messageid} ${num} python/image`

	    const exec = require('child_process').exec;

	    exec(txt, (err, stdout, stderr) => {
		if (err) { console.log(err); }
		console.log(stdout);
	    });
	    flag=true

	    return client.replyMessage(event.replyToken, echo);
	}else if(event.message.type=='text' && flag==true){
        //    flag=false

	//    console.log("gps解析中")
	    console.log(event)

	    var message=event.message.text
	    var txt=`python python/getGeo.py ${message} python/img`

	    const exec = require('child_process').exec;

	    exec(txt, (err, stdout, stderr) => {
		if (err) { console.log(err); }
		console.log(stdout);
	    });

	    const echo = { type: 'text', text: "gpx解析中" };
	    return client.replyMessage(event.replyToken,echo);
	}else if(event.message.type=='text' && event.message.text=='yes'){
	    const echo = { type: 'text', text: "写真を送ってください" };
	    return client.replyMessage(event.replyToken,echo);
	}else if(event.message.type=='text' && event.message.text=='no'){
            const echo = { type: 'text', text: "場所を教えてください" };
	    flag=true
	    return client.replyMessage(event.replyToken,echo);
	}else if(event.message.type=='location' && flag==true){
	    console.log(event)
	    flag=false
	    fs.writeFile("local/location/loc.txt",event.message.latitude+":"+event.message.longitude, function (err) {
		console.log(err);
	    });
	    const echo={ type: 'text', text: event.message.address+"を登録しました" };
	    return client.replyMessage(event.replyToken,echo);
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
