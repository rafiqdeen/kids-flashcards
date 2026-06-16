// registry.jsx — the static game registry (replaces window.ADV_GAMES) + the
// per-zone curation and hub metadata. Exports only data objects, so no
// component-export lint concerns. Labels/descs for train/shadow/pipsays/calm
// come from HUB_META (the prototype registered those four with no label).
import { BubblePop, MemoryMatch, Tracing, ColorSort } from './set1.jsx';
import { CountingTrain, ShadowPuzzle, PipSays, CalmCorner } from './set2.jsx';
import { PeekABoo, MagicCube, JigsawPuzzle, EggSurprise } from './set3.jsx';
import { MysteryBoxes, PrizeWheel, MagicDoors, UnfoldCube } from './set4.jsx';
import { BlockStacker, TunnelRunner, CardFountain, BalloonFloat } from './set5.jsx';

export const ADV_GAMES = {
  bubble: { C: BubblePop, label: 'Bubble Pop', icon: 'sound', desc: 'Pop the right bubble!' },
  memory: { C: MemoryMatch, label: 'Memory Match', icon: 'star', desc: 'Find the pairs' },
  trace: { C: Tracing, label: 'Tracing', icon: 'brush', desc: 'Draw the shape' },
  sort: { C: ColorSort, label: 'Feed the Monsters', icon: 'palette', desc: 'Sort by color' },
  train: { C: CountingTrain },
  shadow: { C: ShadowPuzzle },
  pipsays: { C: PipSays },
  calm: { C: CalmCorner },
  peek: { C: PeekABoo, label: 'Peek-a-Boo', desc: "Who's hiding?" },
  cube: { C: MagicCube, label: 'Magic Cube', desc: 'Spin the 3D cube!' },
  jigsaw: { C: JigsawPuzzle, label: 'Picture Pieces', desc: 'Build the puzzle' },
  egg: { C: EggSurprise, label: 'Egg Surprise', desc: 'Crack & hatch!' },
  boxes: { C: MysteryBoxes, label: 'Mystery Boxes', desc: 'Follow the box!' },
  wheel: { C: PrizeWheel, label: 'Prize Wheel', desc: 'Swipe & spin (3D!)' },
  doors: { C: MagicDoors, label: 'Magic Doors', desc: 'Knock knock!' },
  unfold: { C: UnfoldCube, label: 'Magic Paper', desc: 'Unfold & guess' },
  stack: { C: BlockStacker, label: 'Block Stacker', desc: 'Build & count!' },
  tunnel: { C: TunnelRunner, label: 'Tunnel Runner', desc: 'Tap the flyers!' },
  fountain: { C: CardFountain, label: 'Card Fountain', desc: 'Dancing cards (3D!)' },
  balloon: { C: BalloonFloat, label: 'Balloon Float', desc: 'Pop pop pop!' },
};

// Curated per zone — every land features its signature games; Paint + Calm are
// "anytime" activities.
export const ZONE_GAMES = {
  animals: ['shadow', 'pipsays', 'peek', 'jigsaw', 'boxes', 'doors'],
  alphabet: ['trace', 'bubble', 'memory', 'cube', 'unfold', 'fountain'],
  numbers: ['train', 'memory', 'cube', 'stack', 'wheel'],
  fruits: ['bubble', 'egg', 'jigsaw', 'balloon', 'tunnel'],
  shapes: ['trace', 'shadow', 'cube', 'jigsaw', 'unfold', 'stack'],
  colors: ['sort', 'bubble', 'peek', 'egg', 'balloon', 'wheel'],
  vegetables: ['sort', 'memory', 'shadow', 'egg', 'tunnel'],
  birds: ['peek', 'bubble', 'egg', 'fountain', 'doors'],
  vehicles: ['tunnel', 'memory', 'jigsaw', 'wheel', 'boxes'],
  body: ['pipsays', 'shadow', 'memory', 'trace', 'unfold'],
  weather: ['bubble', 'sort', 'jigsaw', 'balloon', 'unfold'],
  emotions: ['memory', 'shadow', 'pipsays', 'doors', 'unfold'],
  ocean: ['bubble', 'shadow', 'jigsaw', 'peek', 'fountain'],
  dinos: ['egg', 'peek', 'jigsaw', 'boxes', 'stack'],
  space: ['cube', 'balloon', 'tunnel', 'stack', 'unfold'],
  music: ['pipsays', 'memory', 'wheel', 'fountain', 'doors'],
  clothes: ['sort', 'memory', 'shadow', 'boxes', 'wheel'],
  home: ['doors', 'boxes', 'memory', 'shadow', 'peek'],
  foods: ['sort', 'egg', 'bubble', 'jigsaw', 'tunnel'],
  helpers: ['memory', 'shadow', 'doors', 'unfold', 'wheel'],
};
export const ANYTIME = ['paint', 'calm'];

export const HUB_META = {
  train: { label: 'Counting Train', desc: 'All aboard!' },
  shadow: { label: 'Shadow Puzzle', desc: 'Who fits?' },
  pipsays: { label: 'Pip Says', desc: 'Listen & repeat' },
  calm: { label: 'Calm Corner', desc: 'Breathe & relax' },
  paint: { label: 'Paint Studio', desc: 'Make art!' },
};
export const HUB_COLORS = { bubble: '#1cb0f6', memory: '#a560e8', trace: '#58cc02', sort: '#ff9600', train: '#ff4b4b', shadow: '#14b8a6', pipsays: '#ec4899', calm: '#5c6bc0', paint: '#f5a623', peek: '#ff7043', cube: '#3d5afe', jigsaw: '#00acc1', egg: '#ab47bc', boxes: '#8d6e63', wheel: '#f06292', doors: '#7e57c2', unfold: '#ffa726', stack: '#66bb6a', tunnel: '#26c6da', fountain: '#9575cd', balloon: '#ef5350' };
export const HUB_ICONS = { bubble: 'sound', memory: 'cards', trace: 'pencil', sort: 'palette', train: 'train', shadow: 'puzzle', pipsays: 'music', calm: 'heart', paint: 'brush', peek: 'eye', cube: 'cube', jigsaw: 'puzzle', egg: 'egg', boxes: 'box', wheel: 'target', doors: 'door', unfold: 'paper', stack: 'layers', tunnel: 'tunnel', fountain: 'drop', balloon: 'balloon' };
