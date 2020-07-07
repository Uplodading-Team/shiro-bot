module.exports = (client) => {
    client.user.setActivity('s?help || taking care of two little demons...', {type: 'STREAMING'})
    .then(presence => console.log(`Activity set to ${presence.game ? presence.game.name : 'none'}`))
    .catch(console.error);
console.log('I\'m Shiro.')
    };

