import { ApplicationCommandOptionType, ApplicationCommandType, EmbedBuilder, GuildMember, PermissionFlagsBits, Util } from 'discord.js';
import { Command, CommandRunOptions } from '../../../structures/Command';
import type { DenkyClient } from '../../../types/Client';

export default class UserCommand extends Command {
  constructor(client: DenkyClient) {
    super(client);
    this.rawName = 'USER';
    this.rawCategory = 'INFO';
    this.config = {
      autoDefer: true,
      ephemeral: false,
      showInHelp: true,
    };
    this.permissions = { bot: [PermissionFlagsBits.EmbedLinks], user: [] };

    this.addRawOptions({
      name: 'user',
      type: ApplicationCommandType.ChatInput,
      description: client.languages.manager.get('en_US', 'commandDescriptions:user'),
      descriptionLocalizations: {
        'pt-BR': client.languages.manager.get('pt_BR', 'commandDescriptions:user'),
      },
      options: [
        {
          name: 'info',
          type: ApplicationCommandOptionType.Subcommand,
          description: client.languages.manager.get('en_US', 'commandDescriptions:user/info'),
          descriptionLocalizations: {
            'pt-BR': client.languages.manager.get('pt_BR', 'commandDescriptions:user/info'),
          },
          options: [
            {
              name: client.languages.manager.get('en_US', 'commandNames:user/info/user'),
              nameLocalizations: {
                'pt-BR': client.languages.manager.get('pt_BR', 'commandNames:user/info/user'),
              },
              type: ApplicationCommandOptionType.User,
              required: false,
              description: client.languages.manager.get('en_US', 'commandDescriptions:user/info/user'),
              descriptionLocalizations: {
                'pt-BR': client.languages.manager.get('pt_BR', 'commandDescriptions:user/info/user'),
              },
            },
          ],
        },
      ],
    });
  }

  override async run({ t, interaction }: CommandRunOptions) {
    switch (interaction.options.getSubcommand()) {
      case 'info': {
        const user = interaction.options.getUser('user') ?? interaction.user;

        const tempMember = interaction.options.getMember('user') as GuildMember;
        const member = user.id === tempMember?.id ? tempMember : undefined;

        const cleanUsername = Util.escapeMarkdown(user.username);

        const embed = new EmbedBuilder()
          .setColor('Blurple')
          .setTitle(cleanUsername)
          .addFields([
            {
              name: `🔖 ${t('command:user/info/userTag')}`,
              value: cleanUsername === user.username ? `\`${user.tag}\`` : `${cleanUsername}#${user.discriminator}`,
              inline: true,
            },
            {
              name: `📡 ${t('command:user/info/userId')}`,
              value: `\`${user.id}\``,
              inline: true,
            },
            {
              name: `📅 ${t('command:user/info/userCreatedAt')}`,
              value: `<t:${Math.round(user.createdTimestamp / 1000)}:F> (<t:${Math.round(user.createdTimestamp / 1000)}:R>)`,
              inline: true,
            },
          ]);

        if (member && member.joinedTimestamp) {
          embed.addFields([
            {
              name: `🌟 ${t('command:user/info/memberJoinedAt')}`,
              value: `<t:${Math.round(member.joinedTimestamp / 1000)}:F> (<t:${Math.round(member.joinedTimestamp / 1000)}:R>)`,
            },
          ]);
        }

        const tempUser = await user.fetch();
        embed.setImage(tempUser.bannerURL({ size: 2048 }) ?? null);
        embed.setThumbnail(user.displayAvatarURL({ size: 1024 }));

        interaction.editReply({ content: interaction.user.toString(), embeds: [embed] });
        break;
      }
    }
  }
}
