import { supabase } from '../src/supabase.ts'

const goldenGlobesCategories = [
  {
    name: 'Best Picture - Drama',
    base_points: 50,
    emoji: '🏆',
    nominees: [
      { name: 'One Battle After Another', tmdb_id: 123456 },
      { name: 'Marty Supreme', tmdb_id: 789012 },
      { name: 'Gladiator II', tmdb_id: 558449 },
      { name: 'The Brutalist', tmdb_id: 1022789 },
      { name: 'A Complete Unknown', tmdb_id: 872585 }
    ]
  },
  {
    name: 'Best Picture - Musical or Comedy',
    base_points: 50,
    emoji: '🎭',
    nominees: [
      { name: 'Anora', tmdb_id: 1184918 },
      { name: 'Emilia Pérez', tmdb_id: 945603 },
      { name: 'Challengers', tmdb_id: 1057268 },
      { name: 'The Substance', tmdb_id: 1058976 },
      { name: 'Wicked', tmdb_id: 190771 }
    ]
  },
  {
    name: 'Best Director',
    base_points: 50,
    emoji: '🎬',
    nominees: [
      { name: 'Jacques Audiard - Emilia Pérez', tmdb_id: null },
      { name: 'Edward Berger - Conclave', tmdb_id: 956542 },
      { name: 'Sean Baker - Anora', tmdb_id: null },
      { name: 'Brady Corbet - The Brutalist', tmdb_id: null },
      { name: 'Coralie Fargeat - The Substance', tmdb_id: null }
    ]
  },
  {
    name: 'Best Actor - Drama',
    base_points: 50,
    emoji: '🎭',
    nominees: [
      { name: 'Adrien Brody - The Brutalist', tmdb_id: null },
      { name: 'Timothée Chalamet - A Complete Unknown', tmdb_id: null },
      { name: 'Daniel Craig - Queer', tmdb_id: 868731 },
      { name: 'Colin Farrell - The Penguin', tmdb_id: null },
      { name: 'Ralph Fiennes - Conclave', tmdb_id: null }
    ]
  },
  {
    name: 'Best Actress - Drama',
    base_points: 50,
    emoji: '🌟',
    nominees: [
      { name: 'Pamela Anderson - The Last Showgirl', tmdb_id: 1056987 },
      { name: 'Angelina Jolie - Maria', tmdb_id: 1020992 },
      { name: 'Karla Sofía Gascón - Emilia Pérez', tmdb_id: null },
      { name: 'Tilda Swinton - The Room Next Door', tmdb_id: 1020993 },
      { name: 'Kate Winslet - Lee', tmdb_id: 1184919 }
    ]
  },
  {
    name: 'Best Actor - Musical or Comedy',
    base_points: 50,
    emoji: '🎭',
    nominees: [
      { name: 'Jesse Eisenberg - A Real Pain', tmdb_id: 1020994 },
      { name: 'Hugh Grant - Heretic', tmdb_id: 956543 },
      { name: 'Glen Powell - Hit Man', tmdb_id: 956544 },
      { name: 'Jesse Plemons - Civil War', tmdb_id: 1020995 },
      { name: 'Sebastian Stan - A Different Man', tmdb_id: 1020996 }
    ]
  },
  {
    name: 'Best Actress - Musical or Comedy',
    base_points: 50,
    emoji: '🌟',
    nominees: [
      { name: 'Amy Adams - Nightbitch', tmdb_id: 956545 },
      { name: 'Cynthia Erivo - Wicked', tmdb_id: null },
      { name: 'Karla Sofía Gascón - Emilia Pérez', tmdb_id: null },
      { name: 'Mikey Madison - Anora', tmdb_id: null },
      { name: 'Demi Moore - The Substance', tmdb_id: null }
    ]
  },
  {
    name: 'Best Supporting Actor',
    base_points: 20,
    emoji: '🎭',
    nominees: [
      { name: 'Yura Borisov - Anora', tmdb_id: null },
      { name: 'Kieran Culkin - A Real Pain', tmdb_id: null },
      { name: 'Edward Norton - A Complete Unknown', tmdb_id: null },
      { name: 'Guy Pearce - The Brutalist', tmdb_id: null },
      { name: 'Denzel Washington - Gladiator II', tmdb_id: null }
    ]
  },
  {
    name: 'Best Supporting Actress',
    base_points: 20,
    emoji: '🌟',
    nominees: [
      { name: 'Selena Gomez - Emilia Pérez', tmdb_id: null },
      { name: 'Felicity Huffman - The Brutalist', tmdb_id: null },
      { name: 'Margaret Qualley - The Substance', tmdb_id: null },
      { name: 'Ariana Grande - Wicked', tmdb_id: null },
      { name: 'Zoe Saldaña - Emilia Pérez', tmdb_id: null }
    ]
  },
  {
    name: 'Best Screenplay',
    base_points: 20,
    emoji: '📝',
    nominees: [
      { name: 'The Brutalist', tmdb_id: null },
      { name: 'Anora', tmdb_id: null },
      { name: 'A Complete Unknown', tmdb_id: null },
      { name: 'Conclave', tmdb_id: null },
      { name: 'The Substance', tmdb_id: null }
    ]
  },
  {
    name: 'Best Animated Feature',
    base_points: 20,
    emoji: '🎨',
    nominees: [
      { name: 'Flow', tmdb_id: 1020997 },
      { name: 'Inside Out 2', tmdb_id: 1020998 },
      { name: 'Moana 2', tmdb_id: 1020999 },
      { name: 'Wallace & Gromit: Vengeance Most Fowl', tmdb_id: 1021000 },
      { name: 'The Wild Robot', tmdb_id: 1021001 }
    ]
  },
  {
    name: 'Best Foreign Language Film',
    base_points: 20,
    emoji: '🌍',
    nominees: [
      { name: 'Emilia Pérez', tmdb_id: null },
      { name: 'The Girl with the Needle', tmdb_id: 1021002 },
      { name: 'I\'m Still Here', tmdb_id: 1021003 },
      { name: 'Kneecap', tmdb_id: 1021004 },
      { name: 'The Seed of the Sacred Fig', tmdb_id: 1021005 }
    ]
  },
  {
    name: 'Best Original Score',
    base_points: 10,
    emoji: '🎵',
    nominees: [
      { name: 'The Brutalist', tmdb_id: null },
      { name: 'Conclave', tmdb_id: null },
      { name: 'Dune: Part Two', tmdb_id: 839582 },
      { name: 'Joker: Folie à Deux', tmdb_id: 1021006 },
      { name: 'Wicked', tmdb_id: null }
    ]
  },
  {
    name: 'Best Original Song',
    base_points: 10,
    emoji: '🎤',
    nominees: [
      { name: 'El Mal - Emilia Pérez', tmdb_id: null },
      { name: 'Kiss the Sky - The Brutalist', tmdb_id: null },
      { name: 'Mysterious Ways - Sing Sing', tmdb_id: null },
      { name: 'Never Too Late - Elton John', tmdb_id: null },
      { name: 'Defying Gravity - Wicked', tmdb_id: null }
    ]
  },
  {
    name: 'Best Cinematography',
    base_points: 10,
    emoji: '📷',
    nominees: [
      { name: 'The Brutalist', tmdb_id: null },
      { name: 'Dune: Part Two', tmdb_id: null },
      { name: 'Maria', tmdb_id: null },
      { name: 'The Substance', tmdb_id: null },
      { name: 'Wicked', tmdb_id: null }
    ]
  }
]

