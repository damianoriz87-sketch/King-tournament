// ============================================================
// UI Manager — Gothic style: fighter panels, queue, action grid
// ============================================================

export class UIManager {
  constructor(overlay, engine) {
    this.overlay   = overlay;
    this.engine    = engine;
    this.victoryEl = null;
    this.topHud    = null;
    this.queueRow  = null;
    this.actionBar = null;
    this.joinPanel = null;
  }

  init() {
    this.buildTopHUD();
    this.buildQueueRow();
    this.buildActionBar();
    this.buildJoinPanel();
    this.showStartModal();
  }

  // ── TOP HUD: two fighter panels + VS ─────────────────────
  buildTopHUD() {
    const hud = document.createElement('div');
    hud.id = 'top-hud';
    hud.innerHTML = `
      <div class="fighter-panel left" id="fp-left">
        <div class="fighter-name-row">
          <div class="fighter-portrait" id="fp-left-portrait">?</div>
          <div>
            <div class="fighter-name" id="fp-left-name">—</div>
            <div class="fighter-wins" id="fp-left-wins"></div>
          </div>
        </div>
        <div class="hp-label"><span>HP</span><span id="fp-left-hp-val">—</span></div>
        <div class="hp-track">
          <div class="hp-fill" id="fp-left-hp" style="width:100%;background:#22c55e;"></div>
        </div>
        <div class="hp-label" style="margin-top:1px;"><span style="color:#fbbf24;font-size:7px;">⚡ ENERGIA</span><span id="fp-left-en-val">0%</span></div>
        <div class="energy-track">
          <div class="energy-fill" id="fp-left-energy" style="width:0%;"></div>
        </div>
        <div class="status-row" id="fp-left-status"></div>
      </div>

      <div id="vs-badge">
        <div class="vs-inner" id="vs-text">VS</div>
        <div class="round-tag" id="round-tag">ROUND 1</div>
      </div>

      <div class="fighter-panel right" id="fp-right">
        <div class="fighter-name-row">
          <div class="fighter-portrait" id="fp-right-portrait">?</div>
          <div>
            <div class="fighter-name" id="fp-right-name">—</div>
            <div class="fighter-wins" id="fp-right-wins"></div>
          </div>
        </div>
        <div class="hp-label"><span>HP</span><span id="fp-right-hp-val">—</span></div>
        <div class="hp-track">
          <div class="hp-fill" id="fp-right-hp" style="width:100%;background:#22c55e;"></div>
        </div>
        <div class="hp-label" style="margin-top:1px;"><span style="color:#fbbf24;font-size:7px;">⚡ ENERGIA</span><span id="fp-right-en-val">0%</span></div>
        <div class="energy-track">
          <div class="energy-fill" id="fp-right-energy" style="width:0%;"></div>
        </div>
        <div class="status-row" id="fp-right-status"></div>
      </div>
    `;
    this.overlay.appendChild(hud);
    this.topHud = hud;
  }

  // ── QUEUE ROW ─────────────────────────────────────────────
  buildQueueRow() {
    const row = document.createElement('div');
    row.id = 'queue-row';
    row.innerHTML = `
      <div class="queue-label">⏳ IN ATTESA</div>
      <div class="queue-capsules" id="queue-capsules"></div>
    `;
    this.overlay.appendChild(row);
    this.queueRow = row;
  }

