import { init } from '@instantdb/core';

const APP_ID = process.env.VITE_INSTANT_APP_ID || 'your_instant_app_id_here';
const EVENT_ID = process.env.EVENT_ID || 'golden-globes-2026';

async function main() {
  const dbCore = init({ appId: APP_ID });

  const categories = await dbCore.query({
    categories: {
      $: {
        where: { event_id: EVENT_ID },
        order: { display_order: 'asc' }
      },
      nominees: {
        $: {
          order: { display_order: 'asc' }
        }
      }
    }
  });

  console.log(JSON.stringify(categories.categories, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
