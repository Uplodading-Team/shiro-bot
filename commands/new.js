const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {

let ticketEmbed = new Discord.RichEmbed()
.setDescription("TrendyTickets")
.setColor("#bc0000")
.setThumbnail("https://cdn.discordapp.com/avatars/611569555059376148/a144a8ca26940593c607228e47719f46.jpg?size=2048")
.addField("New Ticket", `${message.author} your ticket has been created.`);

let ticketchannel = message.guild.channels.find(`name`, "lobby")
if(!ticketchannel) return message.channel.send("Couldn't ticket creating channel.");

ticketchannel.send(ticketEmbed);

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
let ticketid = getRandomInt(10000);
let name = `ticket-${message.author.username}-${ticketid}`;

message.guild.createChannel(name, "text")
.then(m => {
    m.setParent('623244529339990026')
    m.overwritePermissions(message.guild.id, {
        VIEW_CHANNEL: false
    })

    m.overwritePermissions(message.author.id, {
        VIEW_CHANNEL: true
    })
  m.overwritePermissions(message.guild.roles.find(r =>r.name === "The Crew").id, {
        VIEW_CHANNEL: true                       
                         })
})
//channel.delete()
}