  // ── ACTION BAR: 5×2 grid ─────────────────────────────────
  buildActionBar() {
    const bar = document.createElement('div');
    bar.id = 'action-bar';
    // Row 1: utility/basic moves
    // Row 2: special/powered moves
    bar.innerHTML = `
      <!-- Row 1 -->
      <button class="action-btn btn-join" data-action="join-btn-action">
        <span class="btn-icon">⚔️</span>
        <span class="btn-label">SALIR<br>1RO</span>
      </button>
      <button class="action-btn btn-hp" data-action="energy">
        <span class="btn-icon">🌹</span>
        <span class="btn-label">+25<br>HP</span>
      </button>
      <button class="action-btn btn-sword" data-action="superko">
        <span class="btn-icon">🗡️</span>
        <span class="btn-label">SWORD/<br>ESPADA</span>
      </button>
      <button class="action-btn btn-power" data-action="shield">
        <span class="btn-icon">💪</span>
        <span class="btn-label">+<br>POWER</span>
      </button>
      <button class="action-btn btn-allsum" data-action="rage">
        <span class="btn-icon">✨</span>
        <span class="btn-label">GG<br>SUMA</span>
      </button>

      <!-- Row 2 -->
      <button class="action-btn btn-sayan" data-action="ssj">
        <span class="btn-icon">🔥</span>
        <span class="btn-label">SAYAN/<br>AURA</span>
      </button>
      <button class="action-btn btn-ssj-god" data-action="ssj-god">
        <span class="btn-icon">💢</span>
        <span class="btn-label">SUPER<br>SAYAN GOD</span>
      </button>
      <button class="action-btn btn-ssj-blue" data-action="ssj-blue">
        <span class="btn-icon">💎</span>
        <span class="btn-label">S.SAYAN<br>GOD BLUE</span>
      </button>
      <button class="action-btn btn-kaioken" data-action="kaioken">
        <span class="btn-icon">🌊</span>
        <span class="btn-label">SSB<br>KAIOKEN</span>
      </button>
      <button class="action-btn btn-ultra" data-action="ultra">
        <span class="btn-icon">⭐</span>
        <span class="btn-label">ULTRA<br>INSTINCT</span>
      </button>
    `;
    this.overlay.appendChild(bar);
    this.actionBar = bar;

    bar.querySelectorAll('.action-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        if (action === 'join-btn-action') {
          // Scroll to join input or focus it
          const inp = document.getElementById('join-input');
          if (inp) inp.focus();
          return;
        }
        const player = this.engine.current.find(g => g.donated && g.alive);
        if (!player || this.engine.state !== 'fighting') return;
        if (btn.classList.contains('locked')) return;
        this.engine.playerAction(action);
        this.animateBtn(btn);
      });
    });

    bar.addEventListener('touchend', e => e.preventDefault(), { passive: false });
  }

  // ── JOIN PANEL ────────────────────────────────────────────
  buildJoinPanel() {
    const panel = document.createElement('div');
    panel.id = 'join-panel';
    panel.innerHTML = `
      <input id="join-input" type="text" maxlength="12"
             placeholder="Scrivi il tuo nome..." autocomplete="off" />
      <button id="join-btn">JOIN ⚔️</button>
    `;
    this.overlay.appendChild(panel);
    this.joinPanel = panel;

    const btn = panel.querySelector('#join-btn');
    const inp = panel.querySelector('#join-input');
    btn.addEventListener('click', () => this.doJoin(inp));
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') this.doJoin(inp); });
  }

  doJoin(inp) {
    const name = inp.value.trim();
    const donated = Math.random() > 0.35; // 65% donated for demo
    const ok = this.engine.addGladiator(name || ('Warrior' + (Date.now() % 100)), donated);
    if (ok !== false) { inp.value = ''; inp.blur(); }
  }

  animateBtn(btn) {
    btn.style.transform = 'scale(0.85)';
    btn.style.filter = 'brightness(1.4)';
    setTimeout(() => { btn.style.transform = ''; btn.style.filter = ''; }, 130);
  }

  // ── REFRESH: update all HUD elements ─────────────────────
  refresh() {
    this.refreshFighterPanels();
    this.refreshQueueRow();
    this.refreshActionBar();
  }

  refreshFighterPanels() {
    const [left, right] = this.engine.current;
    this.updatePanel('left', left);
    this.updatePanel('right', right);

    // VS / state text
    const vsEl = document.getElementById('vs-text');
    const roundEl = document.getElementById('round-tag');
    if (vsEl) {
      if (this.engine.state === 'fighting') vsEl.textContent = 'VS';
      else if (this.engine.state === 'lobby') vsEl.textContent = '⚔️';
      else vsEl.textContent = '🏆';
    }
    if (roundEl) roundEl.textContent = `ROUND ${this.engine.roundNum}`;
  }

  updatePanel(side, gladiator) {
    const portrait  = document.getElementById(`fp-${side}-portrait`);
    const nameEl    = document.getElementById(`fp-${side}-name`);
    const winsEl    = document.getElementById(`fp-${side}-wins`);
    const hpFill    = document.getElementById(`fp-${side}-hp`);
    const hpVal     = document.getElementById(`fp-${side}-hp-val`);
    const enFill    = document.getElementById(`fp-${side}-energy`);
    const enVal     = document.getElementById(`fp-${side}-en-val`);
    const statusRow = document.getElementById(`fp-${side}-status`);
    if (!portrait) return;

    if (!gladiator) {
      portrait.textContent = '?';
      portrait.style.background = '#1a0a2e';
      portrait.style.borderColor = 'rgba(150,60,255,0.4)';
      if (nameEl) nameEl.textContent = '—';
      if (winsEl) winsEl.textContent = '';
      if (hpFill) { hpFill.style.width = '0%'; hpFill.style.background = '#333'; }
      if (hpVal) hpVal.textContent = '—';
      if (enFill) enFill.style.width = '0%';
      if (enVal) enVal.textContent = '0%';
      if (statusRow) statusRow.innerHTML = '';
      return;
    }

    const g = gladiator;
    const pct = Math.max(0, g.hp / g.maxHp);
    const hpColor = pct > 0.5 ? '#22c55e' : pct > 0.25 ? '#f59e0b' : '#ef4444';

    portrait.textContent = g.avatar;
    portrait.style.background = g.colors.glow + '55';
    portrait.style.borderColor = g.colors.accent;
    portrait.style.boxShadow = `0 0 8px ${g.colors.glow}66`;

    if (nameEl) {
      nameEl.textContent = g.name;
      nameEl.style.color = g.colors.accent;
    }
    if (winsEl) {
      winsEl.textContent = g.wins > 0 ? ('★'.repeat(Math.min(g.wins, 5))) : '';
      winsEl.style.color = '#fbbf24';
      if (g.donated) winsEl.textContent = (g.wins > 0 ? ('★'.repeat(Math.min(g.wins, 5)) + ' ') : '') + '👑';
    }
    if (hpFill) {
      hpFill.style.width = (pct * 100) + '%';
      hpFill.style.background = hpColor;
      hpFill.style.boxShadow = `0 0 6px ${hpColor}88`;
    }
    if (hpVal) {
      hpVal.textContent = Math.ceil(g.hp) + 'HP';
      hpVal.style.color = hpColor;
    }
    if (enFill) enFill.style.width = g.energy.toFixed(0) + '%';
    if (enVal)  enVal.textContent  = g.energy.toFixed(0) + '%';

    // Status icons
    if (statusRow) {
      statusRow.innerHTML = '';
      if (g.blocking)        statusRow.innerHTML += `<span class="status-icon" style="color:#38bdf8;">🛡️</span>`;
      if (g.rageModeTimer > 0) statusRow.innerHTML += `<span class="status-icon" style="color:#ef4444;">🔥</span>`;
      if (g.superFlash > 0)  statusRow.innerHTML += `<span class="status-icon" style="color:#ffd700;">⚡</span>`;
      if (!g.alive)          statusRow.innerHTML += `<span class="status-icon" style="color:#666;">💀 KO</span>`;
    }
  }

  refreshQueueRow() {
    const capsules = document.getElementById('queue-capsules');
    if (!capsules) return;
    capsules.innerHTML = '';

    const q = this.engine.queue.slice(0, 6);
    if (q.length === 0) {
      capsules.innerHTML = '<div style="color:rgba(150,100,200,0.4);font-size:8px;letter-spacing:1px;padding:8px;">Nessuno in coda</div>';
      return;
    }

    q.forEach(g => {
      const cap = document.createElement('div');
      cap.className = 'queue-capsule' + (g.donated ? '' : ' locked');
      cap.style.borderColor = g.colors.cape + 'aa';
      cap.style.boxShadow = `0 0 10px ${g.colors.glow}33`;
      cap.innerHTML = `
        <div class="queue-avatar" style="background:${g.colors.glow}44;border-color:${g.colors.accent};">${g.avatar}</div>
        <div class="queue-name" style="color:${g.colors.accent};">${g.name.substring(0, 6)}</div>
      `;
      if (!g.donated) {
        const lock = document.createElement('div');
        lock.style.cssText = 'position:absolute;top:0;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;font-size:18px;background:rgba(0,0,0,0.65);border-radius:10px;';
        lock.textContent = '🔒';
        cap.appendChild(lock);
      }
      capsules.appendChild(cap);
    });

    if (this.engine.queue.length > 6) {
      const more = document.createElement('div');
      more.style.cssText = 'font-size:8px;color:rgba(200,150,255,0.6);align-self:center;padding:4px;';
      more.textContent = `+${this.engine.queue.length - 6}`;
      capsules.appendChild(more);
    }
  }

  refreshActionBar() {
    if (!this.actionBar) return;
    const player = this.engine.current.find(g => g.donated && g.alive);
    const inFight = this.engine.state === 'fighting';

    const costs = { energy: 30, superko: 80, shield: 20, rage: 50, ssj: 60, 'ssj-god': 70, 'ssj-blue': 85, kaioken: 90, ultra: 100 };

    this.actionBar.querySelectorAll('.action-btn').forEach(btn => {
      const action = btn.dataset.action;
      if (action === 'join-btn-action') return; // always available

      if (!player || !inFight) {
        btn.classList.add('locked');
        return;
      }

      const cost = costs[action] || 0;
      const canUse = player.energy >= cost;
      btn.classList.toggle('locked', !canUse);
    });
  }

  // ── FIGHT FLASH ───────────────────────────────────────────
  showFightFlash() {
    const flash = document.createElement('div');
    flash.className = 'fight-flash';
    flash.textContent = '⚔️ FIGHT!';
    this.overlay.appendChild(flash);
    setTimeout(() => flash.remove(), 900);
  }

  // ── VICTORY MODAL ─────────────────────────────────────────
  showVictory(winner) {
    this.hideVictory();
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'victory-modal';
    modal.style.background = 'rgba(0,0,0,0.75)';

    const winsStr = winner.wins > 0 ? ('★'.repeat(Math.min(winner.wins, 5))) : '';
    const donatedTag = winner.donated ? '<br>👑 <span style="color:#fbbf24;">Campione Donatore!</span>' : '';

    modal.innerHTML = `
      <div class="modal-box victory-anim"
           style="border-color:${winner.colors.cape};box-shadow:0 0 60px ${winner.colors.glow}55,0 0 120px ${winner.colors.glow}22;">
        <div style="font-size:48px;margin-bottom:6px;">🏆</div>
        <div class="modal-title" style="color:${winner.colors.accent};">VITTORIA!</div>
        <div style="font-size:20px;color:#fff;font-weight:900;margin:8px 0;letter-spacing:1px;
                    text-shadow:0 0 15px ${winner.colors.glow};">
          ${winner.avatar} ${winner.name}
        </div>
        <div style="font-size:13px;color:rgba(200,180,230,0.85);margin-bottom:8px;line-height:1.7;">
          ${winsStr ? `Vittorie: <span style="color:#fbbf24;">${winsStr}</span>` : ''}
          ${donatedTag}
        </div>
        <div style="font-size:10px;color:rgba(150,100,200,0.7);margin-bottom:12px;letter-spacing:1px;">
          PROSSIMO SFIDANTE IN ARRIVO...
        </div>
        <div style="height:4px;background:rgba(50,20,80,0.6);border-radius:2px;overflow:hidden;border:1px solid rgba(150,60,255,0.3);">
          <div id="v-progress" style="height:100%;background:linear-gradient(90deg,${winner.colors.glow},${winner.colors.accent});width:0%;transition:width 4.8s linear;"></div>
        </div>
      </div>
    `;
    this.overlay.appendChild(modal);
    this.victoryEl = modal;

    requestAnimationFrame(() => {
      const bar = modal.querySelector('#v-progress');
      if (bar) bar.style.width = '100%';
    });
  }

  hideVictory() {
    if (this.victoryEl) { this.victoryEl.remove(); this.victoryEl = null; }
    document.getElementById('victory-modal')?.remove();
  }

  // ── START MODAL ───────────────────────────────────────────
  showStartModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'start-modal';
    modal.innerHTML = `
      <div class="modal-box">
        <div style="font-size:52px;margin-bottom:8px;">💀</div>
        <div class="modal-title">KING OF BATTLE</div>
        <div style="font-size:13px;color:#e879f9;margin-bottom:10px;letter-spacing:3px;text-shadow:0 0 10px rgba(232,121,249,0.6);">
          COLOSSEO ARENA
        </div>
        <div class="modal-sub">
          Scrivi il tuo nome e premi <strong style="color:#c084fc;">JOIN</strong> per entrare come gladiatore!<br>
          <span style="color:#fbbf24;">Chi dona</span> sblocca le mosse speciali 👑<br><br>
          🏆 Vince l'ultimo gladiatore in piedi<br>
          ⭐ Il campione affronta il prossimo sfidante
        </div>
        <button class="modal-btn" id="start-btn">⚔️ ENTRA NELL'ARENA!</button>
      </div>
    `;
    this.overlay.appendChild(modal);

    modal.querySelector('#start-btn').addEventListener('click', () => {
      modal.remove();
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        ctx.resume();
      } catch(e) {}
      this.refresh();
    });
  }
}
