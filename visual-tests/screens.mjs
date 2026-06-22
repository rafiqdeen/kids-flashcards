// screens.mjs — the screen catalogue + how to drive a page into each state.
// The reference (Pip Cards Adventure.html) and the impl have identical
// data-testid / data-screen-label hooks, so the SAME prep() drives both.
//
// Each screen: { name, label?, prep(page) }
//   - label: data-screen-label to wait for after prep (sanity gate)
//   - prep: async (page) => navigate from a freshly-loaded page into the state
//
// Profiles/progress are seeded directly into localStorage (then reload), so we
// avoid long multi-step flows and keep RNG consumption identical between ref
// and impl.

const PROFILE = { id: 'p1', name: 'Sam', buddy: 'pip', age: 'middle' };
const ALL_CATS = ['alphabet', 'numbers', 'animals', 'fruits', 'vegetables', 'birds', 'colors', 'shapes',
  'vehicles', 'body', 'weather', 'emotions', 'ocean', 'dinos', 'space', 'music', 'clothes', 'home', 'foods', 'helpers'];

async function seed(page, { progress } = {}) {
  await page.evaluate(({ profile, progress }) => {
    localStorage.clear();
    localStorage.setItem('pip-profiles', JSON.stringify([profile]));
    localStorage.setItem('pip-active', profile.id);
    if (progress) localStorage.setItem('pip-adv-prog-' + profile.id, JSON.stringify(progress));
  }, { profile: PROFILE, progress });
  await page.reload({ waitUntil: 'networkidle' });
}

// every zone unlocked + every node reachable (learn+quiz cleared everywhere)
async function seedAll(page) {
  const prog = {};
  ALL_CATS.forEach((c) => { prog[c] = { learnStars: 3, quizStars: 3 }; });
  await seed(page, { progress: prog });
}

const waitLabel = (page, label) => page.waitForSelector(`[data-screen-label="${label}"]`, { timeout: 20000 });

// read the parental-gate sum from the DOM and tap it in (works for the settings
// gate and the profile gate; deterministic under seeded RNG but read anyway).
async function solveGate(page) {
  const sum = await page.$eval('.gate2-q', (el) => { const m = el.textContent.match(/(\d+)\s*\+\s*(\d+)/); return String(+m[1] + +m[2]); });
  for (const ch of sum) {
    await page.evaluate((d) => { const b = [...document.querySelectorAll('.gate2-key')].find((k) => k.textContent.trim() === d); if (b) b.click(); }, ch);
  }
}

async function openSettings(page) {
  await seed(page);
  await page.$eval('[data-testid="open-settings"]', (el) => el.click());
  await page.waitForSelector('[data-testid="settings-gate"]');
  await solveGate(page);
  await page.waitForSelector('[data-testid="settings-tab-buddy"]');
}

const settingsTab = (tab) => async (page) => { await openSettings(page); await page.click(`[data-testid="settings-tab-${tab}"]`); await page.waitForTimeout(250); };

// open a specific game from the top-level Playground (every game lives there now;
// `cat` is retained only to label the capture). No gate needed — synchronous nav.
const openGame = (cat, id, label) => async (page) => {
  await seedAll(page);
  await page.click('[data-testid="open-play"]');
  await page.waitForSelector('[data-testid="activity-hub"]');
  await page.click(`[data-testid="activity-${id}"]`);
  await waitLabel(page, label);
  await page.waitForTimeout(350);
};

// id -> [zone-cat, data-screen-label] (zone chosen from ZONE_GAMES / ANYTIME)
const GAMES = [
  ['shadow', 'animals', 'Shadow Puzzle'], ['pipsays', 'animals', 'Pip Says'], ['peek', 'animals', 'Peek-a-Boo'],
  ['jigsaw', 'animals', 'Picture Pieces'], ['boxes', 'animals', 'Mystery Boxes'], ['doors', 'animals', 'Magic Doors'],
  ['calm', 'animals', 'Calm Corner'],
  ['trace', 'alphabet', 'Tracing'], ['bubble', 'alphabet', 'Bubble Pop'], ['memory', 'alphabet', 'Memory Match'],
  ['cube', 'alphabet', 'Magic Cube'], ['unfold', 'alphabet', 'Unfold the Cube'], ['fountain', 'alphabet', 'Card Fountain'],
  ['train', 'numbers', 'Counting Train'], ['stack', 'numbers', 'Block Stacker'], ['wheel', 'numbers', 'Prize Wheel'],
  ['egg', 'fruits', 'Egg Surprise'], ['balloon', 'fruits', 'Balloon Float'], ['tunnel', 'fruits', 'Tunnel Runner'],
  ['sort', 'colors', 'Color Sort'],
];
const gameScreens = GAMES.map(([id, cat, label]) => ({ name: `game-${id}`, label, prep: openGame(cat, id, label) }));

