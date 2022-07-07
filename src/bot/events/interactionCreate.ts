import { ChannelType, ChatInputCommandInteraction, EmbedBuilder, Interaction, PermissionsBitField, TextChannel, WebhookClient } from 'discord.js';
import type { Command, CommandLocale, CommandRunOptions } from '../../structures/Command';
import { Event } from '../../structures/Event';
import type { DenkyClient } from '../../types/Client';
import type { AllLocalePaths } from '../managers/LanguageManager';

export default class InteractionCreateEvent extends Event {
  /** Webhook used to log commands */
  webhookCommandLogs: WebhookClient;
  constructor() {
    super();
    this.eventName = 'interactionCreate';
  }

  override async run(client: DenkyClient, interaction: Interaction) {
    if (!interaction.isChatInputCommand()) return;

    const botCommand = client.commands.get(interaction.commandName);
    if (!botCommand) return;

    const userLocale = client.helpers.recommendLocale(interaction.locale);

    const t = (path: AllLocalePaths, ...args: unknown[]) => {
      return client.languages.manager.get(userLocale, path, ...args);
    };

    if (interaction.inGuild()) {
      if (!InteractionCreateEvent.checkBotPermissions(interaction, botCommand, t)) return;
    }

    if (botCommand.config.autoDefer) await interaction.deferReply({ ephemeral: botCommand.config.ephemeral });

    this.logCommand(client, interaction, userLocale);
    botCommand.run({ interaction, t } as CommandRunOptions);
  }

  logCommand(client: DenkyClient, interaction: ChatInputCommandInteraction, usedLocale: string) {
    if (!client.config.webhooks.commandLogs || !process.env.DISCORD_COMMANDLOGS_WEBHOOK_URL) return;

    if (!this.webhookCommandLogs)
      this.webhookCommandLogs = new WebhookClient({
        url: process.env.DISCORD_COMMANDLOGS_WEBHOOK_URL
      });

    const embed = new EmbedBuilder()
      .setTitle('⚙️ A command was run')
      .setDescription(`\`\`\`${interaction.toString()}\`\`\``)
      .setColor('Green')
      .addFields([
        {
          name: 'User information',
          value: `User Tag: ${interaction.user.tag} (${interaction.user.id})\nUser Locale: ${interaction.locale}\nBot suggested locale: ${usedLocale}`
        },
        {
          name: 'Guild information',
          value: `Guild: ${interaction.guild?.name ?? 'Command was not run in a guild.'} (${interaction.guild?.id ?? 'No ID.'})\nMembers: ${interaction.guild?.memberCount ?? 0}`
        },
        {
          name: 'Channel information',
          value: `Channel: ${(interaction.channel as TextChannel)?.name ?? 'Unknown name.'} (${interaction.channel?.id ?? 'Unknown ID.'})\nChannel Type: ${
            ChannelType[(interaction.channel as TextChannel).type] ?? 'UNKNOWN'
          }`
        }
      ]);

    this.webhookCommandLogs.send({ embeds: [embed] });
  }

  static checkBotPermissions(interaction: ChatInputCommandInteraction, command: Command, t: CommandLocale): boolean {
    if (command.permissions.bot.length === 0) return true;
    if (!interaction.appPermissions?.has(command.permissions.bot)) {
      const permissions = new PermissionsBitField(command.permissions.bot)
        .toArray()
        .map(p => t(`permissions:${p}`))
        .join(', ');
      interaction.reply({ content: `❌ ${interaction.user} **|** ${t('command:permissions/bot/missing', permissions)}`, ephemeral: true });
      return false;
    }
    return true;
  }
}
