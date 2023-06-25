import 'dotenv/config';

import { getEmojis, restaurants } from './restaurants';

import { App } from '@slack/bolt';
import { ChatPostMessageResponse } from '@slack/web-api/dist/response/ChatPostMessageResponse';

const app = new App({
  appToken: process.env.SLACK_APP_TOKEN,
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: true,
});

let currentMessage: ChatPostMessageResponse | undefined = undefined;

app.action('generate-random-restaurant', async ({ ack, say }) => {
  await ack();

  const { message } = await app.client.reactions.get({
    channel: currentMessage?.channel!,
    timestamp: currentMessage?.message?.ts!,
  });

  const reactions = message?.reactions || [];

  const maxCount = Math.max(...(reactions.map((item) => item.count) as number[]));
  const itemsWithMaxCount = reactions.filter((item) => item.count === maxCount);
  const selectedItem = itemsWithMaxCount[Math.floor(Math.random() * itemsWithMaxCount.length)];

  const category = restaurants[selectedItem.name!];

  const restaurant = category.names[Math.floor(Math.random() * category.names.length)];

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
});

app.message('mitä syyää?', async ({ say }) => {
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
