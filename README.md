# onbotjs

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/95e028c42d7640c19fe6165a3ef0600c)](https://www.codacy.com/gh/michigan224/onbotjs/dashboard?utm_source=github.com&utm_medium=referral&utm_content=michigan224/onbotjs&utm_campaign=Badge_Grade)

I originally designed this bot to be a funny joke for my friends. Its purpose was to reduce the amount of times I would see the message "who's on?" from someone. It does have that functionality now and will respond with a helpful, although slightly rude, message informing the asker who is on and what they are doing.

## Integration

I built a [NAS](https://en.wikipedia.org/wiki/Network-attached_storage) that runs [Unraid](https://unraid.net/) which I use to store files and run dockers or VMs. I use an application called [Plex](https://www.plex.tv/) to host movies that I own or which are part of the [public domain](https://en.wikipedia.org/wiki/List_of_films_in_the_public_domain_in_the_United_States). Using [Docker](https://hub.docker.com/u/michigan224) and their helpful [guides](https://docs.docker.com/language/nodejs/) with Github Actions I set up continuous integration with my server to constantly update and build the bot.

## Commands

Any use of both words `who` and `on` in the same message will result in the bot sending a [Discord embed](https://discordjs.guide/popular-topics/embeds.html#embed-preview) containing the status of all members on discord to see who is on. This status includes their status according to discord as well as information if the user is watching something on my Plex server. The [Tautulli API](https://github.com/Zefau/tautulli-api) is used with the Tautulli instance on my NAS.

Using the [Discord Command](https://discord.com/developers/docs/interactions/application-commands) `/roulette` will give you a random video game to play.
