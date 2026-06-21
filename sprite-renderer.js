// ============================================================
// SPRITE RENDERER - Street Fighter Style Character Animation
// ============================================================

export class SpriteRenderer {
  constructor() {
    this.spriteCache = {};
  }

  /**
   * Generate a character sprite with multiple animation frames
   * Returns canvas with all poses: idle, punch, kick, block, hit, victory, knockout
   */
  generateCharacterSprite(colorIdx, side = 'left') {
    const cacheKey = `sprite_${colorIdx}_${side}`;
    if (this.spriteCache[cacheKey]) {
      return this.spriteCache[cacheKey];
    }

    const COLORS = [
      { cape: '#c084fc', accent: '#e879f9', glow: '#9333ea', name: 'VIOLA' },
      { cape: '#f87171', accent: '#ff6b6b', glow: '#dc2626', name: 'ROSSO' },
      { cape: '#60a5fa', accent: '#93c5fd', glow: '#2563eb', name: 'BLU' },
      { cape: '#4ade80', accent: '#86efac', glow: '#16a34a', name: 'VERDE' },
      { cape: '#fbbf24', accent: '#fde68a', glow: '#d97706', name: 'DORATO' },
      { cape: '#f472b6', accent: '#f9a8d4', glow: '#db2777', name: 'ROSA' },
      { cape: '#22d3ee', accent: '#67e8f9', glow: '#0891b2', name: 'CYAN' },
      { cape: '#fb923c', accent: '#fdba74', glow: '#ea580c', name: 'ARANCIO' },
    ];

    const color = COLORS[colorIdx % COLORS.length];
    const canvas = document.createElement('canvas');
    canvas.width = 560;  // 8 poses * 70px width
    canvas.height = 100; // Character height
    const ctx = canvas.getContext('2d');

    // Draw all poses
    this.drawPose(ctx, 0, 0, 'idle', color, side);      // Frame 0
    this.drawPose(ctx, 70, 0, 'punch', color, side);    // Frame 1
    this.drawPose(ctx, 140, 0, 'kick', color, side);    // Frame 2
    this.drawPose(ctx, 210, 0, 'block', color, side);   // Frame 3
    this.drawPose(ctx, 280, 0, 'hit', color, side);     // Frame 4
    this.drawPose(ctx, 350, 0, 'victory', color, side); // Frame 5
    this.drawPose(ctx, 420, 0, 'knockout', color, side);// Frame 6
    this.drawPose(ctx, 490, 0, 'rage', color, side);    // Frame 7

    this.spriteCache[cacheKey] = canvas;
    return canvas;
  }

  drawPose(ctx, offsetX, offsetY, pose, color, side) {
    ctx.save();
    ctx.translate(offsetX + 35, offsetY + 50);
    
    if (side === 'right') ctx.scale(-1, 1);

    const bodyRotation = {
      idle: 0,
      punch: 0.15,
      kick: -0.1,
      block: 0.2,
      hit: -0.25,
      victory: 0.1,
      knockout: Math.PI / 2,
      rage: 0.08,
    }[pose] || 0;

    ctx.rotate(bodyRotation);

    // SHADOW
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(0, 28, 20, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // CAPE
    const capeWave = pose === 'rage' ? 8 : pose === 'kick' ? 6 : 4;
    ctx.fillStyle = color.cape;
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-5, -45);
    ctx.quadraticCurveTo(-18 + Math.sin(Date.now() / 300) * capeWave, -15, -20, 8);
    ctx.lineTo(-8, 0);
    ctx.lineTo(-2, -40);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // BODY - Armor
    ctx.fillStyle = '#1a3a52';
    ctx.strokeStyle = '#0f1f2e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-14, -42, 28, 38, 4);
    ctx.fill();
    ctx.stroke();

    // Chest piece (metallic)
    ctx.fillStyle = color.accent;
    ctx.beginPath();
    ctx.roundRect(-10, -38, 20, 18, 3);
    ctx.fill();
    
    // Armor lines
    ctx.strokeStyle = color.glow;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-6, -36);
    ctx.lineTo(-6, -22);
    ctx.moveTo(6, -36);
    ctx.lineTo(6, -22);
    ctx.stroke();

    // Belt
    ctx.fillStyle = '#8B6914';
    ctx.fillRect(-14, -8, 28, 6);
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(-3, -7, 6, 4);

    // Legs - Battle stance
    const legSplay = pose === 'kick' ? 0.6 : pose === 'block' ? 0.3 : 0.15;
    
