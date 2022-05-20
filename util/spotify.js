#!/usr/bin/env node
'use strict';
/*
	
	This is a simple Spotify cli-based client with optional Icecast2/shout support!
	It should work for non-premium users, but you must connect your Spotify account to Facebook.

	Usage:
	$ node spotify <spotify uris> <playlist uri> <album uri> <track uri> <etc...>

	Created by djazz, with help from TooTallNate.
	Tested on the Raspberry Pi with node.js v0.8.21 and Arch Linux ARM.

	Installation instructions (for the Raspberry Pi):
	 - Install these packages (example for Arch Linux ARM):
	   $ sudo pacman -S nodejs git
	   If you use Raspbian, you must either compile node.js yourself or find a PPA for it.
	   The nodejs package in the Raspbian repos is outdated (v0.6 something).

	 - Put this file in a directory and name the file spotify.js, and make it executable:
	   $ chmod +x spotify.js

	 - Install the node-spotify-web node.js module
	   $ mkdir node_modules && cd node_modules
	   $ git clone git://github.com/TooTallNate/node-spotify-web.git
	   $ cd node-spotify-web/
	   $ npm install
	   $ cd ../..

	 - Create the file containing you Spotify username and password:
	   $ mkdir spotify_cred/
	   $ nano -w spotify_cred/cred.json
	   Paste this, and replace with your login details:
	   {"login": "USERNAME", "password": "PASSWORD"}
	   Press Ctrl+X, Y and Enter to save.

	 - Install the lame node.js module (mp3 codec):
	   $ npm install lame

	 - Install the speaker module (only if you want to have local audio playback,
	   not needed if you want Icecast-only):
	   $ npm install speaker

	 - (Optional) Install the node.js modules required for Icecast streaming:
	   $ npm install ogg vorbis throttle

	 - You are now done! Try run it like this:
	   $ node spotify spotify:track:3N9huFk2IceMSlKoZLaUsv


	Enjoy!

*/


// CONFIGURATION

var shuffleMode = true;
var repeatMode = true;

var enableSpeaker = true;

var enableIcecastSource = false;
var icecastPort = 8000;
var icecastHost = 'localhost';
var icecastUsername = 'source';
var icecastPassword = 'hackme';
var icecastMountMP3 = '/spotifyMP3';
var icecastMountOGG = '/spotifyOGG';
var icecastQualityMP3 = 320;
var icecastQualityOGG = 1.0;
var iceConfHeaders = {
	name: 'Spotify',
	description: 'A simple spotify client written in node.js'
};

var debugMemoryUsage = false;

// MAIN PROGRAM

if (!enableSpeaker && !enableIcecastSource) {
	console.log("No audio output selected! ;p");
	process.exit(0);
}

process.stdout.write("Loading modules: net"); var net = require('net');
process.stdout.write(", node-spotify-web"); var Spotify = require('node-spotify-web');
process.stdout.write(", lame"); var lame = require('lame');
if (enableSpeaker) {
	process.stdout.write(", speaker"); var Speaker = require('speaker');
}
if (enableIcecastSource) {
	process.stdout.write(", vorbis"); var vorbis = require('vorbis');
	process.stdout.write(", ogg"); var ogg = require('ogg');
	process.stdout.write(", throttle"); var Throttle = require('throttle');
}
process.stdout.write(", DONE!\n");

// Username and password are stored here
var cred = require('./spotify_cred/cred.json');

console.log("Shuffle mode is    "+(shuffleMode?'ON':'OFF'));
console.log("Repeat mode is     "+(repeatMode?'ON':'OFF'));
console.log("Speaker is         "+(enableSpeaker?'ON':'OFF'));
console.log("Icecast source is  "+(enableIcecastSource?'ON':'OFF'));

var uris = process.argv.length > 2 ? process.argv.slice(2) : ['spotify:track:1Wtp3JG4cyE4CU6agq7Bct'];
var currentTrack = 0;
var trackList = [];