async function seedGoldenGlobes2026() {
  console.log('Seeding Golden Globes 2026 categories and nominees...')
  
  try {
    for (let i = 0; i < goldenGlobesCategories.length; i++) {
      const category = goldenGlobesCategories[i]
      
      // Insert category
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .insert({
          event_id: 'golden-globes-2026',
          name: category.name,
          display_order: i + 1,
          base_points: category.base_points,
          emoji: category.emoji
        })
        .select()
        .single()
      
      if (categoryError) {
        console.error('Error inserting category:', categoryError)
        continue
      }
      
      console.log(`Inserted category: ${category.name}`)
      
      // Insert nominees
      for (let j = 0; j < category.nominees.length; j++) {
        const nominee = category.nominees[j]
        
        const { error: nomineeError } = await supabase
          .from('nominees')
          .insert({
            category_id: categoryData.id,
            name: nominee.name,
            tmdb_id: nominee.tmdb_id,
            display_order: j + 1
          })
        
        if (nomineeError) {
          console.error('Error inserting nominee:', nomineeError)
        } else {
          console.log(`  - Inserted nominee: ${nominee.name}`)
        }
      }
    }
    
    console.log('✅ Golden Globes 2026 data seeded successfully!')
    
  } catch (error) {
    console.error('Error seeding data:', error)
  }
}

seedGoldenGlobes2026()
