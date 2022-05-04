import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { Command, CommandRunOptions } from '../../../structures/Command';
import type { DenkyClient } from '../../../types/Client';

export default class UserAvatarSubCommand extends Command {
  constructor(client: DenkyClient) {
    super(client);
    this.rawName = '';
    this.config = {
      autoDefer: true,
      ephemeral: false,
      showInHelp: false,
      guildOnly: true,
    };
    this.permissions = { bot: [PermissionFlagsBits.EmbedLinks], user: [] };
  }

  override async run({ t, interaction }: CommandRunOptions) {
    const user = interaction.options.getUser('user') ?? interaction.user;
    const userFetched = await user.fetch(true);

    const userBanner = userFetched.bannerURL({ size: 2048 });

    if (!userBanner) {
      interaction.editReply(t('command:user/banner/noBanner'));
      return;
    }

    const embed = new EmbedBuilder().setTitle(t('command:user/banner/title', user.username)).setImage(userBanner).setColor('Blurple');

    interaction.editReply({ embeds: [embed] });
  }
}