    // Back leg
    ctx.strokeStyle = '#1a3a52';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-6, -4);
    ctx.lineTo(-8 - legSplay * 12, 8);
    ctx.lineTo(-6 - legSplay * 8, 24);
    ctx.stroke();

    // Front leg
    ctx.beginPath();
    ctx.moveTo(6, -4);
    ctx.lineTo(10 + legSplay * 14, 10);
    ctx.lineTo(8 + legSplay * 6, 25);
    ctx.stroke();

    // Boots
    ctx.fillStyle = '#8B6914';
    ctx.strokeStyle = '#5a4500';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(-6 - legSplay * 8, 26, 8, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(8 + legSplay * 6, 27, 8, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // HEAD
    ctx.fillStyle = '#f5deb3';
    ctx.strokeStyle = '#1a0a2e';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(0, -52, 18, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Helm/Headgear
    ctx.fillStyle = '#4a4a6a';
    ctx.beginPath();
    ctx.ellipse(0, -58, 20, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Face expression
    ctx.fillStyle = '#000';
    const eyeY = pose === 'victory' ? -54 : pose === 'hit' ? -56 : -55;
    const eyeSize = pose === 'rage' ? 5.5 : pose === 'victory' ? 4 : 5;
    
    ctx.beginPath();
    ctx.arc(-6, eyeY, eyeSize, 0, Math.PI * 2);
    ctx.arc(6, eyeY, eyeSize, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    ctx.fillStyle = color.glow;
    ctx.beginPath();
    ctx.arc(-6, eyeY, eyeSize * 0.5, 0, Math.PI * 2);
    ctx.arc(6, eyeY, eyeSize * 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Eye shine
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(-7, eyeY - 1.5, 1.5, 0, Math.PI * 2);
    ctx.arc(5, eyeY - 1.5, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Mouth expression
    ctx.strokeStyle = pose === 'victory' ? '#ffd700' : pose === 'rage' ? '#ff3333' : '#8b0000';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    
    if (pose === 'victory') {
      // Smile
      ctx.arc(0, -45, 5, 0.2, Math.PI - 0.2);
    } else if (pose === 'rage') {
      // Angry mouth
      ctx.arc(0, -44, 5, 0.1, Math.PI - 0.1);
      ctx.moveTo(-3, -42);
      ctx.lineTo(3, -42);
    } else if (pose === 'knockout') {
      // X mouth
      ctx.moveTo(-4, -46);
      ctx.lineTo(4, -42);
      ctx.moveTo(4, -46);
      ctx.lineTo(-4, -42);
    } else {
      // Angry grimace
      ctx.arc(0, -44, 5, 0.15, Math.PI - 0.15);
    }
    ctx.stroke();

    // ARMS
    const armAngle = {
      idle: { back: -0.3, front: 0.1 },
      punch: { back: -0.2, front: -1.2 },
      kick: { back: 0.3, front: 0.5 },
      block: { back: -0.4, front: 0.6 },
      hit: { back: 0.8, front: 0.9 },
      victory: { back: 0.2, front: -1.5 },
      knockout: { back: 1.2, front: 1.4 },
      rage: { back: -0.4, front: -0.8 },
    }[pose] || { back: 0, front: 0 };

    // Back arm
    ctx.strokeStyle = '#d0c8e0';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-8, -35);
    ctx.lineTo(-18 + armAngle.back * 12, -22 + armAngle.back * 15);
    ctx.stroke();

    // Gauntlet back
    ctx.fillStyle = '#8B6914';
    ctx.strokeStyle = '#5a4500';
    ctx.lineWidth = 1;
    const backGauntletX = -18 + armAngle.back * 12;
    const backGauntletY = -22 + armAngle.back * 15;
    ctx.beginPath();
    ctx.ellipse(backGauntletX, backGauntletY, 7, 5, armAngle.back, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Front arm (action arm)
    ctx.strokeStyle = '#e8e0f0';
    ctx.lineWidth = 7;
    const frontX = 18 + armAngle.front * 10;
    const frontY = -28 + armAngle.front * 20;
    ctx.beginPath();
    ctx.moveTo(8, -35);
    ctx.lineTo(frontX, frontY);
    ctx.stroke();

    // Gauntlet front
    ctx.fillStyle = '#8B6914';
    ctx.beginPath();
    ctx.ellipse(frontX, frontY, 7, 5, armAngle.front, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // SWORD (when not blocking)
    if (pose !== 'block') {
      ctx.save();
      ctx.translate(frontX, frontY);
      ctx.rotate(armAngle.front - 0.25);

      // Handle
      ctx.fillStyle = '#3d1f08';
      ctx.fillRect(-12, -2.5, 12, 5);

      // Guard
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(-10, -4, 18, 8);

      // Blade
      ctx.fillStyle = '#c8d0d8';
      ctx.strokeStyle = '#e8f0f8';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(6, -1.5);
      ctx.lineTo(40, -3);
      ctx.lineTo(40, 1);
      ctx.lineTo(6, 3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Blade glow (rage mode simulation)
      if (pose === 'rage') {
        ctx.strokeStyle = '#ff4400';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#ff4400';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(6, 0);
        ctx.lineTo(40, -2);
        ctx.stroke();
      }

      ctx.restore();
    }

    // SHIELD (when blocking)
    if (pose === 'block') {
      ctx.save();
      ctx.translate(-22, -25);
      ctx.rotate(-0.3);

      // Shield
      ctx.fillStyle = '#6b3d1e';
      ctx.strokeStyle = '#3d2010';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, 14, 18, 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Emblem
      ctx.fillStyle = color.accent;
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = color.glow;
      ctx.beginPath();
      ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    ctx.restore();
  }

  /**
   * Draw a frame from the sprite sheet onto a target canvas
   */
  drawFrame(ctx, spriteCanvas, frameIndex, x, y, width = 70, height = 100, flipped = false) {
    if (!spriteCanvas) return;

    ctx.save();
    if (flipped) {
      ctx.scale(-1, 1);
      ctx.drawImage(spriteCanvas, frameIndex * 70, 0, 70, 100, -x - width, y, width, height);
    } else {
      ctx.drawImage(spriteCanvas, frameIndex * 70, 0, 70, 100, x, y, width, height);
    }
    ctx.restore();
  }

  /**
   * Get animation frame based on pose and time
   */
  getAnimationFrame(pose, animTimer) {
    const frameMap = {
      idle: 0,
      punch: 1,
      kick: 2,
      block: 3,
      hit: 4,
      victory: 5,
      knockout: 6,
      rage: 7,
    };

    // Add breathing/bobbing for idle
    if (pose === 'idle' && Math.sin(animTimer * 0.05) > 0.5) {
      return 0;
    }

    return frameMap[pose] || 0;
  }
}
