import type { User } from 'discord.js';

export default {
  // General errors
  'permissions/bot/missing': (perms: string[]) => `Eu não tenho as permissões necessárias: ${perms.join(', ')}`,
  'permissions/user/missing': (perms: string[]) => `Você não tem as permissões necessárias: ${perms.join(', ')}`,

  // Ping
  'ping/calculating': 'Calculando...',
  'ping/result': (u: User, wsPing: number, apiPing: number, dbPing: number) => `🏓 ${u} **|** Pong!\n**WebSocket:** ${wsPing}ms\n**API Ping:** ${apiPing}ms\n**Database Ping:** ${dbPing}ms`,

  // AFK
  'afk/enabled': (u: User) => `✅ ${u} **|** Agora você está ausente.`,
  'afk/alreadySet': (u: User) => `❌ ${u} **|** Você já está ausente.`,
  'afk/notAfk': (u: User) => `❌ ${u} **|** Você não está ausente.`,
  'afk/manuallyRemoved': (u: User) => `✅ ${u} **|** Você não está mais ausente.`,
  'afk/autoremoved': (u: User, time: number) => `👋 ${u} **|** Bem-vindo novamente, seu AFK foi removido.\n⏰ **|** Você ficou ausente <t:${time}:R>`,
  'afk/mentioned': (u: User, time: number, reason?: string) => `${u} ficou ausente <t:${time}:R>.\n_\`${reason ?? 'Sem motivo informado.'}\`_`,
} as const;
