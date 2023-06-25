interface Restaurants {
  [key: string]: {
    emoji: string;
    names: string[];
  };
}

export const restaurants: Restaurants = {
  sushi: {
    emoji: 'sushi',
    names: ['NOM', 'Itsudemo', 'Michi Asia Cuisine', 'Sakuragawa'],
  },
  pizza: {
    emoji: 'pizza',
    names: ['Pizza Hut', 'RAX'],
  },
  hamburger: {
    emoji: 'hamburger',
    names: ['Naughty Burgir', 'Amarillo', 'Morton'],
  },
  indian: {
    emoji: 'curry',
    names: ['Nagarkot', 'Base Camp', 'Shalimar'],
  },
  italian: {
    emoji: 'spaghetti',
    names: ['Bella Roma'],
  },
  generic: {
    emoji: 'knife_fork_plate',
    names: ['Hox', 'Revolution', 'Venn', 'Bistro', 'Cielo', 'Fit', 'Verso', 'Harald', 'Green Egg', 'Trattoria aukio'],
  },
};

export const getEmojis = () => {
  return Object.keys(restaurants).map((key) => restaurants[key].emoji);
};