export const SCREENS = [
  // ---- first-run / profiles ----
  { name: 'welcome', label: 'Welcome', prep: async () => {} },
  {
    name: 'welcome-scene', label: 'Welcome',
    prep: async (page) => { await page.evaluate(() => localStorage.setItem('pip-welcome-variant', 'scene')); await page.reload({ waitUntil: 'networkidle' }); },
  },
  { name: 'create', label: 'Create profile', prep: async (page) => { await page.click('[data-testid="welcome-start"]'); } },
  {
    name: 'picker', label: "Who's playing",
    prep: async (page) => {
      await page.evaluate(() => {
        localStorage.clear();
        localStorage.setItem('pip-profiles', JSON.stringify([
          { id: 'p1', name: 'Sam', buddy: 'pip', age: 'middle' },
          { id: 'p2', name: 'Mia', buddy: 'owl', age: 'big' },
        ]));
      });
      await page.reload({ waitUntil: 'networkidle' });
    },
  },
  {
    name: 'parent-gate',
    prep: async (page) => {
      await page.evaluate(() => {
        localStorage.clear();
        localStorage.setItem('pip-profiles', JSON.stringify([
          { id: 'p1', name: 'Sam', buddy: 'pip', age: 'middle' },
          { id: 'p2', name: 'Mia', buddy: 'owl', age: 'big' },
        ]));
      });
      await page.reload({ waitUntil: 'networkidle' });
      await page.click('[data-testid="pick-add"]');
      await page.waitForSelector('[data-testid="profile-gate"]');
      await page.waitForTimeout(250);
    },
  },

  // ---- world map ----
  { name: 'world', label: 'World map', prep: async (page) => { await seed(page); } },

  // ---- core levels ----
  { name: 'learn', label: 'Learn: Animals', prep: async (page) => { await seed(page); await page.click('[data-testid="node-animals-learn"]'); } },
  {
    name: 'learn-back', label: 'Learn: Animals',
    prep: async (page) => { await seed(page); await page.click('[data-testid="node-animals-learn"]'); await page.click('[data-testid="flashcard"]'); await page.waitForTimeout(900); },
  },
  {
    name: 'quiz', label: 'Quiz: Animals',
    prep: async (page) => { await seed(page, { progress: { animals: { learnStars: 3 } } }); await page.click('[data-testid="node-animals-quiz"]'); await page.waitForTimeout(700); },
  },
  {
    name: 'chest', label: 'Treasure: Animals',
    prep: async (page) => { await seed(page, { progress: { animals: { learnStars: 3, quizStars: 3 } } }); await page.click('[data-testid="node-animals-chest"]'); },
  },
  {
    name: 'complete', label: 'Treasure: Animals',
    prep: async (page) => {
      await seed(page, { progress: { animals: { learnStars: 3, quizStars: 3 } } });
      await page.click('[data-testid="node-animals-chest"]');
      await page.click('[data-testid="reward-chest"]');
      await page.waitForSelector('[data-testid="level-complete"]', { timeout: 8000 });
      await page.waitForTimeout(400);
    },
  },

  // ---- activity hub ----
  {
    name: 'activity-hub', label: 'Playground',
    prep: async (page) => { await seed(page); await page.click('[data-testid="open-play"]'); await page.waitForSelector('[data-testid="activity-hub"]'); await page.waitForTimeout(500); },
  },

  // ---- Paint Studio ----
  {
    name: 'paint', label: 'Paint studio',
    prep: async (page) => { await seed(page); await page.click('[data-testid="open-play"]'); await page.waitForSelector('[data-testid="activity-paint"]'); await page.click('[data-testid="activity-paint"]'); await page.waitForSelector('[data-screen-label="Paint studio"]'); await page.waitForTimeout(400); },
  },

  // ---- Story Land ----
  {
    name: 'story-shelf', label: 'Story Land',
    prep: async (page) => { await seed(page); await page.$eval('[data-testid="open-story"]', (el) => el.click()); await page.waitForSelector('[data-screen-label="Story Land"]'); await page.waitForTimeout(300); },
  },
  {
    name: 'story-book', label: 'Comic: Pip & the Lost Star',
    prep: async (page) => { await seed(page); await page.$eval('[data-testid="open-story"]', (el) => el.click()); await page.click('[data-testid="story-book"]'); await page.waitForSelector('[data-screen-label="Comic: Pip & the Lost Star"]'); await page.waitForTimeout(400); },
  },
  {
    name: 'story-choose',
    prep: async (page) => { await seed(page); await page.$eval('[data-testid="open-story"]', (el) => el.click()); await page.click('[data-testid="story-choose"]'); await page.waitForSelector('[data-screen-label^="Comic:"]'); await page.waitForTimeout(400); },
  },
  {
    name: 'story-quest',
    prep: async (page) => { await seed(page); await page.$eval('[data-testid="open-story"]', (el) => el.click()); await page.click('[data-testid="story-quest"]'); await page.waitForSelector('[data-screen-label^="Comic:"]'); await page.waitForTimeout(400); },
  },
  {
    name: 'story-comic',
    prep: async (page) => { await seed(page); await page.$eval('[data-testid="open-story"]', (el) => el.click()); await page.click('[data-testid="story-comic"]'); await page.waitForSelector('[data-screen-label^="Comic:"]'); await page.waitForTimeout(400); },
  },

  // ---- Settings: gate + all 5 tabs ----
  {
    name: 'settings-gate',
    prep: async (page) => { await seed(page); await page.$eval('[data-testid="open-settings"]', (el) => el.click()); await page.waitForSelector('[data-testid="settings-gate"]'); await page.waitForTimeout(250); },
  },
  { name: 'settings-buddy', prep: async (page) => { await openSettings(page); await page.waitForTimeout(250); } },
  { name: 'settings-sound', prep: settingsTab('sound') },
  { name: 'settings-play', prep: settingsTab('play') },
  { name: 'settings-activities', prep: settingsTab('activities') },
  { name: 'settings-progress', prep: settingsTab('progress') },

  // ---- profile manage sheet ----
  { name: 'profile-sheet', prep: async (page) => { await seed(page); await page.click('[data-testid="open-profiles"]'); await page.waitForTimeout(300); } },

  // ---- all 20 mini-games + calm ----
  ...gameScreens,
];

export { waitLabel };
