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

if (process.argv.indexOf('--getread') > -1) {
	var which = 'sms';
	} else {
	var which = 'unread';
	}

var markread = 0;
if (process.argv.indexOf('--markread') > -1) {
	markread = process.argv.indexOf('--markread');
	console.log('Auto-Marking Read'.bold.red);
}

//Max number of threads to retrieve
if (process.argv.indexOf('--maxthreads') > -1) {
	var placeholder = process.argv.indexOf('--maxthreads');
	placeholder++;
}
var maxthreads = parseFloat(process.argv[placeholder]) || 3;
maxthreads++;  //dunno why - was getting -1 threads.

//Max number of messages per thread to retrieve
if (process.argv.indexOf('--maxmessages') > -1) {
	var placeholder2 = process.argv.indexOf('--maxmessages');
	placeholder2++;
}
var maxmessages = parseFloat(process.argv[placeholder2]) || 5;

if (process.argv.indexOf('--help') > -1) {
	console.log('###############################################################'.green);	
	console.log('Without variables, will default to the most recent unread SMS');
	console.log('--maxmessages [NUMBER]');
	console.log('--maxthreads [NUMBER]');
	console.log('--getread');
	console.log('--markread');
	console.log('--interactive');
	console.log('--help');
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

var threadnumber =0;

// Get the X latest UNREAD sms conversations and display their threads, from first text to last
client.get('sms', {limit:maxthreads}, function(error, response, data){
	if(error){	return console.log(error);	}
	if(!data || !data.conversations_response || !data.conversations_response.conversationgroup){ return console.log('No conversations.')}
	console.log('###############################################################'.green);
	console.log('SMS: Latest ' +maxthreads+ ' conversations with ' +maxmessages+ ' messages in each thread.');
	data.conversations_response.conversationgroup.forEach(function(convo){
		//test string area here.
		//console.log('\n', convo.conversation.phone_number);
		
		if (convo.conversation.label.indexOf(which) > -1) {
			//push to array of ids for later use
			ids.push(convo.conversation.id)
			
			//kludge to limit number of messages presented in each convo
			var i = 0;
			console.log('\nThread'.red,threadnumber, convo.conversation.status == 1 ? ' ' : '+'.red, new Date(convo.conversation.conversation_time).toDateString().green, convo.call[0].phone_number.bold.blue, convo.conversation.id);
			threadnumber++;
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
	if (markread !== 0){
		client.set('mark', {read: true, id: ids}, function(error, response, data){
			if(error){ return console.log(error); }
			console.log('\nMarked conversations as read successfully.'.bold.red);
		});	
	};
	// end non-interactive part //
	//put in opportunity to reply here
	if (process.argv.indexOf('--interactive') > -1) {
		console.log('###############################################################'.green);
		ask("Using the Thread ID number, which thread would you care to reply to?", /.+/, function(name) {
			if (ids[name] != undefined){
				client.get('byId', {id: ids[name]}, function(error, response, data){
					if(error){	return console.log(error);	}
					data.conversations_response.conversationgroup.forEach(function(convo){
						var to = convo.conversation.phone_number;
						ask("Your reply is?", /.+/, function(text) {
							client.sms({ to: to, text: text}, function(err, res, data){
								if(err){return console.log(err);}
								console.log('SMS "' +text+ '" sent to', to);
								process.exit();
							});
						});
					});
				});	
			} else { console.log('That is not a valid thread.'); process.exit();};
		});	
	}
});
