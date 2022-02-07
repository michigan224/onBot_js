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
    if (words && (words.includes('whos') || words.includes('who\'s')) && words.includes('on')) {
        console.log(`${message.author.username} asked who's on`);
        await whosOn(message);
    }
});

client.on('presenceUpdate', (oldPresence, newPresence) => {
    return;
});


client.login(process.env.DISCORD_TOKEN);

async function whosOn(message) {
    const members = message.channel.members;
    const embed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Who\'s on?');
    let alone = true;
    for (const member of members.values()) {
        if (member.user.bot || member.user == message.author) continue;
        console.log(`Getting status of ${member.user.username}`);
        const resp = await get_member_message(member);
        if (resp) {
            alone = false;
            embed.addField(
                resp['name'], resp['value'], resp['inline']);
        }
    }
    if (alone) {
        embed.addField('RIP',
            'Looks like no one is on. You\'re going to have to play alone.',
            false);
    }
    await message.channel.send({ embeds: [embed] });
    await message.delete();
    return;
}

async function get_member_message(member) {
    const presence = member.presence;
    if (!presence || presence.status == 'offline') return;
    const resp = { name: member.nickname || member.user.username, value: '', inline: false };
    for (const activity of presence.activities.sort((a, b) => (a.color < b.color) ? 1 : -1)) {
        if (activity.type == 'PLAYING') {
            resp['value'] += `Playing ${activity.name}`;
            if (activity.state) {
                resp['value'] += ` (${activity.state})`;
            }
        }
        else if (activity.type == 'LISTENING') {
            if (resp['value'] == member.nickname || member.user.username) {
                resp['value'] += `Listening to ${activity.details}`;
            }
            else {
                resp['value'] += ` while listening to ${activity.details}`;
            }
        }
    }
    return resp;
}