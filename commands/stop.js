const {GuildMember} = require('discord.js');

module.exports = {
  name: 'stop',
  description: 'Остановить все песни в очереди!',
  async execute(interaction, player) {
    if (!(interaction.member instanceof GuildMember) || !interaction.member.voice.channel) {
      return void interaction.reply({
        content: 'Вы не подключены к голосовому каналу!',
        ephemeral: true,
      });
    }

    if (
      interaction.guild.me.voice.channelId &&
      interaction.member.voice.channelId !== interaction.guild.me.voice.channelId
    ) {
      return void interaction.reply({
        content: 'Вы не в моем голосовом канале!',
        ephemeral: true,
      });
    }

    await interaction.deferReply();
    const queue = player.getQueue(interaction.guildId);
    if (!queue || !queue.playing)
      return void interaction.followUp({
        content: '❌ | Музыка не воспроизводится!',
      });
    queue.destroy();
    return void interaction.followUp({content: '🛑 | Остановил плеер!'});
  },
};
