// ============================================================
// KING OF BATTLE - COLOSSEO ARENA  |  Orco + Samurai
// ============================================================

const BG_URL = 'https://vtelpopqybfytrgzkomj.supabase.co/storage/v1/object/public/game-assets/public/81f16574-7d00-4cf9-a407-260ca9a19dfe/7ddb04db-17da-44e0-90f1-4c0dd3b7c565/f6a50795-b0aa-4388-8fe6-ada5146dc16b.png';

export const COLORS = [
  { cape: '#c084fc', accent: '#e879f9', glow: '#9333ea', name: 'VIOLA', emoji: '💜' },
  { cape: '#f87171', accent: '#ff6b6b', glow: '#dc2626', name: 'ROSSO', emoji: '❤️' },
  { cape: '#60a5fa', accent: '#93c5fd', glow: '#2563eb', name: 'BLU', emoji: '💙' },
  { cape: '#4ade80', accent: '#86efac', glow: '#16a34a', name: 'VERDE', emoji: '💚' },
  { cape: '#fbbf24', accent: '#fde68a', glow: '#d97706', name: 'DORATO', emoji: '💛' },
  { cape: '#f472b6', accent: '#f9a8d4', glow: '#db2777', name: 'ROSA', emoji: '🩷' },
  { cape: '#22d3ee', accent: '#67e8f9', glow: '#0891b2', name: 'CYAN', emoji: '🩵' },
  { cape: '#fb923c', accent: '#fdba74', glow: '#ea580c', name: 'ARANCIO', emoji: '🧡' },
];

const MOVE_TYPES = ['punch', 'kick', 'uppercut', 'combo', 'sweep'];
const SPECIAL_MOVES = ['DRAGON FURY', 'THUNDER FIST', 'SHADOW SLASH', 'TORNADO KICK', 'IRON WILL', 'ULTRA INSTINCT'];
const AVATARS = ['💀', '🐉', '🦅', '🔥', '⚡', '🌙', '👁️', '🗡️'];

// ─── GLADIATOR ──────────────────────────────────────────────
export class Gladiator {
  constructor(name, colorIdx, side, character = 'orco') {
    this.name = name;
    this.colorIdx = colorIdx % COLORS.length;
    this.colors = COLORS[this.colorIdx];
    this.avatar = AVATARS[colorIdx % AVATARS.length];
    this.side = side;
    this.character = character; // 'orco' o 'samurai'
    this.hp = 100;
    this.maxHp = 100;
    this.alive = true;
    this.donated = false;
    this.energy = 0;
    this.wins = 0;
    this.x = side === 'left' ? 110 : 340;
    this.y = 480;
    this.facing = side === 'left' ? 1 : -1;
    this.anim = 'idle';
    this.animTimer = 0;
    this.shakeX = 0;
    this.shakeTimer = 0;
    this.blocking = false;
    this.blockTimer = 0;
    this.rageModeTimer = 0;
    this.superFlash = 0;
    this.hitFlash = 0;
    this.deathAnim = 0;
    this.attackCooldown = 0;
    this.tournamentSeed = Math.random();
    this.auraParticles = [];
    this.frameTime = 0;
    this.currentFrame = 0;
    this.isAttacking = false;
  }

  takeDamage(dmg) {
    if (this.blocking) dmg = Math.floor(dmg * 0.4);
    if (this.rageModeTimer > 0) dmg = Math.floor(dmg * 0.7);
    this.hp = Math.max(0, this.hp - dmg);
    this.hitFlash = 10;
    this.shakeX = 12;
    this.shakeTimer = 10;
    if (this.hp <= 0) {
      this.alive = false;
      this.anim = 'die';
      this.deathAnim = 70;
      this.currentFrame = 0;
    }
    return dmg;
  }

