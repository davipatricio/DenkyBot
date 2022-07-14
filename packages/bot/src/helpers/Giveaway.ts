import dayjs from 'dayjs';
import { ActionRowBuilder, EmbedBuilder, Interaction, SelectMenuBuilder, SelectMenuOptionBuilder } from 'discord.js';
import type { DenkyClient } from '../types/Client';

export async function handleInteraction(client: DenkyClient, interaction: Interaction) {
  if (!interaction.isButton()) return;
  if (interaction.customId !== 'participate') return;
  await interaction.deferReply({ ephemeral: true });

  const giveawayData = await client.databases.getGiveaway(interaction.message.id);
  if (!giveawayData || giveawayData.ended) return;

  if (giveawayData.participants.includes(interaction.user.id)) {
    interaction.editReply({ content: '❌ **|** Você está já está participando do sorteio.' });
    return;
  }

  await client.databases.updateGiveaway({
    ...giveawayData,
    participants: [...giveawayData.participants, interaction.user.id]
  });
  interaction.editReply({ content: '🎉 **|** Você está participando do sorteio. Boa sorte!' });
}

export async function checkEndedGiveaways(client: DenkyClient) {
  const giveawaysArray = await client.databases.fetchGiveaways();
  giveawaysArray.forEach(async giveaway => {
    const { winnerAmount, participants, channelId, description, messageId, endTimestamp } = giveaway;
    // If current timestamp is lower than end timestamp, the giveaway is not ended
    if (BigInt(Date.now()) < endTimestamp) return;
    const channel = await client.channels.fetch(channelId).catch(() => {});
    if (!channel || !channel.isTextBased()) {
      client.databases.deleteGiveaway(messageId);
      return;
    }
    const message = await channel.messages.fetch(messageId).catch(() => {});
    if (!message || !message.embeds[0]) {
      client.databases.deleteGiveaway(messageId);
      return;
    }

    await client.databases.updateGiveaway({
      ...giveaway,
      ended: true
    });

    const embed = new EmbedBuilder(message.embeds[0].toJSON())
      .setDescription(`${description}\n\n🔢 **Ganhadores**: ${winnerAmount}\n⏲️ **Finalizado em**: <t:${Math.round(Date.now() / 1000)}:R>`)
      .setFooter({ text: '⏰ Sorteio finalizado!' })
      .setColor('Green');

    const row = new ActionRowBuilder<SelectMenuBuilder>().setComponents([
      new SelectMenuBuilder()
        .setCustomId('dropdown')
        .setPlaceholder('Opções adicionais')
        .addOptions([new SelectMenuOptionBuilder().setEmoji('🔁').setLabel('Novo ganhador').setValue('reroll').setDescription('Clique para escolher um novo ganhador')])
    ]);

    if (participants.length) {
      // Get random X winners from participants
      const winners: string[] = [];
      // Shuffle participants 7 times to get a random order
      for (let i = 0; i < 7; i++) participants.sort(() => Math.random() - 0.5);

      winners.push(...participants.slice(0, winnerAmount));

      const winnerString = winners.length > 1 ? `${winners.map(m => `<@!${m}>`).join(', ')}` : `<@!${winners[0]}>`;
      embed.addFields([{ name: '🌟 Ganhadores', value: winnerString }]);
    } else embed.addFields([{ name: '🌟 Ganhadores', value: 'Não houve participantes neste sorteio.' }]).setColor('Red');

    message.edit({ embeds: [embed], components: [row] });
  });
}

export async function deleteOldGiveaways(client: DenkyClient) {
  const giveawaysArray = await client.databases.giveaway.findMany({
    where: {
      ended: true
    },
    take: 100
  });

  for (const giveaway of giveawaysArray) {
    const { endTimestamp, messageId } = giveaway;
    // If the giveaway is ended and if the giveaway is 2 months old, delete it
    if (Date.now() > dayjs(Number(endTimestamp)).add(2, 'month').valueOf()) {
      client.databases.deleteGiveaway(messageId);
    }
  }
}
