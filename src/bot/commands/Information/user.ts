import { PermissionFlagsBits } from 'discord.js';
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
      showInHelp: true
    };
    this.permissions = { bot: [PermissionFlagsBits.EmbedLinks] };
  }

  override run({ t, interaction }: CommandRunOptions) {
    switch (interaction.options.getSubcommand()) {
      case 'avatar': {
        this.client.commands.get('_user_avatar')?.run({ t, interaction });
        break;
      }

      case 'info': {
        this.client.commands.get('_user_info')?.run({ t, interaction });
        break;
      }

      case 'banner': {
        this.client.commands.get('_user_banner')?.run({ t, interaction });
        break;
      }
    }
  }
}
