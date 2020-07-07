const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {

let ticketEmbed = new Discord.RichEmbed()
.setDescription("Comrades Tickets")
.setColor("#bc0000")
.setThumbnail("https://cdn.discordapp.com/attachments/635496869908316162/635500431778381825/6fb99b79e7118e5363bf73ceb2ae63c6.jpg")
.addField("New Ticket", `${message.author} your ticket has been created.`);

let ticketchannel = message.guild.channels.find(`name`, "appeal-channel")
if(!ticketchannel) return message.channel.send("Couldn't ticket creating channel.");

ticketchannel.send(ticketEmbed);

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
let ticketid = getRandomInt(10000);
let name = `ticket-${message.author.username}-${ticketid}`;

message.guild.createChannel(name, "text")
.then(m => {
    m.setParent('635498660020617217')
    m.overwritePermissions(message.guild.id, {
        VIEW_CHANNEL: false
    })

    m.overwritePermissions(message.author.id, {
        VIEW_CHANNEL: true
    })
  m.overwritePermissions(message.guild.roles.find(r =>r.name === "Appeal Team").id, {
        VIEW_CHANNEL: true                       
                         })
})
//channel.delete()
}