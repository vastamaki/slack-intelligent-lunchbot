import 'dotenv/config';

import { getEmojis, restaurants } from './restaurants';

import { App } from '@slack/bolt';
import { ChatPostMessageResponse } from '@slack/web-api/dist/response/ChatPostMessageResponse';

const app = new App({
  appToken: process.env.SLACK_APP_TOKEN,
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: true,
});

let originalSenderId: string | undefined = undefined;
let currentMessage: ChatPostMessageResponse | undefined = undefined;

app.action('generate-random-restaurant', async ({ ack, say, body }) => {
  await ack();

  if (originalSenderId === body.user.id) {
    say({
      channel: currentMessage?.channel!,
      text: `<@${(body.user as any).id}> näpit irti siitä napista!`,
    });
    return;
  }

  const { message } = await app.client.reactions.get({
    channel: currentMessage?.channel!,
    timestamp: currentMessage?.message?.ts!,
  });

  const reactions = message?.reactions || [];

  const maxCount = Math.max(...(reactions.map((item) => item.count) as number[]));

  const itemsWithMaxCount = reactions.filter((item) => item.count === maxCount);

  const selectedItem = itemsWithMaxCount[Math.floor(Math.random() * itemsWithMaxCount.length)];

  const category = Object.keys(restaurants).find((key) => restaurants[key].emoji === selectedItem.name);

  const restaurant = restaurants[category!].names[Math.floor(Math.random() * restaurants[category!].names.length)];

  await app.client.chat.delete({
    channel: currentMessage?.channel!,
    ts: currentMessage?.message?.ts!,
  });

  await say({
    channel: currentMessage?.channel!,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `Tämän päivän eväspaikaksi valikoitui: *${restaurant}*`,
        },
      },
    ],
  });

  currentMessage = undefined;
  originalSenderId = undefined;
});

app.message('mitä syyää?', async ({ say, message }) => {
  const msg = await say({
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'Kaunista päivää vai kuinka? Mitä tänään syötäisiin?',
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: Object.keys(restaurants)
            .map((name) => {
              const restaurant = restaurants[name];

              return `:${restaurant.emoji}: ${name} - ${restaurant.names.join(', ')}`;
            })
            .join('\n'),
        },
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Get random restaurant',
              emoji: true,
            },
            value: 'generate-random-restaurant',
            action_id: 'generate-random-restaurant',
          },
        ],
      },
    ],
  });

  originalSenderId = (message as any).user;
  currentMessage = msg;

  const emojis = getEmojis();

  for (const emoji of emojis) {
    await app.client.reactions.add({
      name: emoji,
      channel: msg.channel,
      timestamp: currentMessage?.ts,
    });
  }
});

(async () => {
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();
