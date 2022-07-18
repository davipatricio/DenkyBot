/* eslint-disable no-await-in-loop */
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, ComponentType, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import ms from 'ms';
import { Command, CommandRunOptions } from '../../structures/Command';
import type { DenkyClient } from '../../types/Client';

export default class LockdownCommand extends Command {
  constructor(client: DenkyClient) {
    super(client);
    this.rawName = 'LOCKDOWN';
    this.rawCategory = 'MODERATION';
    this.config = {
      autoDefer: true,
      ephemeral: false,
      showInHelp: true
    };
    this.permissions = { bot: [PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageGuild] };
  }

  override run({ t, interaction }: CommandRunOptions) {
    // if (interaction.guild!.memberCount < 30) {
    //   interaction.editReply(`❌ ${interaction.user} **|** O servidor possui menos de 30 membros, não é possível bloquear todos os canais.`);
    //   return;
    // }

    switch (interaction.options.getSubcommand(true)) {
      case 'ativar':
        this.#enableLockdown({ t, interaction });
        break;
      case 'desativar':
        this.#disableLockdown({ t, interaction });
        break;
    }
  }

  async #enableLockdown({ interaction }: CommandRunOptions) {
    const lockdown = await this.client.databases.getLockdown(interaction.guild!.id);
    if (lockdown) {
      interaction.editReply(`❌ ${interaction.user} **|** O servidor já está bloqueado.`);
      return;
    }

    const confirmationRow = new ActionRowBuilder<ButtonBuilder>().setComponents([
      new ButtonBuilder().setCustomId('enable').setEmoji('🔒').setLabel('Sim').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('cancel').setEmoji('❌').setLabel('Não').setStyle(ButtonStyle.Secondary)
    ]);

    const message = await interaction.editReply({
      content: `⚠️ ${interaction.user} **|** Você tem certeza que deseja bloquear **todos os canais** que membros podem atualmente enviar mensagens? Esta ação não poderá ser parada após iniciada.
⚙️ **|** Será possível reverter esta ação utilizando \`/lockdown desbloquear\`.
🛡️ **|** É possível iniciar 1 lockdown ou desfazer 1 lockdown a cada 5 minutos.`,
      components: [confirmationRow]
    });

    const collector = message.createMessageComponentCollector<ComponentType.Button>({
      filter: m => m.user.id === interaction.user.id,
      time: 60000,
      max: 1
    });

