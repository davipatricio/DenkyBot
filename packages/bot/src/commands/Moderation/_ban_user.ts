import { PermissionFlagsBits } from 'discord.js';
import { Command, CommandRunOptions } from '../../structures/Command';
import type { DenkyClient } from '../../types/Client';

export default class BanUserSubCommand extends Command {
  constructor(client: DenkyClient) {
    super(client);
    this.rawName = '';
    this.config = {
      autoDefer: true,
      ephemeral: false,
      showInHelp: false
    };
    this.permissions = { bot: [PermissionFlagsBits.BanMembers] };
  }

  override run({ t, interaction }: CommandRunOptions) {
    if (!interaction.inCachedGuild() || !interaction.guild.members.me) return;

    const deleteMessageDays = Number(interaction.options.getString('delete_messages') ?? 0);
    const reason = interaction.options.getString('reason') ?? t('command:ban/user/no-reason');

    const member = interaction.options.getMember('user');
    const user = member?.user ?? interaction.options.getUser('user', true);

    if (user.id === this.client.user?.id) {
      interaction.editReply(`❌ ${interaction.user} **|** ${t('command:ban/user/error/ban-bot')}`);
      return;
    }
    if (user.id === interaction.user.id) {
      interaction.editReply(`❌ ${interaction.user} **|** ${t('command:ban/user/error/ban-self')}`);
      return;
    }

    if (member?.roles) {
      if (!member.bannable || member.roles.highest.position >= interaction.guild.members.me.roles.highest.position) {
        interaction.editReply(`❌ ${interaction.user} **|** ${t('command:ban/user/error/not-bannable')}`);
        return;
      }
      if (interaction.member.roles.highest.position <= member.roles.highest.position) {
        interaction.editReply(`❌ ${interaction.user} **|** ${t('command:ban/user/error/no-permissions')}`);
        return;
      }
    }

    interaction.guild.bans
      .create(user.id, {
        deleteMessageDays,
        reason: `${t('command:ban/user/punished-by')} ${interaction.user.tag} - ${reason}`
      })
      .then(() => {
        interaction.editReply(`✅ ${interaction.user} **|** ${t('command:ban/user/complete', user.tag ?? user.id ?? user)}`);
      })
      .catch(err => {
        const error = err.toString().toLowerCase();
        if (error.includes('missing permission')) {
          return interaction.editReply(`❌ ${interaction.user} **|** ${t('command:ban/user/error/not-bannable')}`);
        }
        if (error.includes('unknown')) {
          return interaction.editReply(`❌ ${interaction.user} **|** ${t('command:ban/user/error/unknown-member')}`);
        }
        if (error.includes('max')) {
          return interaction.editReply(`❌ ${interaction.user} **|** ${t('command:ban/user/error/maximum-bans')}`);
        }

        return interaction.editReply(`❌ ${interaction.user} **|** ${t('command:ban/user/error/unknown-error')}`);
      });
  }
}
