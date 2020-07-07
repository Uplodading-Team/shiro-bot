exports.run = (client, message, args) => {
    console.log(message.author.tag, "used the info command");
    const Discord = require("discord.js");
    const embed = new Discord.RichEmbed()
  embed.setAuthor("Yuichiro is my lord!", "https://cdn.discordapp.com/avatars/219410026631135232/a_3a05b3039f0120ac68271f8ac4bece61.gif")
  embed.setDescription("Information about me!")
  embed.setColor(0x00AE86)
  embed.addField("Bot developer:", "Yuichiro#0001")
  embed.addField("Bot language:", "This bot is made with [Discord.JS](http://discord.js.org)")
  embed.addField("Social links:", "[Twitter](https://twitter.com/ruicabral11) | [Steam](http://steamcommunity.com/id/betmennpt/) | [Twitch](https://www.twitch.tv/yuichiro__)") 
  embed.setThumbnail("https://discord.js.org/static/logo-square.png")
  embed.setTimestamp()
  embed.setFooter("Shiro", "https://cdn.discordapp.com/avatars/616707938421309440/41a3387adcc33646d9fe38edb12860a8.png?size=2048")
  message.channel.send({embed});
};