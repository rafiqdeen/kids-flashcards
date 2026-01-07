export const colors = [
  { id: 'red', name: 'Red', hex: '#EF4444', emoji: '🔴', example: 'Like an apple' },
  { id: 'orange', name: 'Orange', hex: '#F97316', emoji: '🟠', example: 'Like an orange' },
  { id: 'yellow', name: 'Yellow', hex: '#EAB308', emoji: '🟡', example: 'Like the sun' },
  { id: 'green', name: 'Green', hex: '#22C55E', emoji: '🟢', example: 'Like grass' },
  { id: 'blue', name: 'Blue', hex: '#3B82F6', emoji: '🔵', example: 'Like the sky' },
  { id: 'purple', name: 'Purple', hex: '#A855F7', emoji: '🟣', example: 'Like grapes' },
  { id: 'brown', name: 'Brown', hex: '#92400E', emoji: '🟤', example: 'Like chocolate' },
  { id: 'black', name: 'Black', hex: '#1F2937', emoji: '⚫', example: 'Like night' },
  { id: 'white', name: 'White', hex: '#F9FAFB', emoji: '⚪', example: 'Like snow' },
];

export const shapes = [
  { id: 'circle', name: 'Circle', emoji: '🔴', sides: 0, description: 'Round like a ball' },
  { id: 'square', name: 'Square', emoji: '🟦', sides: 4, description: 'Four equal sides' },
  { id: 'triangle', name: 'Triangle', emoji: '🔺', sides: 3, description: 'Three sides' },
  { id: 'star', name: 'Star', emoji: '⭐', sides: 5, description: 'Twinkles in the sky' },
  { id: 'heart', name: 'Heart', emoji: '❤️', sides: 0, description: 'Symbol of love' },
  { id: 'diamond', name: 'Diamond', emoji: '💎', sides: 4, description: 'Sparkly gem' },
  { id: 'moon', name: 'Moon', emoji: '🌙', sides: 0, description: 'Crescent shape' },
  { id: 'rainbow', name: 'Rainbow', emoji: '🌈', sides: 0, description: 'Colorful arch' },
];

export const colorsShapes = [...colors, ...shapes];