  update() {
    if (this.shakeTimer > 0) {
      this.shakeTimer--;
      this.shakeX = Math.sin(this.shakeTimer * 1.4) * (this.shakeTimer / 10) * 12;
    } else { this.shakeX = 0; }
    if (this.hitFlash > 0) this.hitFlash--;
    if (this.superFlash > 0) this.superFlash--;
    if (this.blockTimer > 0) { this.blockTimer--; this.blocking = this.blockTimer > 0; }
    if (this.rageModeTimer > 0) this.rageModeTimer--;
    if (this.attackCooldown > 0) this.attackCooldown--;
    if (this.alive) this.energy = Math.min(100, this.energy + 0.06);
    this.animTimer++;

    if (this.alive || this.anim === 'die') {
      this.frameTime++;
      let speed = 6;
      if (this.anim === 'die') speed = 8;
      if (this.anim === 'run') speed = 5;
      if (this.frameTime >= speed) {
        this.frameTime = 0;
        this.currentFrame++;
      }
    }

    if (this.rageModeTimer > 0 && Math.random() < 0.4) {
      this.auraParticles.push({
        x: (Math.random() - 0.5) * 30,
        y: (Math.random() - 0.8) * 80,
        vy: -0.8 - Math.random() * 1.2,
        life: 20 + Math.random() * 15,
        maxLife: 35,
        size: 2 + Math.random() * 3,
        color: '#ff4400',
      });
    }
    this.auraParticles = this.auraParticles.filter(p => {
      p.y += p.vy; p.life--; return p.life > 0;
    });
  }
}

