const fs = require('fs');
const { Client, Collection, Intents, MessageEmbed } = require('discord.js');
const Tautulli = require('tautulli-api');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_VOICE_STATES] });
const tautulli = new Tautulli(process.env.TAUTULLI_IP, process.env.TAUTULLI_PORT, process.env.TAUTULLI_API_KEY);

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

let lastTimeout = null;

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

client.once('ready', c => {
    console.log(`${getDatetime()} ::: Ready! Logged in as ${c.user.tag}`);
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
    if (message.author.bot) return;
    console.log(`${getDatetime()} ::: ${message.author.username} said ${message.cleanContent.toLowerCase()}`);
    const words = message.cleanContent.toLowerCase().match(/\w+(?:'\w+)*/g);
    if (words && (words.includes('who') || words.includes('whos') || words.includes('who\'s')) && words.includes('on')) {
        console.log(`${getDatetime()} ::: ${message.author.username} asked who's on`);
        await whosOn(message);
    }
    if (message.author.id === '629143455871795212') {
        await handleCam(message);
    }
    if (message.mentions.has(client.user.id)) {
        message.channel.send('Hello there!');
    }
});

// TODO: watch for presence updates for caching to respond faster.
// client.on('presenceUpdate', (oldPresence, newPresence) => {
//     return;
// });

client.login(process.env.DISCORD_TOKEN);

async function whosOn(message) {
    const members = message.channel.members;
    const embed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Who\'s on?');
    let alone = true;
    const tautulliData = await getTautulliData();
    for (const member of members.values()) {
        if (member.user.bot || member.user == message.author) continue;
        console.log(`${getDatetime()} ::: Getting status of ${member.user.username}`);
        const resp = await getMemberMessage(member, tautulliData);
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
    console.log(`${getDatetime()} ::: Sending response message`);
    await message.channel.send({ embeds: [embed] });
    console.log(`${getDatetime()} ::: Deleting request message`);
    await message.delete();
    return;
}

async function getMemberMessage(member, tautulliData) {
    const presence = member.presence;
    if (presence && presence.status == 'offline') return;
    const resp = { name: member.nickname || member.user.username, value: '', inline: false };
    let active = false;
    if (presence) {
        for (const activity of presence.activities.sort((a, b) => (a.type < b.type) ? 1 : -1)) {
            if (activity.name === 'Plex') continue;
            if (activity.type == 'PLAYING') {
                active = true;
                if (resp['value'] === '') {
                    resp['value'] += `Playing ${activity.name}`;
                }
                else {
                    resp['value'] += ` while playing ${activity.name}`;
                }
                if (activity.state) {
                    resp['value'] += ` (${activity.state})`;
                }
                else if (activity.details) {
                    resp['value'] += ` (${activity.details})`;
                }
            }
            else if (activity.type == 'LISTENING') {
                active = true;
                if (resp['value'] === '') {
                    resp['value'] += `Listening to ${activity.details}`;
                }
                else {
                    resp['value'] += ` while listening to ${activity.details}`;
                }
            }
        }
    }
    if (!active) return;
    const userMap = { 'Xander': 'Alex', 'Cam': 'Cam', 'Loom': 'Loom', 'Austin': 'Austin', 'David': 'michigan224', 'Chris': 'Chris' };
    if (!(resp['name'] in userMap)) return resp;
    if (!tautulliData || tautulliData.response.result !== 'success') return resp;
    if (tautulliData.response.data.stream_count === '0') return resp;
    const data = tautulliData.response.data;
    for (const stream of data.sessions) {
        let title = '';
        if (userMap[resp['name']] !== stream.user) continue;
        if (stream.library_name === 'TV Shows') {
            title = `${stream.grandparent_title} - S${stream.parent_title.replace('Season ', '')}E${stream.media_index} - ${stream.title}`;
        }
        else if (stream.library_name === 'Movies') {
            title = `${stream.title}`;
        }
        if (title === '') break;
        resp['value'] += `\nWatching ${title} on Plex`;
        active = true;
    }
    console.log(`${getDatetime()} ::: Got status ${resp}`);
    return resp;
}

async function getTautulliData() {
    const data = await tautulli.get('get_activity')
        .then(res => {
            return res;
        }).catch(err => {
            console.error(err);
        });
    return data;
}

async function handleCam(message) {
    const words = message.cleanContent.toLowerCase().match(/\w+(?:'\w+)*/g);
    if (!words) return;
    if (!words.includes('sad')) return;
    if (lastTimeout) {
        const guildMember = message.member;
        const seconds = Math.abs(lastTimeout - Date.now()) / 1000;
        if (seconds < 1 * 60) {
            guildMember.timeout(1 * 60 * 1000, 'Spamming chat')
                .then(console.log(`${getDatetime()} ::: Timed out Cam for ${1 * 60 * 1000} seconds`))
                .catch(err => (console.error(`${getDatetime()} ::: Error while timing out Cam: ${err}`)));
            await message.reply('Yup, you\'re done. Enjoy the timeout.');
        }
        else {
            await message.reply('Pipe down before I time you out.');
        }
    }
    else {
        await message.reply('Pipe down before I time you out.');
    }
    lastTimeout = Date.now();
}

function getDatetime() {
    const today = new Date();
    const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    const time = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
    const dateTime = date + ' ' + time;
    return dateTime;
}