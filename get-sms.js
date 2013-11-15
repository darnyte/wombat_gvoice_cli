#!/usr/bin/env node
//heavily edited from the voice.js example, requiring more dependencies and the like.

var voicejs = require('./voice.js');
var colors = require('./colors');


var client = new voicejs.Client({
	email: process.argv[2] || 'email@gmail.com',
	password: process.argv[3] || 'password',
	tokens: require('./tokens.json')
});


// Get the 5 latest UNREAD sms conversations and display their threads, from first text to last
client.get('unread', {limit:3}, function(error, response, data){
	if(error){
		return console.log(error);
	}
	
	if(!data || !data.conversations_response || !data.conversations_response.conversationgroup){ return console.log('No conversations.')}
	console.log('SMS: Latest conversations.');
	data.conversations_response.conversationgroup.forEach(function(convo){
		//console.log('\n', convo.conversation.label);
		if (convo.conversation.label.indexOf('sms') == 2) {
		//kludge to limit number of messages presented in each convo
		var i = 0;
		console.log('\n', convo.conversation.status == 1 ? ' ' : '+', new Date(convo.conversation.conversation_time).toDateString(), convo.call[0].phone_number, convo.conversation.id);
		convo.call.reverse().forEach(function(msg){
			if (i < 7){
				// message type 11 - from me
				// message type 10 - from them
				if (msg.type == 11){
					console.log(new Date(msg.start_time).toLocaleTimeString().replace(/[ZT]/g,' ').substr(0,16),' ',msg.message_text.grey);
					} else {
					console.log(new Date(msg.start_time).toLocaleTimeString().replace(/[ZT]/g,' ').substr(0,16),' ',msg.message_text.cyan);
					}

//				console.log(new Date(msg.start_time).toISOString().replace(/[ZT]/g,' ').substr(0,16), msg.message_text, msg.type);
				}
			i++;
		});
	}
	});
});