    collector.on('collect', async int => {
      await int.deferUpdate();

      if (int.customId === 'enable') {
        message.edit({ content: `⏲️ ${interaction.user} **|** Bloqueando canais que membros podem enviar mensagens, aguarde...`, components: [] });

        await this.client.databases.createLockdown({
          guildId: interaction.guild!.id,
          startTime: BigInt(Date.now()),
          blockedChannels: []
        });

        const blockedChannels: string[] = [];
        const couldNotBlockChannels: string[] = [];
        const alreadyBlocked: string[] = [];
        const noPerms: string[] = [];

        const allowedChannelTypes = [ChannelType.GuildText, ChannelType.GuildVoice, ChannelType.GuildVoice];
        const canais = (await interaction.guild!.channels.fetch()).filter(c => allowedChannelTypes.includes(c.type));

        if (!canais.size) {
          await this.client.databases.deleteLockdown(interaction.guild!.id);
          message.edit({ content: `❌ ${interaction.user} **|** Não há canais para bloquear.`, components: [] });
          return;
        }

        for (const canal of canais.values()) {
          if (!canal) continue;
          if (!canal.id) continue;
          if (!canal.manageable) {
            noPerms.push(canal.id);
            continue;
          }

          const permissionCached = canal.permissionOverwrites.cache.get(interaction.guild!.id);
          if (!permissionCached) {
            await canal.permissionOverwrites
              .create(interaction.guild!.id, { SendMessages: false, Connect: false }, { reason: `[Lockdown] Bloqueando canais | Iniciado por: ${interaction.user.tag}` })
              .then(() => blockedChannels.push(canal.id))
              .catch(() => couldNotBlockChannels.push(canal.id));
            continue;
          }

          if (
            permissionCached.allow.has(PermissionFlagsBits.Connect) ||
            permissionCached.allow.has(PermissionFlagsBits.SendMessages) ||
            (!permissionCached.allow.has(PermissionFlagsBits.Connect) && !permissionCached.deny.has(PermissionFlagsBits.Connect)) ||
            (!permissionCached.allow.has(PermissionFlagsBits.SendMessages) && !permissionCached.deny.has(PermissionFlagsBits.SendMessages))
          ) {
            await permissionCached
              .edit({ SendMessages: false, Connect: false }, `[Lockdown] Bloqueando canais | Iniciado por: ${interaction.user.tag}`)
              .then(() => blockedChannels.push(canal.id))
              .catch(() => couldNotBlockChannels.push(canal.id));
          } else alreadyBlocked.push(canal.id);
          continue;
        }

        const finalEmbed = new EmbedBuilder()
          .setTimestamp()
          .setTitle('Os seguintes canais foram bloqueados:')
          .setDescription(blockedChannels.map(i => `<#${i}>`).join(' ') || 'Nenhum')
          .setColor('Blurple');
        await this.client.databases.deleteLockdown(interaction.guild!.id);

        if (blockedChannels.length) {
          await this.client.databases.createLockdown({
            guildId: interaction.guild!.id,
            startTime: BigInt(Date.now()),
            blockedChannels
          });
          finalEmbed.setFooter({ text: '⚠️ Será possível desfazer esta ação em 5 minutos.' });
        } else finalEmbed.setFooter({ text: '⚠️ Nenhum canal foi bloqueado.' });

        if (couldNotBlockChannels.length) finalEmbed.addFields([{ name: 'Os seguintes canais não puderam ser bloqueados:', value: couldNotBlockChannels.map(i => `<#${i}>`).join(', ') || 'Nenhum.' }]);
        if (alreadyBlocked.length) finalEmbed.addFields([{ name: 'Os seguintes canais já estavam bloqueados:', value: alreadyBlocked.map(i => `<#${i}>`).join(', ') || 'Nenhum.' }]);
        if (noPerms.length) finalEmbed.addFields([{ name: 'Eu não tenho permissão para editar os canais:', value: noPerms.map(i => `<#${i}>`).join(', ') || 'Nenhum.' }]);

        message.edit({
          content: `✅ ${interaction.user} **|** ${blockedChannels.length} canais foram bloqueados com sucesso.
⏰ **|** Você pode agendar o desbloqueio automatico utilizando: \`/lockdown agendar desbloqueio\`.`,
          embeds: [finalEmbed],
          components: []
        });
        return;
      }

      message.edit({ content: `❌ ${interaction.user} **|** Você decidiu não efetuar o lockdown.`, components: [] });
    });

    collector.on('end', collected => {
      if (!collected.size) message.edit({ content: `❌ ${interaction.user} **|** Você não respondeu em tempo suficiente.`, components: [] });
    });
  }

  async #disableLockdown({ interaction }: CommandRunOptions) {
    const lockdown = await this.client.databases.getLockdown(interaction.guild!.id);
    if (!lockdown) {
      interaction.editReply(`❌ ${interaction.user} **|** O servidor não está bloqueado.`);
      return;
    }
    // Check if lockdown is 5 minutes old through the startTime property
    const diff = BigInt(Date.now()) - BigInt(lockdown?.startTime ?? 0);
    if (lockdown && diff < ms('30s')) {
      // TODO: use normal ints instead of BigInts
      interaction.editReply(`❌ ${interaction.user} **|** O servidor realizou um lockdown recentemente. Aguarde ${ms(Number(BigInt(ms('30s')) - BigInt(diff)))} para desbloqueá-lo.`);
      return;
    }

    interaction.editReply(`✅ ${interaction.user} **|** O servidor foi desbloqueado com sucesso.`);
    await this.client.databases.deleteLockdown(interaction.guild!.id);
  }
}
