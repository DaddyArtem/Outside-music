const fs = require('fs');
const Discord = require('discord.js');
const Client = require('./client/Client');
const config = require('./config.json');
const {Player} = require('discord-player');

const client = new Client();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

console.log(client.commands);

const player = new Player(client);

player.on('error', (queue, error) => {
  console.log(`[${queue.guild.name}] Ошибка, выданная из очереди: ${error.message}`);
});

player.on('connectionError', (queue, error) => {
  console.log(`[${queue.guild.name}] Ошибка, возникшая при подключении: ${error.message}`);
});

player.on('trackStart', (queue, track) => {
  queue.metadata.send(`▶ | Начал играть трек : **${track.title}** !`);
});

player.on('trackAdd', (queue, track) => {
  queue.metadata.send(`🎶 | трек **${track.title}** в очереди!`);
});

player.on('botDisconnect', queue => {
  queue.metadata.send('❌ | Я был вручную отключен от голосового канала, очистив очередь!');
});


player.on('queueEnd', queue => {
  queue.metadata.send('✅ | Очередь закончена!');
});

client.once('ready', async () => {
  console.log('Ready!');
});

client.on('ready', function() {
  client.user.setActivity(config.activity, { type: config.activityType });
});

client.once('reconnecting', () => {
  console.log('Reconnecting!');
});

client.once('disconnect', () => {
  console.log('Disconnect!');
});

client.on('messageCreate', async message => {
  if (message.author.bot || !message.guild) return;
  if (!client.application?.owner) await client.application?.fetch();

  if (message.content === '!deploy' && message.author.id === client.application?.owner?.id) {
    await message.guild.commands
      .set(client.commands)
      .then(() => {
        message.reply('развертывание слеш команд завершено!');
      })
      .catch(err => {
        message.reply('Не удалось развернуть команды! Убедитесь, что у бота есть разрешение application.commands!');
        console.error(err);
      });
  }
});

client.on('messageCreate', async message => {
  if (message.author.bot || !message.guild) return;
  if (!client.application?.owner) await client.application?.fetch();

  if (message.content === '!start' && message.author.id === message.guild.ownerId) {
    await message.guild.commands
      .set(client.commands)
      .then(() => {
        message.reply('развертывание слеш команд завершено!');
      })
      .catch(err => {
        message.reply('Не удалось развернуть команды! Убедитесь, что у бота есть разрешение application.commands!');
        console.error(err);
      });
  }
});
client.on('interactionCreate', async interaction => {
  const command = client.commands.get(interaction.commandName.toLowerCase());

  try {
    if (interaction.commandName == 'ban' || interaction.commandName == 'userinfo') {
      command.execute(interaction, client);
    } else {
      command.execute(interaction, player);
    }
  } catch (error) {
    console.error(error);
    interaction.followUp({
      content: 'При попытке выполнить эту команду произошла ошибка!',
    });
  }
});

client.login(config.token);
