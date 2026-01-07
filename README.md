# Kids Flash Cards

An interactive and fun flash cards learning app designed for children. Help kids learn the alphabet, numbers, animals, and much more through engaging flip cards, audio pronunciation, and quizzes!

## Features

- **11 Learning Categories**
  - Alphabet (A-Z with pictures)
  - Numbers (1-10 with visual counting)
  - Animals (46 animals with sounds & habitats)
  - Fruits (18 fruits with colors & hints)
  - Vegetables (18 vegetables)
  - Birds (17 birds with sounds)
  - Colors & Shapes (9 colors + 8 shapes)
  - Vehicles (21 vehicles - road, rail, air, water)
  - Body Parts (18 body parts with actions)
  - Weather (22 weather types)
  - Emotions (25 feelings & expressions)

- **Interactive Flip Cards**
  - Tap to flip and reveal answers
  - Beautiful 3D flip animations
  - Glassmorphism design with modern aesthetics

- **Audio Pronunciation**
  - Text-to-speech for every card
  - Helps kids learn correct pronunciation
  - Works on all modern browsers

- **Quiz Mode**
  - Multiple choice questions
  - Score tracking
  - Celebration animations on completion

- **Progress Tracking**
  - Tracks viewed and mastered cards
  - Progress saved to localStorage
  - Visual progress indicators per category

- **Kid-Friendly Design**
  - Large, colorful buttons
  - Fun animations and effects
  - Responsive for tablets and phones
  - Native emoji graphics for fast loading

## Screenshots

| Home Screen | Flash Card | Quiz Mode |
|-------------|------------|-----------|
| Category selection with progress | Interactive flip cards | Fun multiple choice quizzes |

## Tech Stack

- **React 19** - UI framework
- **Vite** - Build tool & dev server
- **CSS3** - Animations, glassmorphism, responsive design
- **Web Speech API** - Text-to-speech pronunciation
- **localStorage** - Progress persistence

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/rafiqdeen/kids-flashcards.git
   cd kids-flashcards
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and visit:
   ```
   http://localhost:5173
   ```

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` folder.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
kids-flashcards/
├── src/
│   ├── components/
│   │   ├── CardDeck.jsx          # Card navigation & display
│   │   ├── CardDeck.css
│   │   ├── CategorySelector.jsx  # Home screen category grid
│   │   ├── CategorySelector.css
│   │   ├── FlashCard.jsx         # Individual flip card
│   │   ├── FlashCard.css
│   │   ├── ProgressBar.jsx       # Progress indicator
│   │   ├── ProgressBar.css
│   │   ├── QuizMode.jsx          # Quiz functionality
│   │   └── QuizMode.css
│   ├── data/
│   │   ├── alphabet.js           # A-Z data
│   │   ├── numbers.js            # 1-10 data
│   │   ├── animals.js            # 46 animals
│   │   ├── fruits.js             # 18 fruits
│   │   ├── vegetables.js         # 18 vegetables
│   │   ├── birds.js              # 17 birds
│   │   ├── colorsShapes.js       # Colors & shapes
│   │   ├── vehicles.js           # 21 vehicles
│   │   ├── bodyParts.js          # 18 body parts
│   │   ├── weather.js            # 22 weather types
│   │   └── emotions.js           # 25 emotions
│   ├── hooks/
│   │   ├── useProgress.js        # Progress tracking logic
│   │   ├── useSound.js           # Sound effects
│   │   └── useSpeech.js          # Text-to-speech
│   ├── App.jsx                   # Main app component
│   ├── App.css                   # App styles
│   ├── index.css                 # Global styles & variables
│   └── main.jsx                  # Entry point
├── index.html
├── package.json
└── vite.config.js
```

## How to Use

1. **Select a Category** - Tap on any category card from the home screen
2. **Learn with Flash Cards** - Tap cards to flip and see the answer
3. **Listen to Pronunciation** - Tap the speaker button to hear the word
4. **Track Progress** - Cards you've seen and mastered are tracked automatically
5. **Take a Quiz** - Test your knowledge with the quiz mode
6. **Navigate** - Use arrow buttons to move between cards

## Customization

### Adding New Cards

Edit the data files in `src/data/` to add new cards. Each card follows this structure:

```javascript
{
  id: 'unique_id',
  name: 'Display Name',
  emoji: '🎯',           // Native emoji
  hint: 'A helpful hint',
  // ... category-specific fields
}
```

### Changing Colors

Edit CSS variables in `src/index.css`:

```css
:root {
  --primary: #6366f1;
  --secondary: #ec4899;
  --success: #22c55e;
  /* ... more variables */
}
```

## Browser Support

- Chrome (recommended)
- Safari
- Firefox
- Edge

Text-to-speech works best on Chrome and Safari.

## Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Native emoji graphics for universal compatibility
- Inspired by the joy of teaching children
- Built with React and modern web technologies

---

Made with love for curious little minds
