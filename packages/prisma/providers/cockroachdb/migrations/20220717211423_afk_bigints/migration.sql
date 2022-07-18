-- CreateTable
CREATE TABLE "Suggestion" (
    "guildId" STRING NOT NULL DEFAULT '',
    "addReactions" BOOL NOT NULL DEFAULT true,
    "categories" STRING[] DEFAULT ARRAY[]::STRING[],
    "cooldown" INT4 NOT NULL DEFAULT 0,
    "useThreads" BOOL NOT NULL DEFAULT false,
    "sendNotices" BOOL NOT NULL DEFAULT false,

    CONSTRAINT "Suggestion_pkey" PRIMARY KEY ("guildId")
);

-- CreateTable
CREATE TABLE "Afk" (
    "userId" STRING NOT NULL DEFAULT '',
    "guildId" STRING,
    "reason" STRING,
    "originalNick" STRING,
    "startTime" INT8 NOT NULL DEFAULT 0,

    CONSTRAINT "Afk_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Giveaway" (
    "messageId" STRING NOT NULL DEFAULT '',
    "channelId" STRING NOT NULL DEFAULT '',
    "authorId" STRING NOT NULL DEFAULT '',
    "title" STRING NOT NULL DEFAULT '',
    "description" STRING NOT NULL DEFAULT '',
    "endTimestamp" INT8 NOT NULL DEFAULT 0,
    "winnerAmount" INT4 NOT NULL DEFAULT 0,
    "participants" STRING[] DEFAULT ARRAY[]::STRING[],
    "ended" BOOL NOT NULL DEFAULT false,

    CONSTRAINT "Giveaway_pkey" PRIMARY KEY ("messageId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Afk_userId_key" ON "Afk"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Giveaway_messageId_key" ON "Giveaway"("messageId");
