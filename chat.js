// ============================================================
// Chat Simulator — mimics TikTok Live chat panel
// ============================================================

const DEMO_NAMES = [
  'TikFan99', 'luca_arena', 'marco_live', 'sofia88', 'king_viewer',
  'arena_lover', 'gladio_fan', 'colosseo_tv', 'roma_vita', 'battaglia_pro',
  'nonna_tik', 'il_campione', 'viva_arena', 'forte_forte', 'dragon_kick',
];

const DEMO_MESSAGES = [
  'FORZA!! 💪',
  'JOIN per me!',
  'andiamo andiamo!!',
  'SUPER KO!!!',
  'che bello questo gioco',
  'RAGE MODE attivato!',
  'bella mossa!!',
  'GO GO GO 🔥',
  'JOIN!',
  'chi vince??',
  'bravissimo!!',
  '😱😱😱',
  'incredibile!!',
  'più forte!!',
  'KING OF BATTLE!!!',
];

export class ChatSimulator {
  constructor(overlay, engine) {
    this.overlay = overlay;
    this.engine  = engine;
    this.panel   = null;
    this.messages = [];
    this.autoTimer = null;
    this.autoJoinTimer = null;
  }

  init() {
    this.buildPanel();
    this.startAutoMessages();
    this.startAutoJoins();
  }

  buildPanel() {
    const panel = document.createElement('div');
    panel.id = 'chat-panel';
    this.overlay.appendChild(panel);
    this.panel = panel;
  }

  addMessage(user, text, color = '#fbbf24') {
    if (!this.panel) return;

    const msg = document.createElement('div');
    msg.className = 'chat-msg';
    msg.style.borderLeftColor = color;
    msg.innerHTML = `<span style="color:${color};font-weight:900">${user}:</span> ${text}`;
    this.panel.appendChild(msg);

    // Keep only last 8
    while (this.panel.children.length > 8) {
      this.panel.removeChild(this.panel.firstChild);
    }

    // Auto scroll
    this.panel.scrollTop = this.panel.scrollHeight;
  }

  startAutoMessages() {
    const send = () => {
      const delay = 2000 + Math.random() * 3000;
      setTimeout(() => {
        const name = DEMO_NAMES[Math.floor(Math.random() * DEMO_NAMES.length)];
        const msg  = DEMO_MESSAGES[Math.floor(Math.random() * DEMO_MESSAGES.length)];
        const color = `hsl(${Math.floor(Math.random() * 360)}, 70%, 65%)`;
        this.addMessage(name, msg, color);
        send();
      }, delay);
    };
    setTimeout(send, 3000);
  }

  startAutoJoins() {
    // Auto-add gladiators periodically to keep action going
    const tryJoin = () => {
      const delay = 8000 + Math.random() * 12000;
      setTimeout(() => {
        const allCombatants = [...this.engine.current, ...this.engine.queue];
        // Only add if total combatants < 8 and game is not in victory
        if (allCombatants.length < 8 && this.engine.state !== 'victory') {
          const name = DEMO_NAMES[Math.floor(Math.random() * DEMO_NAMES.length)];
          const donated = Math.random() > 0.4;
          this.addMessage(name, `JOIN! ${donated ? '💎 (donazione)' : ''}`, donated ? '#ffd700' : '#60a5fa');
          this.engine.addGladiator(name, donated);
        }
        tryJoin();
      }, delay);
    };
    setTimeout(tryJoin, 5000);
  }
}
