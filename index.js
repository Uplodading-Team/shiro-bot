const http = require("http");
const express = require("express");
const app = express();
app.get("/", (request, response) => {
  console.log(Date.now() + " Ping Received");
  response.sendStatus(200);
});
app.listen(process.env.PORT);
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);

const Discord = require("discord.js");
const client = new Discord.Client();
const fs = require("fs");
const Enmap = require("enmap");
const config = require("./config.json");
const moment = require("moment");
const yt = require("ytdl-core");

client.config = require("./config.json");

fs.readdir("./events/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    const event = require(`./events/${file}`);
    let eventName = file.split(".")[0];
    client.on(eventName, event.bind(null, client));
  });
});

client.commands = new Enmap();
client.aliases = new Enmap();
client.settings = new Enmap({ name: "settings" });

fs.readdir("./commands/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    if (!file.endsWith(".js")) return;
    let props = require(`./commands/${file}`);
    let commandName = file.split(".")[0];
    console.log(`Attempting to load command ${commandName}`);
    client.commands.set(commandName, props);
  });
});

const init = async () => {
  const evtFiles = await readdir("./events/");
  client.logger.log(`Loading a total of ${evtFiles.length} events.`);
  evtFiles.forEach(file => {
    const eventName = file.split(".")[0];
    client.logger.log(`Loading Event: ${eventName}`);
    const event = require(`./events/${file}`);
    // Bind the client to any event, before the existing arguments
    // provided by the discord.js event.
    // This line is awesome by the way. Just sayin'.
    client.on(eventName, event.bind(null, client));
  });

  client.levelCache = {};
  for (let i = 0; i < client.config.permLevels.length; i++) {
    const thisLevel = client.config.permLevels[i];
    client.levelCache[thisLevel.name] = thisLevel.level;
  }
};

const invites = {};

// A pretty useful method to create a delay without blocking the whole script.
const wait = require("util").promisify(setTimeout);

client.on("ready", () => {
  // "ready" isn't really ready. We need to wait a spell.
  wait(1000);

  // Load all invites for all guilds and save them to the cache.
  client.guilds.forEach(g => {
    g.fetchInvites().then(guildInvites => {
      invites[g.id] = guildInvites;
    });
  });
});

client.on("guildMemberAdd", member => {
  // To compare, we need to load the current invite list.
  member.guild.fetchInvites().then(guildInvites => {
    // This is the *existing* invites for the guild.
    const ei = invites[member.guild.id];
    // Update the cached invites for the guild.
    invites[member.guild.id] = guildInvites;
    // Look through the invites, find the one for which the uses went up.
    const invite = guildInvites.find(i => ei.get(i.code).uses < i.uses);
    // This is just to simplify the message being sent below (inviter doesn't have a tag property)
    const inviter = client.users.get(invite.inviter.id);
    // Get the log channel (change to your liking)
    const logChannel = member.guild.channels.find(
      channel => channel.name === "join-logs"
    );
    // A real basic message with the information we need.
    logChannel.send(
      `${member.user.tag} joined using invite code ${invite.code} from ${inviter.tag}. Invite was used ${invite.uses} times since its creation.`
    );
  });
});

client.on("message", message => {
  if (message.content === config.PREFIX + "prefix") {
    message.channel.send("My prefix is: `s?`");
  }
});

