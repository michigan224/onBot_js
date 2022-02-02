const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roulette')
        .setDescription('Replies with a random game.'),
    async execute(interaction) {
        const items = [
            { name: 'F1 2021', url: 'steam://run/1134570/', thumbnail: 'https://pbs.twimg.com/profile_images/1396859328586526724/qWgZXhpX_400x400.jpg' },
            { name: 'Fortnite', url: null, thumbnail: 'https://static.wikia.nocookie.net/logopedia/images/d/db/Fortnite_S1.svg/revision/latest/scale-to-width-down/250?cb=20210330161743' },
            { name: 'Rainbow Six Siege', url: 'steam://run/359550/' },
            { name: 'Rocket League', url: 'steam://run/252950/', thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Rocket_League_coverart.jpg' },
            { name: 'Sea of Thieves', url: 'steam://run/1172620/', thumbnail: 'https://theme.zdassets.com/theme_assets/518064/9766b1eef40938c1aeab5838af0a06a29647d7eb.png' },
            { name: 'Minecraft', url: null, thumbnail: 'https://user-images.githubusercontent.com/38465129/72480309-0dede180-37c5-11ea-9138-793b79713232.png' },
            { name: 'GTA V', url: 'steam://run/271590/', thumbnail: 'https://image.pngaaa.com/575/2397575-middle.png' },
            { name: 'Left 4 Dead 2', url: 'steam://run/550/', thumbnail: 'https://iconarchive.com/download/i1177/3xhumed/mega-games-pack-31/Left4Dead-2-3.ico' },
            { name: 'Geoguessr', url: 'https://www.geoguessr.com/' },
            { name: 'Sporcle', url: 'https://www.sporcle.com/' },
            { name: 'CSGO', url: 'steam://run/730/', thumbnail: 'https://cdn.iconscout.com/icon/free/png-256/cs-go-2288565-1933810.png' },
        ];
        const item = items[Math.floor(Math.random() * items.length)];
        console.log(item);

        const embed = new MessageEmbed().setColor('#0099ff').setTitle(item.name);
        if (item.url) {
            if (item.url.includes('steam')) {
                embed.setDescription(item.url);
            }
            else {
                embed.setURL(item.url);
            }
        }
        if (item.thumbnail) {
            embed.setThumbnail(item.thumbnail);
        }

        return interaction.reply({ embeds: [embed] });
    },
};
