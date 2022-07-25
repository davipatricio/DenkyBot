import { CommandDataStructure } from '#structures/CommandDataStructure';
import type { DenkyClient } from '#types/Client';
import { ApplicationCommandOptionType, ApplicationCommandSubCommandData, PermissionFlagsBits } from 'discord.js';

type PollAcceptableOptions = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export default class PollData extends CommandDataStructure {
  constructor(client: DenkyClient) {
    super(client);

    const options: ApplicationCommandSubCommandData['options'] = [];
    for (let i: PollAcceptableOptions = 1; i <= 9; (i as PollAcceptableOptions)++) {
      options.push({
        name: `poll/create/option${i}`,
        type: ApplicationCommandOptionType.String,
        required: i === 1,
        description: `create/option${i}`
      });
    }

    this.parseData(client, {
      name: 'poll',
      dmPermission: false,
      defaultMemberPermissions: [PermissionFlagsBits.ManageMessages],
      description: 'poll',
      options: [
        {
          name: 'poll/create',
          type: ApplicationCommandOptionType.Subcommand,
          description: 'poll/create',
          options
        }
      ]
    });
  }
}