// ─── GAME ENGINE ────────────────────────────────────────────
export class GameEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.W = canvas.width;
    this.H = canvas.height;
    this.state = 'lobby';
    this.queue = [];
    this.current = [];
    this.roundNum = 1;
    this.champion = null;
    this.particles = [];
    this.floatingTexts = [];
    this.bgImg = new Image();
    this.bgImg.src = BG_URL;
    this.bgImg.crossOrigin = 'anonymous';
    this.nameCounter = 0;
    this.fightTimer = 0;
    this.victoryTimer = 0;
    this.arenaShake = 0;
    this.arenaShakeX = 0;
    this.arenaShakeY = 0;
    this._winnerDeclared = false;
    this.ui = null;
    this.chat = null;
    this.lastTime = 0;
    this.usedColors = [];

    // SPRITE ORCO
    this.orcoSprites = {
      idle: [],
      walk: [],
      run: [],
      runUpgun: [],
      attack: [],
      damage: [],
      die: []
    };
    this.loadOrcoSprites();

    // SPRITE SAMURAI
    this.samuraiSprites = {
      idle: [],
      run: [],
      die: [],
      hit1: [],
      hit2: [],
      hit3: [],
      jump1: [],
      jump2: []
    };
    this.loadSamuraiSprites();

    this.ambientParticles = [];
    for (let i = 0; i < 18; i++) this.spawnAmbient();
  }

  // ─── CARICA ORCO ──────────────────────────────────────────
  loadOrcoSprites() {
    const anims = {
      idle: { count: 10, prefix: 'OgreIdle', path: 'Idle' },
      walk: { count: 11, prefix: 'OgreWalk', path: 'walk' },
      run: { count: 4, prefix: 'OgreRun', path: 'run/run' },
      runUpgun: { count: 4, prefix: 'OgreUpGun', path: 'run/upgun' },
      attack: { count: 5, prefix: 'OgreAttack', path: 'Attack' },
      damage: { count: 4, prefix: 'OgreDamage', path: 'TakeDamage' },
      die: { count: 16, prefix: 'OgreDie', path: 'Die' }
    };

    Object.keys(anims).forEach(key => {
      const { count, prefix, path } = anims[key];
      this.orcoSprites[key] = [];
      for (let i = 1; i <= count; i++) {
        const img = new Image();
        img.src = `assets/sprites/orco/${path}/sprite/${prefix}${i}.png`;
        this.orcoSprites[key].push(img);
      }
    });
  }

  getOrcoFrame(anim, frame) {
    const frames = this.orcoSprites[anim] || this.orcoSprites.idle;
    if (!frames || frames.length === 0) return null;
    return frames[frame % frames.length] || null;
  }

  getOrcoFrameCount(anim) {
    const counts = {
      idle: 10,
      walk: 11,
      run: 4,
      runUpgun: 4,
      attack: 5,
      damage: 4,
      die: 16
    };
    return counts[anim] || 1;
  }

  // ─── CARICA SAMURAI ──────────────────────────────────────
  loadSamuraiSprites() {
    const anims = {
      idle: { count: 3, prefix: 'samurai_idle', path: 'Idle' },
      run: { count: 3, prefix: 'samurai_run', path: 'Run' },
      die: { count: 5, prefix: 'samurai_die', path: 'Die' },
      hit1: { count: 3, prefix: 'samurai_hit', path: 'Hit1' },
      hit2: { count: 4, prefix: 'samurai_hit', path: 'Hit2' },
      hit3: { count: 3, prefix: 'samurai_hit', path: 'Hit3' },
      jump1: { count: 5, prefix: 'samurai_jump', path: 'Jump1' },
      jump2: { count: 3, prefix: 'samurai_jump', path: 'Jump2' }
    };

    Object.keys(anims).forEach(key => {
      const { count, prefix, path } = anims[key];
      this.samuraiSprites[key] = [];
      for (let i = 1; i <= count; i++) {
        const img = new Image();
        // Calcola il numero corretto per hit1, hit2, hit3
        let num = i;
        if (key === 'hit1') num = i;           // 1,2,3
        else if (key === 'hit2') num = i + 1;   // 2,3,4
        else if (key === 'hit3') num = i + 2;   // 3,4,5
        img.src = `assets/sprites/samurai/${path}/Sprites/${prefix}${num}.png`;
        this.samuraiSprites[key].push(img);
      }
    });
  }

  getSamuraiFrame(anim, frame) {
    const frames = this.samuraiSprites[anim] || this.samuraiSprites.idle;
    if (!frames || frames.length === 0) return null;
    return frames[frame % frames.length] || null;
  }

  getSamuraiFrameCount(anim) {
    const counts = {
      idle: 3,
      run: 3,
      die: 5,
      hit1: 3,
      hit2: 4,
      hit3: 3,
      jump1: 5,
      jump2: 3
    };
    return counts[anim] || 1;
  }

  // ─── GET FRAME (in base al personaggio) ──────────────────
  getSpriteFrame(character, anim, frame) {
    if (character === 'samurai') {
      return this.getSamuraiFrame(anim, frame);
    } else {
      return this.getOrcoFrame(anim, frame);
    }
  }

  getFrameCount(character, anim) {
    if (character === 'samurai') {
      return this.getSamuraiFrameCount(anim);
    } else {
      return this.getOrcoFrameCount(anim);
    }
  }

  // ─── METODI PRINCIPALI ────────────────────────────────────
  setUI(ui) { this.ui = ui; }
  setChat(chat) { this.chat = chat; }

  init() {
    this.loop(0);
    setTimeout(() => {
      if (this.queue.length === 0 && this.current.length === 0) {
        this.addGladiator('PABLO', true, 'orco');
        this.addGladiator('WILLIAM', true, 'samurai');
        this.addGladiator('NOEMYC', false, 'orco');
      }
    }, 1800);
  }

  spawnAmbient() {
    this.ambientParticles.push({
      x: Math.random() * this.W,
      y: this.H * 0.2 + Math.random() * this.H * 0.6,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -0.2 - Math.random() * 0.5,
      size: 1 + Math.random() * 2,
      alpha: 0.1 + Math.random() * 0.3,
      color: Math.random() > 0.5 ? '#9333ea' : '#fbbf24',
      life: 60 + Math.random() * 120,
      maxLife: 180,
    });
  }

  pickColor() {
    let idx;
    if (this.usedColors.length >= COLORS.length) this.usedColors = [];
    do { idx = Math.floor(Math.random() * COLORS.length); }
    while (this.usedColors.includes(idx));
    this.usedColors.push(idx);
    return idx;
  }

  addGladiator(name, donated = false, character = 'orco') {
    if (!name || name.trim() === '') name = 'Warrior' + (++this.nameCounter);
    name = name.trim().substring(0, 10).toUpperCase();
    const allNames = [...this.queue, ...this.current].map(g => g.name);
    if (allNames.includes(name)) return false;
    const colorIdx = this.pickColor();
    if (this.current.length < 2 && this.state !== 'victory') {
      const side = this.current.length === 0 ? 'left' : 'right';
      const g = new Gladiator(name, colorIdx, side, character);
      g.donated = donated;
      this.current.push(g);
      if (this.current.length === 2) this.startFight();
      this.chat?.addMessage(name, `⚔️ ${name} entra nell'arena!`, g.colors.cape);
    } else {
      const g = new Gladiator(name, colorIdx, 'queue', character);
      g.donated = donated;
      this.queue.push(g);
      this.chat?.addMessage(name, `⏳ ${name} in coda...`, g.colors.cape);
    }
    this.ui?.refresh();
    return true;
  }

  startFight() {
    if (this.current.length < 2) return;
    this.state = 'fighting';
    this.fightTimer = 0;
    const [a, b] = this.current;
    a.side = 'left'; a.x = 110; a.facing = 1; a.y = 490;
    b.side = 'right'; b.x = 340; b.facing = -1; b.y = 490;
    this.arenaShake = 35;
    this.spawnParticles(225, 490, '#9333ea', 25);
    this.chat?.addMessage('ARENA', `🔥 ROUND ${this.roundNum} — FIGHT!`, '#e879f9');
    this.ui?.refresh();
    this.ui?.showFightFlash();
    this.triggerAudio('fight');
  }

  loop(ts) {
    const dt = Math.min((ts - this.lastTime) / 1000, 0.05);
    this.lastTime = ts;
    this.update(dt);
    this.draw();
    requestAnimationFrame(t => this.loop(t));
  }

  update(dt) {
    if (this.arenaShake > 0) {
      this.arenaShake--;
      this.arenaShakeX = (Math.random() - 0.5) * 7;
      this.arenaShakeY = (Math.random() - 0.5) * 4;
    } else { this.arenaShakeX = this.arenaShakeY = 0; }
    [...this.current, ...this.queue].forEach(g => g.update());
    this.particles = this.particles.filter(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.25;
      p.life--; p.alpha = p.life / p.maxLife;
      return p.life > 0;
    });
    this.floatingTexts = this.floatingTexts.filter(t => {
      t.y -= 1.8; t.life--; t.alpha = t.life / t.maxLife;
      return t.life > 0;
    });
    this.ambientParticles = this.ambientParticles.filter(p => {
      p.x += p.vx; p.y += p.vy;
      p.life--; p.alpha = (p.life / p.maxLife) * 0.3;
      if (p.life <= 0) this.spawnAmbient();
      return p.life > 0;
    });
    if (this.state === 'fighting') this.updateFight();
    if (this.state === 'victory') this.updateVictory();
    if (this.state === 'reset') this.updateReset();
  }

  updateFight() {
    if (this.current.length < 2) return;
    const [a, b] = this.current;
    this.fightTimer++;
    if (a.alive && b.alive) {
      if (a.attackCooldown <= 0) {
        const delay = 90 + Math.floor(Math.random() * 65);
        a.attackCooldown = delay;
        setTimeout(() => this.performAttack(a, b), delay * 16);
      }
      if (b.attackCooldown <= 0) {
        const delay = 95 + Math.floor(Math.random() * 65);
        b.attackCooldown = delay;
        setTimeout(() => this.performAttack(b, a), delay * 16);
      }
    }
    const alive = this.current.filter(g => g.alive);
    if (alive.length === 1 && !this._winnerDeclared) {
      this._winnerDeclared = true;
      setTimeout(() => this.declareWinner(alive[0]), 900);
    } else if (alive.length === 0 && !this._winnerDeclared) {
      this._winnerDeclared = true;
      setTimeout(() => this.resetArena(), 1600);
    }
  }

  performAttack(attacker, defender) {
    if (!attacker.alive || !defender.alive || this.state !== 'fighting') return;
    const moveType = MOVE_TYPES[Math.floor(Math.random() * MOVE_TYPES.length)];
    let finalDmg = 12 + Math.floor(Math.random() * 14);
    if (attacker.rageModeTimer > 0) finalDmg = Math.floor(finalDmg * 1.5);
    attacker.anim = 'attack';
    attacker.currentFrame = 0;
    attacker.frameTime = 0;
    attacker.isAttacking = true;

    const targetX = defender.x + (attacker.side === 'left' ? -35 : 35);
    const startX = attacker.x;
    const frames = 12;
    let f = 0;
    const lunge = setInterval(() => {
      f++;
      attacker.x = startX + (targetX - startX) * (f / frames);
      if (f >= frames) {
        clearInterval(lunge);
        const actual = defender.takeDamage(finalDmg);
        this.addFloatingText(`-${actual}`, defender.x, defender.y - 70, false);
        this.spawnParticles(defender.x, defender.y - 30, '#ff2244', 10);
        this.arenaShake = 14;
        this.triggerAudio('hit');
        this.chat?.addMessage(attacker.name, `${getMoveEmoji(moveType)} ${moveType.toUpperCase()}! -${actual}`, attacker.colors.cape);
        this.ui?.refresh();
        setTimeout(() => {
          let rf = 0;
          const ret = setInterval(() => {
            rf++;
            attacker.x = targetX + (startX - targetX) * (rf / 10);
            if (rf >= 10) {
              clearInterval(ret);
              attacker.x = startX;
              attacker.anim = 'idle';
              attacker.currentFrame = 0;
              attacker.isAttacking = false;
            }
          }, 16);
        }, 200);
      }
    }, 16);
  }

  playerAction(action) {
    const player = this.current.find(g => g.donated && g.alive);
    if (!player) return;
    switch(action) {
      case 'energy':
        if (player.energy >= 30) {
          player.energy -= 30;
          const opp = this.current.find(g => g !== player && g.alive);
          if (opp) {
            const dmg = 18 + Math.floor(Math.random() * 15);
            const a = opp.takeDamage(dmg);
            this.addFloatingText(`-${a}`, opp.x, opp.y - 80, false);
            this.spawnParticles(opp.x, opp.y - 40, '#f59e0b', 14);
            this.arenaShake = 16;
            this.triggerAudio('special');
            this.chat?.addMessage(player.name, `⚡ RICARICA! -${a} HP`, player.colors.cape);
          }
        }
        break;
      case 'superko':
        if (player.energy >= 80) {
          player.energy -= 80;
          player.superFlash = 35;
          const opp2 = this.current.find(g => g !== player && g.alive);
          if (opp2) {
            const moveName = SPECIAL_MOVES[Math.floor(Math.random() * SPECIAL_MOVES.length)];
            const dmg2 = 35 + Math.floor(Math.random() * 22);
            player.anim = 'attack';
            player.currentFrame = 0;
            setTimeout(() => {
              const a2 = opp2.takeDamage(dmg2);
              this.addFloatingText(`💥 SUPER! -${a2}`, opp2.x, opp2.y - 95, true);
              this.spawnParticles(opp2.x, opp2.y - 50, '#ffd700', 28);
              this.arenaShake = 28;
              this.triggerAudio('super');
              this.chat?.addMessage(player.name, `💥 ${moveName}! -${a2} HP`, player.colors.cape);
              this.ui?.refresh();
            }, 420);
          }
        }
        break;
      case 'shield':
        if (player.energy >= 20) {
          player.energy -= 20;
          player.blocking = true;
          player.blockTimer = 130;
          this.chat?.addMessage(player.name, `🛡️ SCUDO ATTIVO!`, player.colors.cape);
        }
        break;
      case 'rage':
        if (player.energy >= 50) {
          player.energy -= 50;
          player.rageModeTimer = 220;
          this.spawnParticles(player.x, player.y - 50, '#ef4444', 22);
          this.arenaShake = 22;
          this.triggerAudio('rage');
          this.chat?.addMessage(player.name, `😡 RAGE MODE! +50% DMG`, player.colors.cape);
        }
        break;
      case 'ssj':
        if (player.energy >= 60) {
          player.energy -= 60;
          player.rageModeTimer = 280;
          player.superFlash = 40;
          this.spawnParticles(player.x, player.y - 60, '#f97316', 30);
          this.arenaShake = 30;
          this.triggerAudio('super');
          this.chat?.addMessage(player.name, `🔥 SAYAN AURA!`, player.colors.cape);
        }
        break;
      case 'ultra':
        if (player.energy >= 100) {
          player.energy = 0;
          player.rageModeTimer = 400;
          player.superFlash = 60;
          const opp3 = this.current.find(g => g !== player && g.alive);
          if (opp3) {
            const a3 = opp3.takeDamage(50);
            this.addFloatingText(`✨ ULTRA INSTINCT! -${a3}`, opp3.x, opp3.y - 100, true);
            this.spawnParticles(225, 400, '#818cf8', 40);
            this.arenaShake = 40;
          }
          this.triggerAudio('super');
          this.chat?.addMessage(player.name, `✨ ULTRA INSTINCT ATTIVATO!`, player.colors.cape);
        }
        break;
    }
    this.ui?.refresh();
  }

  declareWinner(winner) {
    this._winnerDeclared = false;
    winner.wins++;
    this.champion = winner;
    this.state = 'victory';
    this.victoryTimer = 0;
    this.roundNum++;
    this.spawnParticles(winner.x, winner.y - 50, winner.colors.cape, 45);
    this.spawnParticles(225, 380, '#ffd700', 35);
    this.arenaShake = 35;
    this.chat?.addMessage('ARENA', `👑 ${winner.name} VINCE!`, '#ffd700');
    this.triggerAudio('victory');
    this.ui?.showVictory(winner);
  }

  updateVictory() {
    this.victoryTimer++;
    if (this.victoryTimer > 310) this.state = 'reset';
  }

  updateReset() {
    if (!this._resetted) {
      this._resetted = true;
      setTimeout(() => { this.doReset(); this._resetted = false; }, 100);
    }
  }

  doReset() {
    const winner = this.champion;
    this.current = [];
    if (winner && winner.alive) {
      winner.side = 'left';
      winner.x = 110;
      winner.facing = 1;
      winner.hp = 100;
      winner.anim = 'idle';
      winner.blocking = false;
      winner.energy = Math.min(100, winner.energy + 25);
      winner.attackCooldown = 0;
      winner.currentFrame = 0;
      this.current.push(winner);
    }
    if (this.queue.length > 0) {
      const next = this.queue.shift();
      next.side = this.current.length === 0 ? 'left' : 'right';
      next.x = next.side === 'left' ? 110 : 340;
      next.facing = next.side === 'left' ? 1 : -1;
      next.y = 490;
      next.attackCooldown = 0;
      next.currentFrame = 0;
      this.current.push(next);
    }
    this.champion = null;
    this.state = 'lobby';
    this.ui?.hideVictory();
    if (this.current.length === 2) {
      setTimeout(() => this.startFight(), 1600);
    } else {
      this.chat?.addMessage('ARENA', '⚔️ In attesa di sfidanti... Scrivi JOIN!', '#e879f9');
    }
    this.ui?.refresh();
  }

  addFloatingText(text, x, y, isSuper) {
    this.floatingTexts.push({ text, x, y, isSuper, life: 65, maxLife: 65, alpha: 1 });
  }

  spawnParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.5 + Math.random() * 5.5;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.5,
        color,
        size: 2.5 + Math.random() * 5,
        life: 28 + Math.floor(Math.random() * 32),
        maxLife: 60,
        alpha: 1,
      });
    }
  }

  triggerAudio(type) {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const gain = ctx.createGain();
      gain.connect(ctx.destination);
      const osc = ctx.createOscillator();
      osc.connect(gain);
      switch(type) {
        case 'hit':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(200, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.15);
          gain.gain.setValueAtTime(0.28, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
          osc.start(); osc.stop(ctx.currentTime + 0.18);
          break;
        case 'special':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(480, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(960, ctx.currentTime + 0.28);
          gain.gain.setValueAtTime(0.38, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
          osc.start(); osc.stop(ctx.currentTime + 0.35);
          break;
        case 'super':
          osc.type = 'square';
          osc.frequency.setValueAtTime(100, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.55);
          gain.gain.setValueAtTime(0.45, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.65);
          osc.start(); osc.stop(ctx.currentTime + 0.65);
          break;
        case 'victory':
          [0, 0.14, 0.28, 0.42].forEach((t, i) => {
            const o2 = ctx.createOscillator();
            o2.connect(gain);
            o2.type = 'sine';
            o2.frequency.value = [523, 659, 784, 1047][i];
            o2.start(ctx.currentTime + t);
            o2.stop(ctx.currentTime + t + 0.42);
          });
          gain.gain.setValueAtTime(0.38, ctx.currentTime);
          break;
        case 'fight':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(70, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.35);
          gain.gain.setValueAtTime(0.48, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.42);
          osc.start(); osc.stop(ctx.currentTime + 0.42);
          break;
        case 'rage':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(55, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.65);
          gain.gain.setValueAtTime(0.48, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.75);
          osc.start(); osc.stop(ctx.currentTime + 0.75);
          break;
      }
    } catch(e) { /* silent */ }
  }

  // ─── DRAW ──────────────────────────────────────────────────
  draw() {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(this.arenaShakeX, this.arenaShakeY);

    if (this.bgImg.complete && this.bgImg.naturalWidth > 0) {
      ctx.drawImage(this.bgImg, 0, 0, this.W, this.H);
      ctx.fillStyle = 'rgba(3,1,10,0.35)';
      ctx.fillRect(0, 0, this.W, this.H);
    } else {
      this.drawFallbackBg(ctx);
    }

    this.ambientParticles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    const floorGlow = ctx.createRadialGradient(225, 530, 20, 225, 530, 170);
    floorGlow.addColorStop(0, 'rgba(120,0,200,0.18)');
    floorGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = floorGlow;
    ctx.beginPath();
    ctx.ellipse(225, 530, 170, 45, 0, 0, Math.PI * 2);
    ctx.fill();

    const btmGrad = ctx.createLinearGradient(0, 560, 0, this.H);
    btmGrad.addColorStop(0, 'transparent');
    btmGrad.addColorStop(0.5, 'rgba(3,1,12,0.7)');
    btmGrad.addColorStop(1, 'rgba(3,1,12,0.98)');
    ctx.fillStyle = btmGrad;
    ctx.fillRect(0, 560, this.W, this.H - 560);

    const topGrad = ctx.createLinearGradient(0, 0, 0, 96);
    topGrad.addColorStop(0, 'rgba(3,1,12,0.88)');
    topGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, this.W, 96);

    this.current.forEach(g => this.drawCharacter(ctx, g));

    this.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    this.floatingTexts.forEach(t => {
      ctx.save();
      ctx.globalAlpha = t.alpha;
      const sz = t.isSuper ? 28 : 21;
      ctx.font = `bold ${sz}px 'Arial Black', Impact`;
      ctx.fillStyle = t.isSuper ? '#ffd700' : '#ff3344';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3.5;
      ctx.textAlign = 'center';
      ctx.shadowColor = t.isSuper ? '#ffd700' : '#ff0000';
      ctx.shadowBlur = t.isSuper ? 12 : 6;
      ctx.strokeText(t.text, t.x, t.y);
      ctx.fillText(t.text, t.x, t.y);
      ctx.restore();
    });

    if (this.state === 'fighting' && this.fightTimer < 35) {
      const alpha = Math.max(0, 1 - this.fightTimer / 35);
      ctx.save();
      ctx.globalAlpha = alpha * 0.5;
      const flashGrad = ctx.createRadialGradient(225, 400, 20, 225, 400, 220);
      flashGrad.addColorStop(0, '#9333ea');
      flashGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = flashGrad;
      ctx.fillRect(0, 0, this.W, this.H);
      ctx.restore();
    }

    ctx.restore();
  }

  drawFallbackBg(ctx) {
    const grad = ctx.createLinearGradient(0, 0, 0, this.H);
    grad.addColorStop(0, '#050010');
    grad.addColorStop(0.4, '#0a0020');
    grad.addColorStop(0.7, '#0d0018');
    grad.addColorStop(1, '#020008');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.W, this.H);
    for (let i = 0; i < 3; i++) {
      const px = 30 + i * 185;
      ctx.fillStyle = '#0f0a22';
      ctx.fillRect(px, 60, 22, 520);
      ctx.fillStyle = '#1a1035';
      ctx.fillRect(px + 3, 60, 6, 520);
      const tglow = ctx.createRadialGradient(px + 11, 100, 3, px + 11, 100, 35);
      tglow.addColorStop(0, 'rgba(249,115,22,0.6)');
      tglow.addColorStop(1, 'transparent');
      ctx.fillStyle = tglow;
      ctx.fillRect(px - 24, 65, 70, 70);
    }
    ctx.fillStyle = '#0d0a1a';
    ctx.fillRect(0, 530, this.W, 200);
    ctx.strokeStyle = '#1a1535';
    ctx.lineWidth = 1;
    for (let i = 0; i < 15; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 32, 530);
      ctx.lineTo(i * 32, 730);
      ctx.stroke();
    }
  }

  // ─── DISEGNA PERSONAGGIO (ORCO o SAMURAI) ──────────────
  drawCharacter(ctx, g) {
    if (!g.alive && g.deathAnim <= 0) return;

    ctx.save();
    ctx.translate(g.x, g.y);
    if (g.facing === -1) ctx.scale(-1, 1);

    if (g.shakeTimer > 0) ctx.translate(g.shakeX, 0);
    if (g.hitFlash > 0 && g.hitFlash % 2 === 0) {
      ctx.filter = 'brightness(8) saturate(0)';
    }
    if (g.superFlash > 0) {
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = 30;
    }

    let anim = 'idle';
    if (!g.alive) anim = 'die';
    else if (g.anim === 'attack' || g.anim === 'punch' || g.anim === 'kick') anim = 'attack';
    else if (g.anim === 'run') anim = 'run';
    else if (g.anim === 'walk') anim = 'run';
    else if (g.hitFlash > 0) anim = 'hit';

    // Mappa per Samurai
    let samuraiAnim = anim;
    if (g.character === 'samurai') {
      if (anim === 'attack') samuraiAnim = 'hit1';
      else if (anim === 'hit') samuraiAnim = 'hit2';
      else if (anim === 'die') samuraiAnim = 'die';
      else if (anim === 'run') samuraiAnim = 'run';
      else if (anim === 'idle') samuraiAnim = 'idle';
    }

    let frame = g.currentFrame;
    const frameCount = this.getFrameCount(g.character, g.character === 'samurai' ? samuraiAnim : anim);

    if (anim === 'idle' || anim === 'run') {
      frame = Math.floor(Date.now() / 150) % frameCount;
    } else if (anim === 'attack') {
      if (frame >= frameCount) {
        g.anim = 'idle';
        g.currentFrame = 0;
        anim = 'idle';
        frame = 0;
      }
    } else if (anim === 'die') {
      if (frame >= frameCount) frame = frameCount - 1;
    }

    const sprite = this.getSpriteFrame(g.character, g.character === 'samurai' ? samuraiAnim : anim, frame);

    if (sprite && sprite.complete && sprite.naturalWidth > 0) {
      // Samurai è più piccolo, lo ingrandiamo un po'
      const scaleX = g.character === 'samurai' ? 80 : 100;
      const scaleY = g.character === 'samurai' ? 100 : 120;
      ctx.drawImage(sprite, -scaleX/2, -scaleY, scaleX, scaleY);
    } else {
      // Fallback
      ctx.fillStyle = g.character === 'samurai' ? '#ff4444' : '#ff6600';
      ctx.fillRect(-35, -75, 70, 90);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(g.character === 'samurai' ? 'SAMURAI' : 'ORCO', 0, -40);
    }

    if (g.rageModeTimer > 0) {
      ctx.globalAlpha = 0.3 + 0.2 * Math.sin(Date.now() / 100);
      ctx.fillStyle = '#ff4400';
      ctx.beginPath();
      ctx.arc(0, -30, 45, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    if (g.blocking) {
      ctx.save();
      const sx = g.x + (g.facing === 1 ? 35 : -35);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.55 + 0.35 * Math.sin(Date.now() / 90);
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(sx, g.y - 30, 35, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }
}

function getMoveEmoji(move) {
  return { punch: '👊', kick: '🦵', uppercut: '☝️', combo: '⚡', sweep: '💫' }[move] || '⚔️';
}
