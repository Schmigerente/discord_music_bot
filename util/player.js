const ytdl = require('ytdl-core');
const yts = require('yt-search');
const request = require('request');
const path = require('path');
const logger = require(__dirname + '/logger.js');
const GuildManager = require(__dirname + '/guild_database.js');
const guilds = GuildManager.guilds;
const { joinVoiceChannel } = require('@discordjs/voice');
const { createAudioPlayer } = require('@discordjs/voice');
const { createAudioResource } = require('@discordjs/voice');
const { AudioPlayerStatus } = require('@discordjs/voice');

function createPlayer(id) {	
	var music_player = {
		apiplayer: createAudioPlayer(), 
		connection: null,
		playlist: [],
		play: function() {
	
		},
		skip: function() {
		
		},
		volume: function(volume) {

		},
		add: function() {

		}
	}
}


async function play(queue)
{
	
	if (queue.connection == null)
	{
		await connect(queue);
	}
	
	var song = queue.songs.shift();
	
	if (!song)
	{
		queue.connection.destroy();
		logger.log(`#PLAYER : disconnectEvent: ${queue.textChannel.guild.id}`);
		guilds.get(queue.textChannel.guild.id).queue = undefined;
		return;
	}
    logger.log(`#PLAYER : ${song.title} | ${queue.textChannel.guild.id}`);
	queue.textChannel.send('\`\`\`Now playing ' + song.title + '!\`\`\`');
	
	var resource = createAudioResource(ytdl(song.url));
	queue.player.play(resource);
}

async function playLocal(path, queue) {
	if (queue.connection == null)
	{
		await connect(queue);
	}
	var resource = createAudioResource(path);
	var resource = createAudioResource('D:\Music\Ahrix\Ahrix - Nova [NCS Release].mp3');
	resource.volume.setVolume(0.5);
	queue.player.play(resource);
}

async function connect(queue)
{
    logger.log(`#PLAYER : connectEvent: ${queue.textChannel.guild.id}`);
	queue.connection = joinVoiceChannel({
		channelId: queue.voiceChannel.id,
		guildId: queue.voiceChannel.guild.id,
		adapterCreator: queue.voiceChannel.guild.voiceAdapterCreator
	});
	
	queue.connection.subscribe(queue.player);

}

function unshiftQueue(queue, song)
{
	queue.songs.unshift(song);
	return "added to queue as next: " + song.title;
}

function pushQueue(queue, song)
{
	queue.songs.push(song);
	return "added to queue: " + song.title;
}

function getQueue(message)
{
	var guild = GuildManager.get(message.guild.id);
	var queue = guild.queue;
	if (queue == undefined)
	{
		queue = createQueue(message.channel, message.member.voice.channel);
		guild.queue = queue;
	}
	return queue;
}

function createQueue(textChannel, voiceChannel)
{
	const queueContruct =
	{
		player: createAudioPlayer(),
		textChannel: textChannel,
		voiceChannel: voiceChannel,
		connection: null,
		songs: [],
		volume: 5,
		playing: false
	};
	
	return queueContruct
}

async function getSong(args)
{
	if (!args[0].includes('www.youtube.com/watch'))
	{
		song = await search(args);
		return song;
	}
	else
	{
		songInfo = await ytdl.getInfo(args[0]);
		const song =
		{
			platform: 'youtube',
			title: songInfo.videoDetails.title,
			url: songInfo.videoDetails.video_url
		}
		return song;
	}
}

async function search(args)
{
	var result = await yts(args.join(' '));
	var url = result.all[0].url;
	var songInfo = await ytdl.getInfo(url)
		const song =
	{
		platform: 'youtube',
		title: songInfo.videoDetails.title,
		url: songInfo.videoDetails.video_url
	};
	return song;
}

function skip(queue)
{
	play(queue);
}

function stop(queue)
{
	queue.songs = [];
	skip(queue);
}

function setVolume(message, volume)
{
	var queue = guilds.get(message.guild.id).queue;
	queue.volume = (volume);
	queue.connection.dispatcher.setVolumeLogarithmic(queue.volume / 10);
}

module.exports =
{
	play,
	playLocal,
	search,
	skip,
	stop,
	getQueue,
	getSong,
	pushQueue,
	unshiftQueue,
	setVolume,
};

process.on('unhandledRejection', error => console.log('Uncaught Promise Rejection', error));
