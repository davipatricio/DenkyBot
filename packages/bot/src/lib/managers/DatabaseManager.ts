import { Afk, PrismaClient, Suggestion } from '@prisma-client';
import Redis from 'ioredis';
import type Prisma from 'prisma';
import { createPrismaRedisCache } from 'prisma-redis-middleware';
import type { DenkyClient } from '../../types/Client';

export type SuggestionConfig = Partial<Suggestion> & Pick<Suggestion, 'guildId'>;
export type AFKConfig = Partial<Afk> & Pick<Afk, 'userId' | 'startTime'>;

export class DatabaseManager extends PrismaClient {
  constructor(client: DenkyClient) {
    super();
    if (client.config.cache.prismaQueries) {
      if (!process.env.REDIS_CACHE_URL) {
        process.env.REDIS_CACHE_URL = '';

        if (client.config.cache.type === 'redis') {
          client.logger.warn('No Redis cache URL provided, falling back to in-memory cache.', { tags: ['Cache'] });
          client.config.cache.type = 'memory';
        }
      }

      const storage =
        client.config.cache.type === 'redis'
          ? {
              type: 'redis' as const,
              options: {
                client: new Redis(process.env.REDIS_CACHE_URL),
                invalidation: { referencesTTL: 120 }
              }
            }
          : { type: 'memory' as const, options: { invalidation: true } };

      const cacheMiddleware: Prisma.Middleware = createPrismaRedisCache({
        models: [{ model: 'Suggestion' }, { model: 'Afk' }],
        storage,
        cacheTime: client.config.cache.lifetime,
        onError: error => {
          client.logger.error(error, { tags: 'Cache' });
        }
      });

      this.$use(cacheMiddleware);
    }
    this.$connect();
  }

  // #region Suggestion
  createSuggestion(config: SuggestionConfig) {
    return this.suggestion.create({
      data: {
        guildId: config.guildId,
        addReactions: config.addReactions,
        categories: config.categories,
        cooldown: config.cooldown,
        useThreads: config.useThreads,
        sendNotices: config.sendNotices
      }
    });
  }

  getSuggestion(guildId: string) {
    return this.suggestion
      .findFirst({
        where: {
          guildId
        }
      })
      .catch(() => undefined);
  }

  deleteSuggestion(guildId: string) {
    return this.suggestion
      .delete({
        where: {
          guildId
        }
      })
      .catch(() => {});
  }

  updateSuggestion(config: SuggestionConfig) {
    return this.suggestion.update({
      where: {
        guildId: config.guildId
      },
      data: {
        addReactions: config.addReactions,
        categories: config.categories,
        cooldown: config.cooldown,
        useThreads: config.useThreads,
        sendNotices: config.sendNotices
      }
    });
  }
  // #endregion

  // #region Afk
  createAfk(config: AFKConfig) {
    return this.afk.create({
      data: {
        userId: config.userId,
        guildId: config.guildId,
        reason: config.reason,
        originalNick: config.originalNick,
        startTime: config.startTime
      }
    });
  }

  getAfk(userId: string) {
    return this.afk
      .findFirst({
        where: {
          userId
        }
      })
      .catch(() => undefined);
  }

  deleteAfk(userId: string) {
    return this.afk
      .delete({
        where: {
          userId
        }
      })
      .catch(() => {});
  }

  updateAfk(config: AFKConfig) {
    return this.afk.update({
      where: {
        userId: config.userId
      },
      data: {
        guildId: config.guildId,
        reason: config.reason,
        originalNick: config.originalNick,
        startTime: config.startTime
      }
    });
  }
  // #endregion

  async getPing(userId: string) {
    const date = Date.now();
    try {
      await this.getAfk(userId);
      return Date.now() - date;
    } catch {
      return Date.now() - date;
    }
  }
}
