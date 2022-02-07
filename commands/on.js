const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('on')
		.setDescription('Replies with a list of members and what they\'re doing.'),
	async execute(interaction) {
		const embed = new MessageEmbed()
			.setColor('#0099ff')
			.setTitle('Who\'s on?')
			.setURL('https://discord.js.org/');

		return interaction.reply({ embeds: [embed] });
	},
};

async function whosOn(message) {
	const members = message.channel.members;
	const embed = new MessageEmbed()
		.setColor('#0099ff')
		.setTitle('Who\'s on?');
	let alone = true;
	for (const member in members) {
		if (member.bot || member == message.author) continue;
		console.log(`Getting status of ${member.user.username}`);
		const resp = await get_member_message(member);
		if (resp) {
			alone = false;
			embed.add_field(
				resp['name'], resp['value'], resp['inline']);
		}
	}
	if (alone) {
		embed.add_field('RIP',
			'Looks like no one is on. You\'re going to have to play alone.',
			false);
	}
	await message.channel.send({ embeds: [embed] });
	await message.delete();
	return;
}

async function get_member_message(member) {
	const presence = await member.fetchPresence();
	return presence;
}