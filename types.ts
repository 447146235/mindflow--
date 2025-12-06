export enum GameMode {
  MENU = 'MENU',
  BUBBLE_POP = 'BUBBLE_POP',
  BREATH_FOCUS = 'BREATH_FOCUS',
  ZEN_SAND = 'ZEN_SAND',
  COSMIC_FLOW = 'COSMIC_FLOW',
  VENT_BOX = 'VENT_BOX'
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}