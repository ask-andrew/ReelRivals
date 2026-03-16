import { init, id } from '@instantdb/admin';

const APP_ID = process.env.INSTANT_APP_ID || process.env.VITE_INSTANT_APP_ID;
const ADMIN_TOKEN = process.env.INSTANT_APP_ADMIN_TOKEN || process.env.VITE_INSTANT_SECRET;

const db = init({ appId: APP_ID, adminToken: ADMIN_TOKEN });

export const handler = async (event) => {
  try {
    console.log('🔧 [FIX OSCARS] Starting Oscar categories and nominees fix...');
    
    // Get Oscar categories
    const categoriesQuery = await db.query({
      categories: {
        $: { where: { event_id: 'oscars-2026' } },
        nominees: {}
      }
    });

    const categories = categoriesQuery.categories || [];
    console.log(`📂 Found ${categories.length} Oscar categories`);
    
    // Define Oscar nominees based on constants
    const oscarNominees = {
      '80561ae9-6994-4c42-85e5-fa01e164595e': [ // Best Picture
        { id: 'bugonia', name: 'Bugonia' },
        { id: 'f1', name: 'F1' },
        { id: 'frankenstein', name: 'Frankenstein' },
        { id: 'hamnet', name: 'Hamnet' },
        { id: 'marty-supreme', name: 'Marty Supreme' },
        { id: 'one-battle', name: 'One Battle After Another' },
        { id: 'secret-agent', name: 'The Secret Agent' },
        { id: 'sentimental-value', name: 'Sentimental Value' },
        { id: 'sinners', name: 'Sinners' },
        { id: 'train-dreams', name: 'Train Dreams' }
      ],
      'a35570f9-0a2d-4f8d-88eb-ff7e24471ac3': [ // Directing
        { id: 'chloe-zhao', name: 'Chloé Zhao' },
        { id: 'josh-safdie', name: 'Josh Safdie' },
        { id: 'paul-thomas-anderson', name: 'Paul Thomas Anderson' },
        { id: 'joachim-trier', name: 'Joachim Trier' },
        { id: 'ryan-coogler', name: 'Ryan Coogler' }
      ],
      'e7e96f91-d3e7-47bb-b2a8-a02797f4361d': [ // Actor In A Leading Role
        { id: 'timothee-chalamet', name: 'Timothée Chalamet' },
        { id: 'leonardo-dicaprio', name: 'Leonardo DiCaprio' },
        { id: 'ethan-hawke', name: 'Ethan Hawke' },
        { id: 'michael-b-jordan', name: 'Michael B. Jordan' },
        { id: 'wagner-moura', name: 'Wagner Moura' }
      ],
      '47a185d9-6e35-4bea-bb94-f33a7c5f2b7a': [ // Actor In A Supporting Role
        { id: 'benicio-del-toro', name: 'Benicio Del Toro' },
        { id: 'jacob-elordi', name: 'Jacob Elordi' },
        { id: 'delroy-lindo', name: 'Delroy Lindo' },
        { id: 'sean-penn', name: 'Sean Penn' },
        { id: 'stellan-skarsgard', name: 'Stellan Skarsgård' }
      ],
      '7299606d-3ac5-41aa-8a5d-a4da543e2227': [ // Actress In A Supporting Role
        { id: 'elle-fanning', name: 'Elle Fanning' },
        { id: 'inga-ibsdotter-lilleaas', name: 'Inga Ibsdotter Lilleaas' },
        { id: 'amy-madigan', name: 'Amy Madigan' },
        { id: 'wunmi-mosaku', name: 'Wunmi Mosaku' },
        { id: 'teyana-taylor', name: 'Teyana Taylor' }
      ],
      'ecc2bb87-61d0-4caa-afb6-05dc2c0927c6': [ // Actress In A Leading Role
        { id: 'jessie-buckley', name: 'Jessie Buckley' },
        { id: 'rose-byrne', name: 'Rose Byrne' },
        { id: 'kate-hudson', name: 'Kate Hudson' },
        { id: 'renate-reinsve', name: 'Renate Reinsve' },
        { id: 'emma-stone', name: 'Emma Stone' }
      ],
      '2e8c2cfe-464a-48ff-8bdf-b06642818d49': [ // Animated Feature Film
        { id: 'arco', name: 'Arco' },
        { id: 'elio', name: 'Elio' },
        { id: 'kpop-demon-hunters', name: 'KPop Demon Hunters' },
        { id: 'little-amelie', name: 'Little Amélie or the Character of Rain' },
        { id: 'zootopia-2', name: 'Zootopia 2' }
      ],
      '7e4874a2-be62-41d2-befe-d8edfc0d9c67': [ // International Feature Film
        { id: 'secret-agent-intl', name: 'The Secret Agent (Brazil)' },
        { id: 'accident-intl', name: 'It Was Just an Accident (France)' },
        { id: 'sentimental-value-intl', name: 'Sentimental Value (Norway)' },
        { id: 'sirat-intl', name: 'Sirât (Spain)' },
        { id: 'voice-hind-rajab', name: 'The Voice of Hind Rajab (Tunisia)' }
      ],
      '90c49f28-5365-43b8-bd87-d203bf8f676f': [ // Writing (Adapted Screenplay)
        { id: 'will-tracy', name: 'Will Tracy' },
        { id: 'guillermo-del-toro', name: 'Guillermo del Toro' },
        { id: 'chloe-zhao-maggie-ofarrell', name: 'Chloé Zhao & Maggie O\'Farrell' },
        { id: 'paul-thomas-anderson', name: 'Paul Thomas Anderson' },
        { id: 'clint-bentley-greg-kwedar', name: 'Clint Bentley & Greg Kwedar' }
      ],
      'bfede57f-1221-4757-931a-b1740817ca94': [ // Writing (Original Screenplay)
        { id: 'robert-kaplow', name: 'Robert Kaplow' },
        { id: 'jafar-panahi', name: 'Jafar Panahi' },
        { id: 'ronald-bronstein-josh-safdie', name: 'Ronald Bronstein & Josh Safdie' },
        { id: 'eskil-vogt-joachim-trier', name: 'Eskil Vogt, Joachim Trier' },
        { id: 'ryan-coogler', name: 'Ryan Coogler' }
      ]
    };
    
    // Create nominees for categories that don't have them
    const nomineeTransactions = [];
    let nomineesCreated = 0;
    
    for (const category of categories) {
      const existingNominees = category.nominees || [];
      
      if (existingNominees.length === 0 && oscarNominees[category.id]) {
        console.log(`📝 Creating nominees for ${category.name}...`);
        
        oscarNominees[category.id].forEach(nominee => {
          const nomineeId = id();
          nomineeTransactions.push(
            db.tx.nominees[nomineeId].create({
              category_id: category.id,
              name: nominee.name,
              external_id: nominee.id
            })
          );
          nomineesCreated++;
        });
      } else if (existingNominees.length > 0) {
        console.log(`✅ ${category.name} already has ${existingNominees.length} nominees`);
      }
    }
    
    if (nomineeTransactions.length > 0) {
      await db.transact(nomineeTransactions);
      console.log(`✅ Created ${nomineesCreated} Oscar nominees`);
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Oscar nominees fix completed',
        categoriesProcessed: categories.length,
        nomineesCreated: nomineesCreated,
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('❌ Error fixing Oscar nominees:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Oscar nominees fix failed',
        message: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};
