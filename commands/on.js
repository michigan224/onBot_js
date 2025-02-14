const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { log, LogLevel, getDatetime } = require('../logging');
const Tautulli = require('tautulli-api');
require('dotenv').config();

const tautulli = new Tautulli(
	process.env.TAUTULLI_IP,
	process.env.TAUTULLI_PORT,
	process.env.TAUTULLI_API_KEY
);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('on')
		.setDescription('Replies with a list of members and what they\'re doing.'),
	async execute(interaction) {
		const embed = await getWhosOn(interaction)
		return interaction.reply({ embeds: [embed] });
	},
};

async function getWhosOn(interaction) {
	const members = interaction.channel.members;
	const embed = new MessageEmbed().setColor('#0099FF').setTitle("Who's on?");

	let alone = true;
	const tautulliData = await getTautulliData();
	for (const member of members.values()) {
		if (member.user.bot || member.user == interaction.user) continue;
		log(`${getDatetime()} ::: Getting status of ${member.user.username}`);
		const resp = await getMemberMessage(member, tautulliData);
		if (resp) {
			alone = false;
			embed.addField(resp['name'], resp['value'], resp['inline']);
		}
	}
	if (alone) {
		embed.addField(
			'RIP',
			"Looks like no one is on. You're going to have to play alone.",
			false
		);
	}
	log(`${getDatetime()} ::: Preparing embed`, LogLevel.Debug);
	return embed;
}

async function getMemberMessage(member, tautulliData) {
	const presence = member.presence;
	if (presence && presence.status == 'offline') return;
	const resp = {
		name: getMemberName(member.user.username),
		value: '',
		inline: false,
	};
	let active = false;
	if (presence) {
		for (const activity of presence.activities.sort((a, b) =>
			a.type < b.type ? 1 : -1
		)) {
			if (activity.name === 'Plex') continue;
			if (activity.type == 'PLAYING') {
				active = true;
				if (resp['value'] === '') {
					resp['value'] += `Playing ${activity.name}`;
				} else {
					resp['value'] += ` while playing ${activity.name}`;
				}
				if (activity.state) {
					resp['value'] += ` (${activity.state})`;
				} else if (activity.details) {
					resp['value'] += ` (${activity.details})`;
				}
			} else if (activity.type == 'LISTENING') {
				active = true;
				if (resp['value'] === '') {
					resp[
						'value'
					] += `Listening to [${activity.details}](https://open.spotify.com/track/${activity.syncId})`;
				} else {
					resp['value'] += ` while listening to ${activity.details}`;
				}
			}
		}
	}
	if (!active) return;
	const userMap = {
		Alex: 'Alex',
		Cam: 'Cam',
		Loom: 'Loom',
		Austin: 'Austin',
		David: 'michigan224',
		Chris: 'Chris',
	};
	if (!(resp['name'] in userMap)) return resp;
	if (!tautulliData || tautulliData.response.result !== 'success') return resp;
	if (tautulliData.response.data.stream_count === '0') return resp;
	const data = tautulliData.response.data;
	for (const stream of data.sessions) {
		let title = '';
		if (userMap[resp['name']] !== stream.user) continue;
		if (stream.library_name === 'TV Shows') {
			title = `${stream.grandparent_title} - S${stream.parent_title.replace(
				'Season ',
				''
			)}E${stream.media_index} - ${stream.title}`;
		} else if (stream.library_name === 'Movies') {
			title = `${stream.title}`;
		}
		if (title === '') break;
		resp['value'] += `\nWatching ${title} on Plex`;
		active = true;
	}
	log(`${getDatetime()} ::: Got status ${resp}`, LogLevel.Debug);
	return resp;
}

function getMemberName(username) {
	const userMap = {
		'xander_lmao': 'Alex',
		'djloom': 'Loom',
		'a_tothej': 'Austin',
		'michigan224': 'David',
		'truhshy': 'Chris',
		'joe_borthwick08': 'Joe',
		'cameronthedestroyer69': 'Cam'
	};
	if (username in userMap) {
		return userMap[username];
	}
	return username;
}

async function getTautulliData() {
	const data = await tautulli
		.get('get_activity')
		.then((res) => {
			return res;
		})
		.catch((err) => {
			log(err, LogLevel.Error);
		});
	return data;
}