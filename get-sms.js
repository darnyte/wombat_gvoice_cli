#!/usr/bin/env node

//heavily edited from the voice.js example, requiring more dependencies and the like.
//this is also supposed to be a standalone console app, so it incorporates several different things in ways that probably make node.js
//folks scream.

var voicejs = require('./voice.js');
var colors = require('./colors');


var client = new voicejs.Client({
	email: process.argv[2] || 'email@gmail.com',
	password: process.argv[3] || 'password',
	tokens: require('./tokens.json')
});

//Array for replying, marking read, etc.
var ids = [];
	
// Get the X latest UNREAD sms conversations and display their threads, from first text to last
client.get('unread', {limit:3}, function(error, response, data){
	if(error){	return console.log(error);	}
	if(!data || !data.conversations_response || !data.conversations_response.conversationgroup){ return console.log('No conversations.')}
	console.log('SMS: Latest conversations.');
	data.conversations_response.conversationgroup.forEach(function(convo){
		//test string area here.
		//console.log('\n', convo.conversation.phone_number);
		
		if (convo.conversation.label.indexOf('sms') > -1) {
			//push to array of ids for later use
			ids.push(convo.conversation.id)
			//kludge to limit number of messages presented in each convo
			var i = 0;
			console.log('\n', convo.conversation.status == 1 ? ' ' : '+', new Date(convo.conversation.conversation_time).toDateString(), convo.call[0].phone_number, convo.conversation.id);
			convo.call.reverse().forEach(function(msg){
			//limiting amount shown - some sms threads can be 100+ messages long.
			if (i < 7){
				// message type 11 - from me
				// message type 10 - from them
				if (msg.type == 11){
					console.log(new Date(msg.start_time).toLocaleTimeString().replace(/[ZT]/g,' ').substr(0,16),' ',msg.message_text.grey);
					} else {
					console.log(new Date(msg.start_time).toLocaleTimeString().replace(/[ZT]/g,' ').substr(0,16),' ',msg.message_text.cyan);
					}	
				}
			i++;
			});
		}
	});
});
