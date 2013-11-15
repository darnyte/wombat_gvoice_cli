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

if (process.argv.indexOf('--markread') > -1) {
	//this means that we will automatically mark things as read
	console.log('Marking Read');
}

if (process.argv.indexOf('--getread') > -1) {
	var which = 'sms';
	} else {
	var which = 'unread';
	}

//Max number of threads to retrieve
if (process.argv.indexOf('--maxthreads') > -1) {
	var placeholder = process.argv.indexOf('--maxthreads');
	placeholder++;
	var maxthreads = parseFloat(process.argv[placeholder]) || 5;
}

//Max number of messages per thread to retrieve
if (process.argv.indexOf('--maxmessages') > -1) {
	var placeholder2 = process.argv.indexOf('--maxmessages');
	placeholder2++;
	var maxmessages = parseFloat(process.argv[placeholder2]) || 7;
}

if (process.argv.indexOf('-h') > -1) {
	console.log('Without variables, will default to the most recent unread SMS');
	console.log('Max messages is parsed before read or unread');
	process.exit();
}


// http://st-on-it.blogspot.com/2011/05/how-to-read-user-input-with-nodejs.html
function ask(question, format, callback) {
 var stdin = process.stdin, stdout = process.stdout;
 
 stdin.resume();
 stdout.write(question + ": ");
 
 stdin.once('data', function(data) {
   data = data.toString().trim();
 
   if (format.test(data)) {
     callback(data);
   } else {
     stdout.write("It should match: "+ format +"\n");
     ask(question, format, callback);
   }
 });
}

// Get the X latest UNREAD sms conversations and display their threads, from first text to last
client.get('sms', {limit:maxthreads}, function(error, response, data){
	if(error){	return console.log(error);	}
	if(!data || !data.conversations_response || !data.conversations_response.conversationgroup){ return console.log('No conversations.')}
	console.log('SMS: Latest conversations.');
	data.conversations_response.conversationgroup.forEach(function(convo){
		//test string area here.
		//console.log('\n', convo.conversation.phone_number);
		
		if (convo.conversation.label.indexOf(which) > -1) {
			//push to array of ids for later use
			ids.push(convo.conversation.id)
			//kludge to limit number of messages presented in each convo
			var i = 0;
			console.log('\n', convo.conversation.status == 1 ? ' ' : '+'.red, new Date(convo.conversation.conversation_time).toDateString().green, convo.call[0].phone_number.bold.blue, convo.conversation.id);
			convo.call.reverse().forEach(function(msg){
			//limiting amount shown - some sms threads can be 100+ messages long.
			if (i < maxmessages){
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
	
	
	//put in opportunity to reply here
	
	//client.set('mark', {read: true, id: ids}, function(error, response, data){
		//if(error){ return console.log(error); }
	//	console.log('\nMarked conversations as read successfully.');
	//});	
	
});
