import type { Awaitable } from 'discord.js';
import { Event } from '../../structures/Event';
import type { DenkyClient } from '../../types/Client';

export default class ReadyEvent extends Event {
  constructor() {
    super();
    this.eventName = 'ready';
  }

  override run(client: DenkyClient): Awaitable<any> {
    console.log('✅ \x1b[34m[DENKY]\x1b[0m', `Shard ${client.shard?.ids[0]} connected.`);
  }
}
