wombat_gvoice_cli
=================

Providing CLI-based handling of SMS via Google Voice.

Includes:

##get-sms.js - Now with multiple commandline switches, including:
* --markread (automatically marks as read)
* --maxthreads # (max threads to pull)
* --maxmessages # (max messages to pull per thread)
* --getread (get read and unread sms - default unread ONLY)
* --interactive (allows you to respond by id to a thread)

##sms.js - Modified with commandline switch handling.  The message switch should be last.  
* --to # 
* --message TEXT OF MESSAGE

##sendsms.sh - Bash wrapper for sms.js
* Incorporates basic ppl addressbook handling
* TODO:  GoogleCL contact handling

##Requires:
* node.js framework  
* voice.js - https://github.com/amper5and/voice.js  
* colors.js - https://github.com/marak/colors.js  

Building on voice.js framework for the pure purpose of cli-based sms messaging, nothing more.  These are heavily modified from the examples in the voice.js package.  
Much is derived from voice.js examples and from gv.app
gv.app - https://github.com/matthewp/gv-app  

User input function from: http://st-on-it.blogspot.com/2011/05/how-to-read-user-input-with-nodejs.html  