if (debugMemoryUsage) {
	setInterval(function () {
		var mem = process.memoryUsage();
		console.log(Math.round(mem.rss/1024/1024)+" MB RSS used | "+Math.round(mem.heapUsed/1024/1024)+" MB heap used | "+Math.round(mem.heapTotal/1024/1024)+" MB heap total | "+Math.round((mem.heapUsed/mem.heapTotal)*100)+"% of heap used");
	}, 5000);
}


// ICECAST STUFF
if (enableIcecastSource) {
	console.log("Settings up Icecast...");

	var closeIcecast = function () {
		oggStream.end();
		mp3Stream.end();
		lameDecoder.end();
	}
	
	var lameEncoder = new lame.Encoder();
	lameEncoder.bitRate = icecastQualityMP3;
	var vorbisEncoder = new vorbis.Encoder({quality: icecastQualityOGG});
	var oggEncoder = new ogg.Encoder();
	vorbisEncoder.pipe(oggEncoder.stream());

	var format = {
		sampleRate: 44100,
		bitDepth: 16,
		channels: 2
	};

	// Math: https://github.com/TooTallNate/NodeFloyd/blob/master/server.js#L12-L24
	var bps = format.sampleRate * (format.bitDepth / 8 * format.channels);
	var throttle = new Throttle(bps);
	
	throttle.pipe(lameEncoder);

	// Conversion code: https://github.com/TooTallNate/node-vorbis/issues/3#issuecomment-13808401
	var leftover;
	var bytesPerSample = format.bitDepth / 8;

	throttle.on('data', function (b) {

		if (leftover) {
			b = Buffer.concat([ leftover, b ]);
		}

		var len = (b.length / bytesPerSample | 0) * bytesPerSample;
		if (len != b.length) {
			console.error('resizing Buffer from %d to %d', b.length, len);
			leftover = b.slice(len);
			b = b.slice(0, len);
		}

		var intSamples = new Int16Array(b)
			, o = new Buffer(intSamples.length * 4)
			, floatSamples = new Float32Array(o)
			, f
			, val

		for (var i = 0; i < intSamples.length; i++) {
			f = intSamples[i];
			val = (f + 0.5) / 32767.5;
			//console.log(val);
			floatSamples[i] = val;
		}

		vorbisEncoder.write(o);
		
	});
	/*throttle.once('finish', function () {
		console.log("Throttle finished");
	});*/

	var icecastAuth = new Buffer(icecastUsername+":"+icecastPassword).toString('base64');
	var iceConfStr = [];
	for (var i in iceConfHeaders) {
		iceConfStr.push('ice-'+i+': '+iceConfHeaders[i]);
	}
	iceConfStr = iceConfStr.join('\r\n');

	var mp3Stream = net.connect(icecastPort, icecastHost);
	
	mp3Stream.on('connect', function () {
		var req = "SOURCE "+icecastMountMP3+" HTTP/1.0\r\nAuthorization: Basic "+icecastAuth+"\r\n"+iceConfStr+"\r\nContent-Type: audio/mpeg\r\n\r\n";
		mp3Stream.write(req);
		console.log("Icecast MP3 source connected");
		lameEncoder.pipe(mp3Stream);
	});
	mp3Stream.on('close', function () {
		console.log("Closed Icecast MP3 source");
	});
	mp3Stream.on('error', console.error);

	var oggStream = net.connect(icecastPort, icecastHost);
	
	oggStream.on('connect', function () {
		var req = "SOURCE "+icecastMountOGG+" HTTP/1.0\r\nAuthorization: Basic "+icecastAuth+"\r\n"+iceConfStr+"\r\nContent-Type: audio/ogg\r\n\r\n";
		oggStream.write(req);
		console.log("Icecast OGG source connected");
		oggEncoder.pipe(oggStream);
	});
	oggStream.on('close', function () {
		console.log("Closed Icecast OGG source");
	});
	oggStream.on('error', console.error);
}
// END OF ICECAST STUFF

function shuffle(o){
	for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
	return o;
}

