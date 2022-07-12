/* eslint-disable no-await-in-loop */
import { createLogger } from '@logger';
import { InteractionsWebserver } from '@webserver';
import { Collection } from 'discord.js';
import { readdir, readFile } from 'node:fs/promises';
import type { Command } from '../../structures/Command';
import type { CommandDataStructure } from '../../structures/CommandDataStructure';
import type { Event } from '../../structures/Event';
import type { Task } from '../../structures/Task';
import type { DenkyClient } from '../../types/Client';

type DefaultClass<T> = { default: new (...args: any[]) => T };

export class Initializer {
  constructor(client: DenkyClient) {
    this.peformPreInitialization(client).then(() => {
      if (global.IS_MAIN_PROCESS) client.logger.debug('Starting bot...', { tags: ['Bot'] });
      this.init(client);
    });
  }

  async init(client: DenkyClient) {
    await this.loadModules(client);
    await this.loadCommands(client);
    await this.loadCommandData(client);
    await this.loadEvents(client);
    await this.loadTasks(client);
    // Log bot in after loading everything
    client.login(process.env.BOT_TOKEN);
  }

  async loadCommands(client: DenkyClient) {
    client.commands = new Collection();
    const categories = await readdir('./bot/commands/');
    let totalCommands = 0;

    for (const category of categories) {
      const commands = (await readdir(`./bot/commands/${category}`)).filter(file => file.endsWith('.js'));
      totalCommands += commands.length;
      for (const command of commands) {
        const commandWithoutExtension = command.replace('.js', '');

        const { default: CommandClass }: DefaultClass<Command> = await import(`../commands/${category}/${command}`);
        const cmd = new CommandClass(client);
        client.commands.set(commandWithoutExtension, cmd);
      }
    }

    if (global.IS_MAIN_PROCESS)
      client.logger.info(`Loaded ${totalCommands} commands successfully.`, {
        tags: ['Commands']
      });
  }

  async loadCommandData(client: DenkyClient) {
    const categories = await readdir('./bot/commands/');
    for await (const category of categories) {
      const commands = (await readdir(`./bot/commands/${category}/data`)).filter(file => file.endsWith('.js'));

      for await (const command of commands) {
        const commandDataWithoutExtension = command.replace('.js', '');

        const { default: CommandDataClass }: DefaultClass<CommandDataStructure> = await import(`../commands/${category}/data/${command}`);
        const cachedCommand = client.commands.get(commandDataWithoutExtension);
        if (cachedCommand) cachedCommand.options = new CommandDataClass(client).data;
      }
    }
  }

  async loadEvents(client: DenkyClient) {
    const events = (await readdir('./bot/events/')).filter(file => file.endsWith('.js'));
    for await (const event of events) {
      const { default: EventClass }: DefaultClass<Event> = await import(`../events/${event}`);
      const evt = new EventClass();
      client.on(evt.eventName, (...rest) => evt.run(client, ...rest));
    }

    if (global.IS_MAIN_PROCESS)
      client.logger.info(`Loaded ${events.length} events successfully.`, {
        tags: ['Events']
      });
  }

  async loadModules(client: DenkyClient) {
    const modules = (await readdir('./bot/modules/')).filter(file => file.endsWith('.js'));
    for await (const module of modules) {
      const { default: Module }: DefaultClass<unknown> = await import(`../modules/${module}`);
      // eslint-disable-next-line no-new
      new Module(client);
    }

    if (global.IS_MAIN_PROCESS)
      client.logger.info(`Loaded ${modules.length} modules successfully.`, {
        tags: ['Modules']
      });
  }

  async loadTasks(client: DenkyClient) {
    client.tasks = new Collection();
    const tasks = (await readdir('./bot/tasks/')).filter(file => file.endsWith('.js'));
    for await (const task of tasks) {
      const { default: TaskClass }: DefaultClass<Task> = await import(`../tasks/${task}`);
      const createdTask = new TaskClass();
      createdTask.interval = setInterval(() => createdTask.run(client), createdTask.delay);

      client.tasks.set(createdTask.name, createdTask);
    }

    if (global.IS_MAIN_PROCESS)
      client.logger.info(`Loaded ${tasks.length} tasks successfully.`, {
        tags: ['Tasks']
      });
  }

  async loadBotConfiguration(client: DenkyClient) {
    const configData = await readFile('../config.json');
    client.config = JSON.parse(configData.toString());
  }

  loadWebserver(client: DenkyClient) {
    if (global.IS_MAIN_PROCESS) {
      const { port, publicKey, useHttpServer } = client.config.interactions;
      if (useHttpServer && publicKey && port) {
        client.logger.info('Starting webserver to listen to interactions...', {
          tags: ['Interactions']
        });
        const webserver = new InteractionsWebserver(client);
        webserver.start({ port, publicKey });
      }
    }
  }

  async peformPreInitialization(client: DenkyClient) {
    await this.loadBotConfiguration(client);
    client.logger = createLogger(
      {
        handleExceptions: true,
        handleRejections: true
      },
      client
    );
    if (global.IS_MAIN_PROCESS)
      client.logger.info('Loaded bot configuration file.', {
        tags: ['Configuration']
      });
    this.loadWebserver(client);
  }
}
