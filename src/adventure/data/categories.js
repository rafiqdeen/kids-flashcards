// categories.js — the 20 categories, plus the Adventure world definition
// (ZONE_THEMES scenery + ZONE_CATS journey order). Ported verbatim from
// data.jsx (CATEGORIES) and adventure-app.jsx (ZONE_THEMES / ZONE_CATS).
// NOTE: ZONE_CATS order != CATEGORIES order — the journey is sequenced
// (animals first as the friendliest on-ramp). Zone N pairs ZONE_THEMES[N]
// with ZONE_CATS[N].

export const CATEGORIES = [
  { id:'alphabet',  name:'Alphabet',   color:'alphabet',  count:26, desc:'A to Z', icon:{name:'letter', char:'A'} },
  { id:'numbers',   name:'Numbers',    color:'numbers',   count:10, desc:'Count 1–10', icon:{name:'number', char:'3'} },
  { id:'animals',   name:'Animals',    color:'animals',   count:46, desc:'Furry friends', icon:{name:'lion'} },
  { id:'fruits',    name:'Fruits',     color:'fruits',    count:18, desc:'Yummy & sweet', icon:{name:'apple'} },
  { id:'vegetables',name:'Vegetables', color:'vegetables',count:20, desc:'Good greens', icon:{name:'carrot'} },
  { id:'birds',     name:'Birds',      color:'birds',     count:21, desc:'They fly!', icon:{name:'parrot'} },
  { id:'colors',    name:'Colors',     color:'colors',    count:9,  desc:'Rainbow', icon:{name:'swatch', hex:'#a855f7'} },
  { id:'shapes',    name:'Shapes',     color:'shapes',    count:15, desc:'Round & flat', icon:{name:'star'} },
  { id:'vehicles',  name:'Vehicles',   color:'vehicles',  count:20, desc:'Go go go', icon:{name:'car'} },
  { id:'body',      name:'Body Parts', color:'body',      count:17, desc:'All about me', icon:{name:'hand'} },
  { id:'weather',   name:'Weather',    color:'weather',   count:22, desc:'Sky watch', icon:{name:'sun'} },
  { id:'emotions',  name:'Emotions',   color:'emotions',  count:25, desc:'How I feel', icon:{name:'happy'} },
  { id:'ocean',     name:'Ocean',      color:'ocean',     count:5,  desc:'Under the sea', icon:{name:'whale'} },
  { id:'dinos',     name:'Dinosaurs',  color:'dinos',     count:4,  desc:'Roar!', icon:{name:'trex'} },
  { id:'space',     name:'Space',      color:'space',     count:4,  desc:'Blast off!', icon:{name:'rocketship'} },
  { id:'music',     name:'Music',      color:'music',     count:4,  desc:'Boom & toot', icon:{name:'drum'} },
  { id:'clothes',   name:'Clothes',    color:'clothes',   count:4,  desc:'Dress up', icon:{name:'shirt'} },
  { id:'home',      name:'My Home',    color:'home',      count:4,  desc:'Cozy things', icon:{name:'bed'} },
  { id:'foods',     name:'Foods',      color:'foods',     count:4,  desc:'Yum yum', icon:{name:'pizza'} },
  { id:'helpers',   name:'Helpers',    color:'helpers',   count:4,  desc:'Heroes near us', icon:{name:'helmet'} },
];

export const ZONE_THEMES = [
  { sky: ['#4fc3f7', '#b3e5fc'], ground: '#7ed957', name: 'Sunny Meadow' },
  { sky: ['#ffb74d', '#ffe0b2'], ground: '#ffa726', name: 'Honey Hills' },
  { sky: ['#4dd0e1', '#b2ebf2'], ground: '#26c6da', name: 'Splash Bay' },
  { sky: ['#ba68c8', '#e1bee7'], ground: '#ab47bc', name: 'Berry Woods' },
  { sky: ['#f06292', '#f8bbd0'], ground: '#ec407a', name: 'Candy Cliffs' },
  { sky: ['#7986cb', '#c5cae9'], ground: '#5c6bc0', name: 'Starlight Peak' },
  { sky: ['#9ccc65', '#dcedc8'], ground: '#689f38', name: 'Veggie Valley' },
  { sky: ['#4db6ac', '#b2dfdb'], ground: '#26a69a', name: 'Birdsong Treetops' },
  { sky: ['#ff8a65', '#ffccbc'], ground: '#f4511e', name: 'Vroom Town' },
  { sky: ['#f48fb1', '#fce4ec'], ground: '#ec407a', name: 'Me-Land' },
  { sky: ['#90a4ae', '#cfd8dc'], ground: '#546e7a', name: 'Weather Mountain' },
  { sky: ['#b39ddb', '#ede7f6'], ground: '#7e57c2', name: 'Feelings Forest' },
  { sky: ['#26c6da', '#80deea'], ground: '#00838f', name: 'Ocean Deep' },
  { sky: ['#a5d6a7', '#e8f5e9'], ground: '#558b2f', name: 'Dino Canyon' },
  { sky: ['#5c6bc0', '#9fa8da'], ground: '#283593', name: 'Space Station' },
  { sky: ['#f06292', '#f8bbd0'], ground: '#ad1457', name: 'Music Meadow' },
  { sky: ['#4fc3f7', '#b3e5fc'], ground: '#1976d2', name: 'Dress-Up Den' },
  { sky: ['#ffb74d', '#ffe0b2'], ground: '#ef6c00', name: 'Home Sweet Home' },
  { sky: ['#ff8a65', '#ffe0b2'], ground: '#d84315', name: 'Snack Street' },
  { sky: ['#ef5350', '#ffcdd2'], ground: '#c62828', name: 'Helper Heights' },
];

export const ZONE_CATS = ['animals', 'alphabet', 'numbers', 'fruits', 'shapes', 'colors',
  'vegetables', 'birds', 'vehicles', 'body', 'weather', 'emotions',
  'ocean', 'dinos', 'space', 'music', 'clothes', 'home', 'foods', 'helpers'];
