exports.run  = (client, message, args) => {
    console.log(message.author.tag, "used the say command");
    if(!args || args.length < 1) return message.reply("Tell me what to say!");
        message.delete(0);
        message.channel.send(args.join(' '));
    };

