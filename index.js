const fs = require('fs');
const { Client, Collection, Intents, MessageEmbed } = require('discord.js');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_PRESENCES] });

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

client.once('ready', c => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
    client.user.setActivity('you monkey brains', { type: 'LISTENING' });
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    }
    catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

client.on('messageCreate', async message => {
    console.log(message.cleanContent.toLowerCase());
    const words = message.cleanContent.toLowerCase().match(/\w+(?:'\w+)*/g);
    console.log(words);
    if ((words.includes('whos') || words.includes('who\'s')) && words.includes('on')) {
        await whosOn(message);
    }
});

client.on('presenceUpdate', (oldPresence, newPresence) => {
    console.log(oldPresence);
    console.log(newPresence);
});

// client.login(process.env.DISCORD_TOKEN);
client.login('ODI4Njc5NjgxMzgwNzEyNDQ4.YGtGGA.YkS4dP8DiGf3TxyO6ddF0YfNwXw');

async function whosOn(message) {
    const members = message.channel.members;
    const embed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Who\'s on?');
    let alone = true;
    for (const member in members) {
        if (member.bot || member == message.author) continue;
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