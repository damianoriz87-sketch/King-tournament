import { GameEngine } from './engine.js';
import { UIManager } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  const overlay = document.getElementById('ui-overlay');

  const engine = new GameEngine(canvas);
  const ui = new UIManager(overlay, engine);

  engine.setUI(ui);

  engine.init();
  ui.init();

  // Live-refresh HP bars every frame
  (function tick() {
    ui.refreshFighterPanels();
    ui.refreshActionBar();
    requestAnimationFrame(tick);
  })();

  // Global resize handler
  function resize() {
    const root = document.getElementById('game-root');
    const ww = window.innerWidth;
    const wh = window.innerHeight;
    const aspect = 450 / 800;
    let w = ww, h = ww / aspect;
    if (h > wh) { h = wh; w = h * aspect; }
    root.style.width = w + 'px';
    root.style.height = h + 'px';
  }
  window.addEventListener('resize', resize);
  resize();
});
