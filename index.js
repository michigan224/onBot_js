const fs = require('fs');
const { Client, Collection, Intents, MessageEmbed } = require('discord.js');
const Tautulli = require('tautulli-api');

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_VOICE_STATES,
    ],
});
const tautulli = new Tautulli(
    process.env.TAUTULLI_IP,
    process.env.TAUTULLI_PORT,
    process.env.TAUTULLI_API_KEY
);
const LogLevel = {
    Info: "info",
    Warning: "warning",
    Error: "error",
    Debug: "debug",
}

client.commands = new Collection();
const commandFiles = fs
    .readdirSync('./commands')
    .filter((file) => file.endsWith('.js'));

let lastTimeout = null;

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

client.once('ready', (c) => {
    log(`Ready! Logged in as ${c.user.tag}`, LogLevel.Info);
    client.user.setActivity('you monkey brains', { type: 'LISTENING' });
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        log(error, LogLevel.Error);
        await interaction.reply({
            content: 'There was an error while executing this command!',
            ephemeral: true,
        });
    }
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    log(`${message.author.username} said ${message.cleanContent.toLowerCase()}`, LogLevel.Debug);
    const words = message.cleanContent.toLowerCase().match(/\w+(?:'\w+)*/g);
    if (isAskingWhosOn(words)) {
        log(
            `${getDatetime()} ::: ${message.author.username} asked who's on`
        );
        await whosOn(message);
    }
    if (message.author.id === '629143455871795212') {
        await handleCam(message);
    }
    if (message.mentions.has(client.user.id)) {
        message.channel.send('Hello there!');
    }
});

client.login(process.env.DISCORD_TOKEN);

async function whosOn(message) {
    const members = message.channel.members;
    const embed = new MessageEmbed().setColor('#0099FF').setTitle("Who's on?");

    let alone = true;
    const tautulliData = await getTautulliData();
    for (const member of members.values()) {
        if (member.user.bot || member.user == message.author) continue;
        log(
            `${getDatetime()} ::: Getting status of ${member.user.username}`
        );
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
    log(`${getDatetime()} ::: Sending reply message`, LogLevel.Debug);
    await message
        .reply({ embeds: [embed] })
        .then(() => {
            log(`${getDatetime()} ::: Reply sent`, LogLevel.Debug);
        })
        .catch((err) => {
            log(`${getDatetime()} ::: Error sending reply: ${err}`, LogLevel.Error);
        });
    return;
}

async function getMemberMessage(member, tautulliData) {
    const presence = member.presence;
    if (presence && presence.status == 'offline') return;
    const resp = {
        name: member.nickname || member.user.username,
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
        Xander: 'Alex',
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

async function handleCam(message) {
    const words = message.cleanContent.toLowerCase().match(/\w+(?:'\w+)*/g);
    if (!words) return;
    if (!words.includes('sad')) return;
    if (lastTimeout) {
        const guildMember = message.member;
        const seconds = Math.abs(lastTimeout - Date.now()) / 1000;
        if (seconds < 1 * 60) {
            guildMember
                .timeout(1 * 60 * 1000, 'Spamming chat')
                .then(
                    log(
                        `${getDatetime()} ::: Timed out Cam for ${1 * 60 * 1000} seconds`, LogLevel.Debug
                    )
                )
                .catch((err) =>
                    log(
                        `${getDatetime()} ::: Error while timing out Cam: ${err}`,
                        LogLevel.Error
                    )
                );
            await message.reply("Yup, you're done. Enjoy the timeout.");
        } else {
            await message.reply('Pipe down before I time you out.');
        }
    } else {
        await message.reply('Pipe down before I time you out.');
    }
    lastTimeout = Date.now();
}

function isAskingWhosOn(words) {
    return (words &&
        (words.includes('who') ||
            words.includes('whos') ||
            words.includes("who's")) &&
        words.includes('on'));
}

function getDatetime() {
    const today = new Date();
    const date =
        today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    const time =
        today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
    const dateTime = date + 'T' + time;
    return dateTime;
}

function log(message, level = 'info') {
    switch (level) {
        case LogLevel.Info:
            console.log(`${getDatetime()} | ${message}`);
            break;
        case LogLevel.Warn:
            console.warn(`${getDatetime()} | ${message}`);
            break;
        case LogLevel.Error:
            console.error(`${getDatetime()} | ${message}`);
            break;
        case LogLevel.Debug:
            console.debug(`${getDatetime()} | ${message}`);
            break;
    }
}