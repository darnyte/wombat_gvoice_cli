#!/usr/bin/env node

//Edited from the voice.js example

var voicejs = require('./voice.js');

var client = new voicejs.Client({
	email: process.argv[2] || 'email@gmail.com',
	password: process.argv[3] || 'password',
	tokens: require('./tokens.json')
});

var placeholder=0;

if (process.argv.indexOf('--to') > -1) {
	placeholder = process.argv.indexOf('--to');
	placeholder++;
}
var to = [process.argv[placeholder],process.argv[placeholder]] ;

var placeholder=0;
if (process.argv.indexOf('--message') > -1) {
	placeholder = process.argv.indexOf('--message');
	placeholder++;
}
var text = process.argv[placeholder] || 'This is a test sms from voice.js';

// There are two ways to send texts. 
// The first method returns the new conversation id, but doesn't allow sending to multiple recipients
client.sms({ to: to[0], text: text}, function(err, res, data){
	if(err){
		return console.log(err);
	}
	console.log('SMS "' +text+ '" sent to', to[0]);
});