client.clean = async (client, text) => {
  if (text && text.constructor.name == "Promise") text = await text;
  if (typeof evaled !== "string")
    text = require("util").inspect(text, { depth: 1 });

  text = text
    .replace(/`/g, "`" + String.fromCharCode(8203))
    .replace(/@/g, "@" + String.fromCharCode(8203))
    .replace(
      client.token,
      "mfa.VkO_2G4Qv3T--NO--lWetW_tjND--TOKEN--QFTm6YGtzq9PH--4U--tG0"
    );

  return text;
};

let queue = {};

const commands = {
  play: msg => {
    if (queue[msg.guild.id] === undefined)
      return msg.channel.sendMessage(
        `Add some songs to the queue first with ${config.PREFIX}add`
      );
    if (!msg.guild.voiceConnection)
      return commands.join(msg).then(() => commands.play(msg));
    if (queue[msg.guild.id].playing)
      return msg.channel.sendMessage("Already Playing");
    let dispatcher;
    queue[msg.guild.id].playing = true;

    console.log(queue);
    (function play(song) {
      console.log(song);
      if (song === undefined)
        return msg.channel.sendMessage("Queue is empty").then(() => {
          queue[msg.guild.id].playing = false;
          msg.member.voiceChannel.leave();
        });
      msg.channel.sendMessage(
        `Playing: **${song.title}** as requested by: **${song.requester}**`
      );
      dispatcher = msg.guild.voiceConnection.playStream(
        yt(song.url, { audioonly: true }),
        { passes: config.passes }
      );
      let collector = msg.channel.createCollector(m => m);
      collector.on("message", m => {
        if (m.content.startsWith(config.PREFIX + "pause")) {
          msg.channel.sendMessage("paused").then(() => {
            dispatcher.pause();
          });
        } else if (m.content.startsWith(config.PREFIX + "resume")) {
          msg.channel.sendMessage("resumed").then(() => {
            dispatcher.resume();
          });
        } else if (m.content.startsWith(config.PREFIX + "skip")) {
          msg.channel.sendMessage("skipped").then(() => {
            dispatcher.end();
          });
        } else if (m.content.startsWith("volume+")) {
          if (Math.round(dispatcher.volume * 50) >= 100)
            return msg.channel.sendMessage(
              `Volume: ${Math.round(dispatcher.volume * 50)}%`
            );
          dispatcher.setVolume(
            Math.min(
              (dispatcher.volume * 50 + 2 * (m.content.split("+").length - 1)) /
                50,
              2
            )
          );
          msg.channel.sendMessage(
            `Volume: ${Math.round(dispatcher.volume * 50)}%`
          );
        } else if (m.content.startsWith("volume-")) {
          if (Math.round(dispatcher.volume * 50) <= 0)
            return msg.channel.sendMessage(
              `Volume: ${Math.round(dispatcher.volume * 50)}%`
            );
          dispatcher.setVolume(
            Math.max(
              (dispatcher.volume * 50 - 2 * (m.content.split("-").length - 1)) /
                50,
              0
            )
          );
          msg.channel.sendMessage(
            `Volume: ${Math.round(dispatcher.volume * 50)}%`
          );
        } else if (m.content.startsWith(config.PREFIX + "time")) {
          msg.channel.sendMessage(
            `time: ${Math.floor(dispatcher.time / 60000)}:${
              Math.floor((dispatcher.time % 60000) / 1000) < 10
                ? "0" + Math.floor((dispatcher.time % 60000) / 1000)
                : Math.floor((dispatcher.time % 60000) / 1000)
            }`
          );
        }
      });
      dispatcher.on("end", () => {
        collector.stop();
        play(queue[msg.guild.id].songs.shift());
      });
      dispatcher.on("error", err => {
        return msg.channel.sendMessage("error: " + err).then(() => {
          collector.stop();
          play(queue[msg.guild.id].songs.shift());
        });
      });
    })(queue[msg.guild.id].songs.shift());
  },
  join: msg => {
    return new Promise((resolve, reject) => {
      const voiceChannel = msg.member.voiceChannel;
      if (!voiceChannel || voiceChannel.type !== "voice")
        return msg.reply("I couldn't connect to your voice channel...");
      voiceChannel
        .join()
        .then(connection => resolve(connection))
        .catch(err => reject(err));
    });
  },
  add: msg => {
    let url = msg.content.split(" ")[1];
    if (url == "" || url === undefined)
      return msg.channel.sendMessage(
        `You must add a YouTube video url, or id after ${config.PREFIX}add`
      );
    yt.getInfo(url, (err, info) => {
      if (err) return msg.channel.sendMessage("Invalid YouTube Link: " + err);
      if (!queue.hasOwnProperty(msg.guild.id))
        (queue[msg.guild.id] = {}),
          (queue[msg.guild.id].playing = false),
          (queue[msg.guild.id].songs = []);
      queue[msg.guild.id].songs.push({
        url: url,
        title: info.title,
        requester: msg.author.username
      });
      msg.channel.sendMessage(`added **${info.title}** to the queue`);
    });
  },
  queue: msg => {
    if (queue[msg.guild.id] === undefined)
      return msg.channel.sendMessage(
        `Add some songs to the queue first with ${config.PREFIX}add`
      );
    let tosend = [];
    queue[msg.guild.id].songs.forEach((song, i) => {
      tosend.push(`${i + 1}. ${song.title} - Requested by: ${song.requester}`);
    });
    msg.channel.sendMessage(
      `__**${msg.guild.name}'s Music Queue:**__ Currently **${
        tosend.length
      }** songs queued ${
        tosend.length > 15 ? "*[Only next 15 shown]*" : ""
      }\n\`\`\`${tosend.slice(0, 15).join("\n")}\`\`\``
    );
  }
};

client.on("message", msg => {
  if (!msg.content.startsWith(config.PREFIX)) return;
  if (
    commands.hasOwnProperty(
      msg.content
        .toLowerCase()
        .slice(config.PREFIX.length)
        .split(" ")[0]
    )
  )
    commands[
      msg.content
        .toLowerCase()
        .slice(config.PREFIX.length)
        .split(" ")[0]
    ](msg);
});

//below this

client.on("guildMemberRemove", member => {
  const channel = member.guild.channels.find(ch => ch.name === "mod-logs");
  if (!channel) return;
  channel.send(`${member} has left.`);
});

client.on("guildMemberAdd", member => {
  const channel = member.guild.channels.find(ch => ch.name === "mod-logs");
  if (!channel) return;
  channel.send(`${member}, Has joined`);
});

client.on("guildMemberAdd", member => {
  const channel = member.guild.channels.find(ch => ch.name === "welcome");
  if (!channel) return;
  channel.send(
    `Welcome to the server ${member}, you are the ${member.guild.memberCount} member joining us! Please nitro boost us and come chat in ${'<#612050519506026506>'}. Also check out ${'<#693636886857646132>'} check ${'<#698349905063837807>'} for roles!`
  );
});

client.on("message", async message => {
  if (message.content.startsWith("Poll:")) {
    try {
      await message.react("👍");
      await message.react("👎");
      await message.react("😐");
    } catch (error) {
      console.error("One of the emojis failed to react.");
    }
  }
});

client.on("message", message => {
  if (!message.guild) return;
  if (message.content.startsWith(config.PREFIX + "kick")) {
    if (!message.member.hasPermission("KICK_MEMBERS"))
      return message.channel.send(
        `Sorry, this command is restricted to staff!`
      );
    const user = message.mentions.users.first();
    if (user) {
      const member = message.guild.member(user);
      if (member) {
        member
          .kick("Optional reason that will display in the audit logs")
          .then(() => {
            // We let the message author know we were able to kick the person
            message.reply(`Successfully kicked ${user.tag}`);
          })
          .catch(err => {
            // An error happened
            // This is generally due to the bot not being able to kick the member,
            // either due to missing permissions or role hierarchy
            message.reply("I was unable to kick the member");
            // Log the error
            console.error(err);
          });
      } else {
        // The mentioned user isn't in this guild
        message.reply("That user isn't in this guild!");
      }
      // Otherwise, if no user was mentioned
    } else {
      message.reply("You didn't mention the user to kick!");
    }
  }
});

client.on("message", message => {
  // Ignore messages that aren't from a guild
  if (!message.guild) return;
  // if the message content starts with "!ban"
  if (message.content.startsWith(config.PREFIX + "ban")) {
    // If user doesn't have permissions to ban, don't continue
    if (!message.member.hasPermission("BAN_MEMBERS"))
      return message.channel.send(
        `Sorry, this command is restricted to staff!`
      );
    if (!message.guild.me.hasPermission("BAN_MEMBERS"))
      return message.channel.send(`I cannot perform that action.`);
    // Assuming we mention someone in the message, this will return the user
    // Read more about mentions over at https://discord.js.org/#/docs/main/stable/class/MessageMentions
    const user = message.mentions.users.first();
    // If we have a user mentioned
    if (user) {
      // Now we get the member from the user
      const member = message.guild.member(user);
      // If the member is in the guild
      if (member) {
        member
          .ban({
            reason: "They committed rule breaking."
          })
          .then(() => {
            // We let the message author know we were able to ban the person
            message.reply(`Successfully banned ${user.tag}`);
          })
          .catch(err => {
            // An error happened
            // This is generally due to the bot not being able to ban the member,
            // either due to missing permissions or role hierarchy
            message.reply("I was unable to ban the member");
            // Log the error
            console.error(err);
          });
      } else {
        // The mentioned user isn't in this guild
        message.reply("That user isn't in this guild!");
      }
    } else {
      // Otherwise, if no user was mentioned
      message.reply("You didn't mention the user to ban!");
    }
  }
});

client.on("message", message => {
  if (message.content === config.PREFIX + "calladmin") {
    const channel = message.guild.channels.find(
      ch => ch.name === "admin-calls"
    );
    if (!channel) return;
    channel.send(
      `${message.author.tag} requested an admin in ${message.channel} @here`
    );
  } else if (message.content.startsWith(`${config.PREFIX}close`)) {
    message.channel.parentID === "623244529339990026" &&
    message.member.roles.some(r => r.id === "605939963766243348")
      ? message.channel.delete()
      : message.channel.send(
          `Only admins use this command in ticket channels, ${message.author}!`
        );
  }
});

client.on("message", message => {
  if (message.content === config.PREFIX + "calladmin") {
    const channel = message.guild.channels.find(ch => ch.name === "admin-logs");
    if (!channel) return;
    channel.send(
      `${message.author.tag} requested an admin in ${message.channel} @here`
    );
  } else if (message.content.startsWith(`${config.PREFIX}delete`)) {
    message.channel.parentID === "635498660020617217" &&
    message.member.roles.some(r => r.id === "635497262390312962")
      ? message.channel.delete()
      : message.channel.send(
          `Only admins use this command in ticket channels, ${message.author}!`
        );
  }
});

client.on("error", error => {
  console.error(error);
});
client.login("");