function prettyPopularity(popularity, width) {
	var output = "";
	var fill = "#";
	var unfill = "-";
	var ratio = popularity/100;
	for (var i = 0; i < width; i++) {
		if (i < ratio*width) {
			output += fill;
		} else {
			output += unfill;
		}
	}
	return output;
}

function playTrack(spotify) {
	var st = Date.now();
	
	if (trackList.length === 0) {
		spotify.disconnect();
		if (enableIcecastSource) {
			closeIcecast();
		}
		return;
	}

	var uri = trackList[currentTrack++];

	if (uri === undefined) {
		if (repeatMode) {
			shuffleMode && shuffle(trackList);
			currentTrack = 0;
		} else {
			trackList = [];
		}
		playTrack(spotify);
		return;
	}
	
	spotify.get(uri, function (err, track) {
		if (err) throw err;

		if (!spotify.isTrackAvailable(track)) {
			trackList.splice(trackList.indexOf(uri), 1);
			currentTrack--;
			console.log("Unable to play "+track.artist[0].name+' - '+track.name+', track not available');
			playTrack(spotify);
			return;
		}

		console.log(' > '+track.name+' - '+track.artist[0].name+' ('+track.album.name+', '+track.album.label+', '+track.album.date.year+') ['+prettyPopularity(track.popularity, 10)+'] '+uri);
		//console.log(track);

		var stream = track.play();
		var rawstream = stream.pipe(new lame.Decoder());

		/*var time = Date.now();
		var sum = 0;

		stream.on('data', function (data) {
			sum += data.length;
			//console.log('downloading...', (sum/1024)/((Date.now()-time)/1000), 'kB/s');
		});

		stream.on('end', function () {
			console.log('downloaded track', (sum/1024)/((Date.now()-time)/1000), 'kB/s');
		});*/

		if (enableSpeaker) {
			var speaker = new Speaker();
			rawstream.pipe(speaker);
		}

		if (enableIcecastSource) {
			rawstream.pipe(throttle, {end: false});
		}

		
		
		setTimeout(function () {
			//console.log('Track ended, playing next');
			playTrack(spotify);
		}, track.duration);
		
		/*lameDecoder.once('format', function (format) {
			
			console.log(format);
			
		});*/
	});
}

console.log("Logging in to Spotify as "+cred.login+"...");

// initiate the Spotify session
Spotify.login(cred.login, cred.password, function (err, spotify) {
	if (err) throw err;

	console.log("Fetching tracks...");
	
	var i = -1;
	uriLoop();

	function uriLoop() {
		i++;
		if (i >= uris.length) {
			console.log(trackList.length+" track(s) in list");
			if (shuffleMode) {
				shuffle(trackList);
			}
			
			playTrack(spotify);
			return;
		}
		var uri = uris[i];
		var type = Spotify.uriType(uri);
		if (type === 'track') {
			
			spotify.get(uri, function (err, track) {
				if (err) throw err;
				console.log("Adding track "+track.name+" - "+track.artist[0].name);
				trackList.push(uri);
				uriLoop();
			});
			
			
		} else if (type === 'playlist') {
			spotify.playlist(uri, 0, 1000, function (err, playlist) {
				if (err) throw err;
				console.log("Adding playlist "+playlist.attributes.name);
				if (playlist.length > 0) {
					for (var i = 0; i < playlist.contents.items.length; i++) {
						var uri = playlist.contents.items[i].uri;
						if (Spotify.uriType(uri) === 'track') {
							trackList.push(playlist.contents.items[i].uri);
						} else {
							//console.log("Ignoring uri (local file) "+uri);
						}
					}
				}
				uriLoop();
			});
		} else if (type === 'album') {
			spotify.get(uri, function (err, album) {
				if (err) throw err;
				console.log("Adding album "+album.name);
				var tracks = [];
				album.disc.forEach(function (disc) {
					if (!Array.isArray(disc.track)) return;
					
					for (var j = 0; j < disc.track.length; j++) {
						trackList.push(disc.track[j].uri);
					}
				});
				
				uriLoop();
			});
		} else {
			console.log("Ignoring "+uri+" of type "+type);
			uriLoop();
		}
	}

});