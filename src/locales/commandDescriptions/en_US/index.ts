export default {
  // Ping
  ping: 'Get the ping for Denky in your server',

  // AFK
  afk: 'Set an AFK status to display when you are mentioned',
  'afk/on': 'Set an AFK status to display when you are mentioned',
  'afk/on/reason': 'Reason for being AFK',
  'afk/off': 'Disables your AFK mode',

  // Poll
  poll: 'Create polls with up to 9 options',
  'poll/create': 'Creates a poll in this channel',
  'poll/create/permanent': 'Should this poll be permanent?',
  'poll/create/option1': '1st poll option',
  'poll/create/option2': '2nd poll option',
  'poll/create/option3': '3rd poll option',
  'poll/create/option4': '4th poll option',
  'poll/create/option5': '5th poll option',
  'poll/create/option6': '6th poll option',
  'poll/create/option7': '7th poll option',
  'poll/create/option8': '8th poll option',
  'poll/create/option9': '9th poll option',

  // Help
  help: 'Shows the bot commands',

  // User
  user: 'Shows user information',
  'user/avatar': 'Shows the user avatar',
  'user/avatar/user': 'The user to get the avatar of',
  'user/info': 'Shows user information',
  'user/info/user': 'The user to show information for',
  'user/banner': 'Shows the user banner',
  'users/banner/user': 'The user to get the banner of',

  // Server
  server: 'Shows server information',
  'server/info': 'View information about a server',
  'server/icon': 'See a server icon',
  'server/banner': 'See a server banner',

  // Bot
  bot: 'Shows bot information',
  'bot/invite': 'Invite Denky to your server',
  'bot/vote': 'Informs the link to vote for me',

  // Text
  text: 'Translates or edits text in different ways',
  'text/text': 'Text to edit',
  'text/claps': 'Sends 👏 a 👏 text 👏 with 👏 claps',
  'text/invert': 'Inverts a text',
  'text/emojify': 'Emojifies a text',
  'text/vaporwave': 'Creates a V A P O R W A V E text',

  // Config
  config: 'Configure Denky features on your server',
  'config/suggestions': "Configure Denky's suggestion system",

  // Suggestions
  suggestions: 'Send suggestions to the server',
  'suggestions/send': 'Send suggestions to the server',
  'suggestions/edit': 'Edit a suggestion you previously submitted',
  'suggestions/edit/id': 'ID of your suggestion',
  'suggestions/accept': 'Accepts a suggestion that was previously submitted',
  'suggestions/accept/id': 'ID of the suggestion to accept',
  'suggestions/accept/reason': 'The reason for accepting the suggestion',

  // Ban
  ban: 'Bans a user from the server',
  'ban/user': 'The user to ban',
  'ban/delete_messages': 'Whether or not to delete the messages of the banned user',
  'ban/reason': 'The reason for the ban'
} as const;
