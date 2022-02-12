# @automatedtf/reactor

### 📖 Table of Contents
- [👋 Introduction](#-introduction)
- [🔌 Getting Started](#-getting-started)
- [✨ Events](#-events)
- [💎 What can it be used for?](#-what-can-it-be-used-for)
    - [Single Instance Bots](#single-instance-bots)
    - [Distributed Systems](#distributed-systems)

## 👋 Introduction

Reactor offers a standardised Steam API event sourcer implementation and interface for events and changes on a Steam user account. Updates are polled on a regular basis via Dr. McKay's [`node-steam-user`](https://github.com/DoctorMcKay/node-steam-user#steamuser) and [`node-steam-tradeoffermanager`](https://github.com/DoctorMcKay/node-steam-tradeoffer-manager/wiki/TradeOfferManager) and are emitted as events for applications to process and act upon via callback.

This abstraction simplifies worrying about the code to get a 'Steam bot' running, decoupling it away from the logic of other applications within a Steam-related automated system using Steam accounts.
## 🔌 Getting Started

Most applications that will use `@automatedtf/reactor` will follow the below structure to subscribe to different events and some sort of callback function.

```typescript
require("dotenv").config();
import { serialiseData, SteamEvents, SteamReactor } from '@automatedtf/reactor';

// Set up bot
const bot = new SteamReactor({
    steamid: process.env.STEAMID,
    accountName: process.env.ACCOUNT_NAME,
    password: process.env.ACCOUNT_PASSWORD,
    sharedSecret: process.env.SHARED_SECRET,
    logonID: process.env.LOGON_ID ? parseInt(process.env.LOGON_ID) : undefined
});

// Hook onto "OnLogin" event
bot.on(SteamEvents.OnLogin, () => {
    console.log("Bot has logged in!");
});
```

We will require the following environment variables within the application's `.env` file:

```env
ACCOUNT_NAME=???
ACCOUNT_PASSWORD=???
SHARED_SECRET=???
IDENTITY_SECRET=???
STEAMID=???
```

The following can be optionally added:
```
PLAYING_GAME_NAME=???
LOGON_ID=??? # e.g 336162
```

## ✨ Events
All events are defined under the enum `SteamEvents`. Using the `bot.on(event, callback)` pattern to subscribe to a `SteamEvents` event will immediately provide the following type data within your IDE for your callback function.

### `OnError`
Emitted when an error has occurred.
- `error: Error` - Error object of the error

### `OnLogin`
Emitted when the bot instance has logged into Steam's web client. No new information is learnt so none returned.

### `OnWebSessionJoin`
Emitted when the bot has connected to a Steam web session.
- `sessionid: string`
- `cookies: string[]`

### `OnLogout`
Emitted when the bot instance has logged out of Steam's web client
- `eresult: number`
- `msg?: string`
### `OnNewTrade`
Emitted when the bot instance receives a new trade offer
- `offer: TradeOffer`

### `OnTradeSent`
Emitted when a trade offer from the bot has been sent out
- `offer: TradeOffer`

### `OnSentTradeCompleted`
Emitted when a trade offer sent out from the bot has been accepted and confirmed.
- `offer: TradeOffer`

### `OnIncomingTradeCompleted`
Emitted when an incoming trade offer to the bot has been accepted and confirmed.
- `offer: TradeOffer`

### `OnTradeFailed`
Emitted when any trade offer (incoming or sent) has not been accepted and can't be reacted upon further.
- `offer: TradeOffer`

### `OnChatMessage`
Emitted when a chat message was received from another user.
- `steamid: string`
- `message: string`

### `OnFriendRequest`
Emitted when a user has chosen to send a friend request to the bot.
- `steamid: string`

## 💎 What can it be used for?

The `SteamReactor` class extends from an `EventEmitter` and can be used to subscribe to events and perform callback functions when those events are triggered. The callback functions can hook into a [`SteamUser`](https://github.com/DoctorMcKay/node-steam-user#steamuser) instance via the `user` property, or into a [`SteamTradeOfferManager`](https://github.com/DoctorMcKay/node-steam-tradeoffer-manager/wiki/TradeOfferManager) instance via the `tradeManager` property.

The intricate setup and maintenance for a bot is handled by this library, meaning that one can have a bot instance that starts publishing new events immediately from startup. This can be utilised in a number of ways.

#### Single Instance Bots
By applying on handlers within `index.ts`, one can easily use `@automatedtf/reactor` as a foundation for their own bot with more features.

```typescript
// index.ts

require("dotenv").config();
import { serialiseData, SteamEvents, SteamReactor } from '@automatedtf/reactor';

// Set up bot
const bot = new SteamReactor({
    steamid: process.env.STEAMID,
    accountName: process.env.ACCOUNT_NAME,
    password: process.env.ACCOUNT_PASSWORD,
    sharedSecret: process.env.SHARED_SECRET,
    logonID: process.env.LOGON_ID ? parseInt(process.env.LOGON_ID) : undefined
});

// Hook onto "OnLogin" event
bot.on(SteamEvents.OnLogin, () => {
    console.log("Bot has logged in!");

    // interact with steam via bot.user or bot.tradeManager!
});
```

##### Applications
- Donation bot
- Backpack.tf classifieds bot
- Chat message bot

#### Distributed Systems
The feature of pushing events to an upstream means that events can be propogated towards an inter-application event handler living somewhere else - think Kubernetes. This provides scalability, especially when event processing is much more memory-consuming in contrast to event sourcing.

See [Sentinel](https://github.com/automatedtf/sentinel) for an example of how this can be done.

##### Applications
- Bot array for a Steam items trading website
- Steam bot event monitoring and logging to record statistics on incoming trades, chat messages etc.
- Pub/Sub MQ to run a Discord notification, notify bot owner, perform the trade processing all as separate microservice applications