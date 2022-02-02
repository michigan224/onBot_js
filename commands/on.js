const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('on')
		.setDescription('Replies with a list of members and what they\'re doing.'),
	async execute(interaction) {
		const embed = new MessageEmbed()
			.setColor('#0099ff')
			.setTitle('Roulette')
			.setURL('https://discord.js.org/');

		return interaction.reply({ embeds: [ embed ] });
	},
};