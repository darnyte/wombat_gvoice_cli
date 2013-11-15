#!/bin/bash

# This is a small bash wrapper to make sending sms from the commandline easy.
# Dependencies are the voice.js script from node.js (link should be in the readme)
# It currently has some rudimentary incorporation of ppl address book

if [ "$1" = "--help" ]; then
	echo "This script is a bash wrapper to send sms using the voice.js library for node.js"
	echo "Usage:  sendsms [NUMBER] [MESSAGE]"
	echo "If you have ppl installed, you may substitute the name of a ppl contact for a number."

# Test if input is phone number
re='^[0-9]+$'
if ! [[ $1 =~ $re ]]; then
	#does ppl exist?
	pplprog=$(which ppl)
	if [ -f $pplprog ]; then
		number=$(ppl phone| grep "$1" |awk -F ' ' '{print $2}')
    fi
#	To eventually incorporate googlecl contact lookups.  It's difficult at the moment.    
#	if [ "$number" == "" ];then 
#		googleclprog=$(which google)
#		if [ -f $googleclprog ]; then
#			Searching is hell through googlecl!
#			google contacts list --fields=name,phone Chris|grep -v "None"
#			Chris Fake,home ###-###-####; mobile ##########; work #########
#			Chris Fake2,mobile ###.###.###; other ###.###.####
#		fi
#    fi
else
	number = "$1"
fi

if [ "$number" == "" ];then
	echo "You must have a valid contact number or input one at the commandline."
	exit
fi

if [ $# -lt "2" ]; then
echo "Type in your message here and press enter."
	read message
else
	message="${@:2}"
fi

./sms.js --to "$number" --message "$message"
