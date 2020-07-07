exports.run = (client, message, args) => {
    console.log(message.author.tag, "used the help command");
    const Discord = require("discord.js");
    const embed = new Discord.RichEmbed()
  embed.setTitle("Bot commands")
  embed.setAuthor("Shiro", "https://cdn.discordapp.com/avatars/616707938421309440/41a3387adcc33646d9fe38edb12860a8.png?size=2048")
  embed.setColor(0x00AE86)
  embed.addField("Owner Commands", "eval, reload, reboot")
  embed.addField("Music Commands", "add (requires link), play, skip, pause, resume, queue")
  embed.addField("User Commands:", "ping, say, stats, info, prefix")
  embed.addField("Appeal Center [TrendyAppeals]", "new, ban, kick, calladmin, delete, close")
  embed.setThumbnail("https://cdn.discordapp.com/avatars/616707938421309440/41a3387adcc33646d9fe38edb12860a8.png?size=2048")
  embed.setTimestamp()
  embed.setFooter("Shiro", "https://cdn.discordapp.com/avatars/616707938421309440/41a3387adcc33646d9fe38edb12860a8.png?size=2048")
  message.channel.send({embed});
};