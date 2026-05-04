const W = 420;
const H = 720;

const SAVE_KEY = "emberveil_rebuilt_v1";

const CHARACTERS = [
  {
    id: "archer",
    name: "Ember Archer",
    icon: "🏹",
    unlockChapter: 1,
    desc: "Balanced HP, range, and fire rate.",
    stats: {
      maxHp: 125,
      damage: 15,
      speed: 210,
      fireRate: 390,
      bulletSpeed: 520,
      range: 310,
      dashCost: 18,
      dashCharges: 1,
      dashRange: 105,
      critChance: 0.06,
      armor: 0,
      multishot: 1,
      magnet: 90
    }
  },
  {
    id: "rogue",
    name: "Shadow Rogue",
    icon: "🗡",
    unlockChapter: 4,
    desc: "Unlocked after Chapter 3. Faster, lower HP, double dash.",
    stats: {
      maxHp: 85,
      damage: 17,
      speed: 265,
      fireRate: 330,
      bulletSpeed: 570,
      range: 285,
      dashCost: 12,
      dashCharges: 2,
      dashRange: 130,
      critChance: 0.12,
      armor: 0,
      multishot: 1,
      magnet: 105
    }
  }
];

const SKILL_TREE = [
  { id: "s0",  name: "Arrow Split",   icon: "✦",  desc: "+1 multishot",       cost: 15, req: [],        apply: s => s.multishot += 1 },
  { id: "s1",  name: "Iron Flesh",    icon: "🛡", desc: "+5% armor",          cost: 12, req: [],        apply: s => s.armor += 0.05 },
  { id: "s2",  name: "Ranger",        icon: "🔭", desc: "+50 range",          cost: 10, req: [],        apply: s => s.range += 50 },
  { id: "s3",  name: "Sprint",        icon: "💨", desc: "+20 speed",          cost: 10, req: [],        apply: s => s.speed += 20 },

  { id: "s4",  name: "Tri-Shot",      icon: "✦✦", desc: "+1 multishot",      cost: 25, req: ["s0"],    apply: s => s.multishot += 1 },
  { id: "s5",  name: "Fortress",      icon: "🏰", desc: "+10% armor",         cost: 22, req: ["s1"],    apply: s => s.armor += 0.10 },
  { id: "s6",  name: "Eagle Vision",  icon: "👁", desc: "+80 range",          cost: 20, req: ["s2"],    apply: s => s.range += 80 },
  { id: "s7",  name: "Blitz",         icon: "⚡", desc: "+35 dash range",     cost: 18, req: ["s3"],    apply: s => s.dashRange += 35 },

  { id: "s8",  name: "Volley",        icon: "🏹", desc: "+1 multishot",       cost: 40, req: ["s4"],    apply: s => s.multishot += 1 },
  { id: "s9",  name: "Regen Aura",    icon: "♻", desc: "Slow HP regen",       cost: 35, req: ["s5"],    apply: s => s.regen = true },
  { id: "s10", name: "Sniper",        icon: "🎯", desc: "+100 range",         cost: 35, req: ["s6"],    apply: s => s.range += 100 },
  { id: "s11", name: "Momentum",      icon: "🌀", desc: "+30 speed",          cost: 30, req: ["s7"],    apply: s => s.speed += 30 },

  { id: "s12", name: "Crit Mastery",  icon: "💀", desc: "+12% crit",          cost: 50, req: ["s8"],    apply: s => s.critChance += 0.12 },
  { id: "s13", name: "Vampiric Aura", icon: "🩸", desc: "Heal on kill",        cost: 45, req: ["s9"],    apply: s => s.vampiric = true },
  { id: "s14", name: "Fire Arrows",   icon: "🔥", desc: "Burn bullets",        cost: 45, req: ["s10"],   apply: s => s.burn = true },
  { id: "s15", name: "Ghost Step",    icon: "👻", desc: "-8 dash cost",        cost: 40, req: ["s11"],   apply: s => s.dashCost = Math.max(5, s.dashCost - 8) },

  { id: "s16", name: "Death Volley",  icon: "☠", desc: "+2 multishot",        cost: 80, req: ["s12"],   apply: s => s.multishot += 2 },
  { id: "s17", name: "Lifesteal",     icon: "❤", desc: "Vamp + regen",        cost: 70, req: ["s13"],   apply: s => { s.vampiric = true; s.regen = true; } },
  { id: "s18", name: "Chain Inferno", icon: "🔥", desc: "Burn + lightning",    cost: 70, req: ["s14"],   apply: s => { s.burn = true; s.lightning = true; } },
  { id: "s19", name: "Phantom Rush",  icon: "🌪", desc: "+1 dash charge",      cost: 60, req: ["s15"],   apply: s => s.dashCharges += 1 }
];

const PERKS = [
  { name: "Sharp Shot", icon: "⚔", desc: "+8 damage", apply: s => s.damage += 8 },
  { name: "Vitality", icon: "❤", desc: "+35 max HP", apply: s => { s.maxHp += 35; s.hp += 35; } },
  { name: "Quick Draw", icon: "🏹", desc: "Faster shooting", apply: s => s.fireRate = Math.max(120, s.fireRate - 55) },
  { name: "Swift Feet", icon: "💨", desc: "+25 speed", apply: s => s.speed += 25 },
  { name: "Eagle Sight", icon: "🔭", desc: "+70 range", apply: s => s.range += 70 },
  { name: "Double Shot", icon: "✦", desc: "+1 multishot", apply: s => s.multishot += 1 },
  { name: "Hellfire", icon: "🔥", desc: "Bullets burn enemies", apply: s => s.burn = true },
  { name: "Vampiric", icon: "🩸", desc: "Heal on kill", apply: s => s.vampiric = true },
  { name: "Ricochet", icon: "↩", desc: "Shots bounce once", apply: s => s.ricochet = true },
  { name: "Chain Lightning", icon: "⚡", desc: "Zap nearby enemies", apply: s => s.lightning = true }
];

class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  preload() {}

  create() {
    this.save = this.loadSave();

    this.chapter = this.save.chapter || 1;
    this.wave = 1;
    this.maxWave = 10;
    this.coins = this.save.coins ?? 25;
    this.gems = this.save.gems ?? 25;
    this.selectedChar = this.save.selectedChar || "archer";
    this.unlockedSkills = new Set(this.save.unlockedSkills || []);

    this.mode = "menu";
    this.roomType = "normal";
    this.roomTypes = this.generateRooms();

    this.enemies = [];
    this.bullets = [];
    this.enemyShots = [];
    this.pickups = [];
    this.weather = [];
    this.ui = [];
    this.menuUI = [];

    this.keys = this.input.keyboard.addKeys("W,A,S,D,UP,DOWN,LEFT,RIGHT,SPACE");
    this.pointerDown = false;
    this.move = new Phaser.Math.Vector2(0, 0);
    this.lastShot = 0;
    this.lastEnemyShot = 0;
    this.dashCooldown = 0;
    this.dashCharges = 1;
    this.regenTimer = 0;
    this.spawnTimer = 0;
    this.toSpawn = 0;
    this.bossActive = false;
    this.cinematic = false;

    this.makeTextures();
    this.makeBackground();
    this.makePlayer();
    this.makeHUD();
    this.setupMobileControls();

    this.player.setVisible(false);
    this.setHUDVisible(false);
    this.showMap();

    this.cameras.main.fadeIn(400, 0, 0, 0);
  }

  loadSave() {
    try {
      return JSON.parse(localStorage.getItem(SAVE_KEY)) || {};
    } catch {
      return {};
    }
  }

  saveGame() {
    this.save.chapter = this.chapter;
    this.save.coins = this.coins;
    this.save.gems = this.gems;
    this.save.selectedChar = this.selectedChar;
    this.save.unlockedSkills = [...this.unlockedSkills];
    localStorage.setItem(SAVE_KEY, JSON.stringify(this.save));
  }

  makeTextures() {
    const g = this.add.graphics();

    g.clear();
    g.fillStyle(0x2d1a12);
    g.fillCircle(12, 12, 12);
    g.fillStyle(0xffcc66);
    g.fillCircle(12, 12, 7);
    g.generateTexture("coin", 24, 24);

    g.clear();
    g.fillStyle(0x36d7ff);
    g.fillCircle(10, 10, 10);
    g.fillStyle(0xffffff);
    g.fillCircle(7, 7, 3);
    g.generateTexture("gem", 20, 20);

    g.clear();
    g.fillStyle(0xff3b3b);
    g.fillCircle(10, 10, 10);
    g.generateTexture("heart", 20, 20);

    g.destroy();
  }

  makeBackground() {
    this.bg = this.add.graphics().setDepth(-20);
    this.drawRoomBackground();
  }

  drawRoomBackground() {
    this.bg.clear();

    const top = this.roomType === "boss" ? 0x180006 : this.roomType === "curse" ? 0x120006 : 0x080716;
    const mid = this.roomType === "elite" ? 0x190629 : 0x10091c;
    const floor = this.roomType === "treasure" ? 0x211806 : 0x150c13;

    this.bg.fillGradientStyle(top, top, mid, floor, 1);
    this.bg.fillRect(0, 0, W, H);

    for (let y = 90; y < H - 40; y += 48) {
      for (let x = 0; x < W; x += 48) {
        this.bg.lineStyle(1, 0x2b2635, 0.25);
        this.bg.strokeRect(x, y, 48, 48);
      }
    }

    this.bg.lineStyle(4, 0xc8952a, 0.9);
    this.bg.beginPath();
    this.bg.moveTo(78, 94);
    this.bg.lineTo(78, 78);
    this.bg.lineTo(94, 78);
    this.bg.moveTo(W - 78, 94);
    this.bg.lineTo(W - 78, 78);
    this.bg.lineTo(W - 94, 78);
    this.bg.moveTo(78, H - 78);
    this.bg.lineTo(78, H - 62);
    this.bg.lineTo(94, H - 62);
    this.bg.moveTo(W - 78, H - 78);
    this.bg.lineTo(W - 78, H - 62);
    this.bg.lineTo(W - 94, H - 62);
    this.bg.strokePath();
  }

  makePlayer() {
    this.player = this.add.container(W / 2, H - 170).setDepth(30);

    this.playerShadow = this.add.ellipse(0, 15, 34, 12, 0x000000, 0.35);
    this.playerBody = this.add.circle(0, 0, 15, 0xf0c060);
    this.playerCore = this.add.circle(0, -2, 8, 0x3b1f12);
    this.playerBow = this.add.rectangle(14, -3, 5, 26, 0xc8952a);

    this.player.add([this.playerShadow, this.playerBody, this.playerCore, this.playerBow]);
  }

  buildStats() {
    const ch = this.getSelectedCharacter();
    const s = JSON.parse(JSON.stringify(ch.stats));

    s.hp = s.maxHp;
    s.regen = false;
    s.vampiric = false;
    s.burn = false;
    s.ricochet = false;
    s.lightning = false;

    for (const id of this.unlockedSkills) {
      const node = SKILL_TREE.find(n => n.id === id);
      if (node) node.apply(s);
    }

    s.multishot = Math.min(6, s.multishot);
    s.armor = Math.min(0.65, s.armor);

    return s;
  }

  getSelectedCharacter() {
    return CHARACTERS.find(c => c.id === this.selectedChar) || CHARACTERS[0];
  }

  generateRooms() {
    const types = [];
    for (let i = 1; i <= this.maxWave; i++) {
      if (i === this.maxWave) types.push("boss");
      else if (i === 1) types.push("normal");
      else {
        const roll = Phaser.Math.Between(1, 100);
        if (roll <= 13) types.push("treasure");
        else if (roll <= 27) types.push("elite");
        else if (roll <= 38) types.push("curse");
        else types.push("normal");
      }
    }
    return types;
  }

  makeHUD() {
    this.hpBg = this.add.rectangle(92, 24, 150, 14, 0x25070a).setDepth(100);
    this.hpFill = this.add.rectangle(17, 24, 150, 14, 0xcc3030).setOrigin(0, 0.5).setDepth(101);
    this.hpText = this.add.text(92, 24, "", { fontSize: "10px", color: "#fff", stroke: "#000", strokeThickness: 2 }).setOrigin(0.5).setDepth(102);

    this.infoText = this.add.text(W / 2, 48, "", { fontSize: "14px", color: "#f0c060", stroke: "#000", strokeThickness: 3 }).setOrigin(0.5).setDepth(102);

    this.currencyText = this.add.text(W - 12, 18, "", { fontSize: "13px", color: "#ffe080", stroke: "#000", strokeThickness: 3 }).setOrigin(1, 0.5).setDepth(102);

    this.dashButton = this.add.circle(W - 64, H - 76, 34, 0x1b1730, 0.9).setStrokeStyle(2, 0x66ccff).setDepth(100).setInteractive();
    this.dashLabel = this.add.text(W - 64, H - 76, "DASH", { fontSize: "11px", color: "#ffffff", stroke: "#000", strokeThickness: 3 }).setOrigin(0.5).setDepth(101);
    this.dashDots = this.add.text(W - 64, H - 112, "", { fontSize: "18px", color: "#66ccff", stroke: "#000", strokeThickness: 3 }).setOrigin(0.5).setDepth(101);

    this.dashButton.on("pointerdown", () => this.tryDash());

    this.ui.push(this.hpBg, this.hpFill, this.hpText, this.infoText, this.currencyText, this.dashButton, this.dashLabel, this.dashDots);
  }

  setHUDVisible(v) {
    for (const o of this.ui) o.setVisible(v);
    if (this.joyBase) {
      this.joyBase.setVisible(v);
      this.joyKnob.setVisible(v);
    }
  }

  setupMobileControls() {
    this.joyBase = this.add.circle(70, H - 80, 42, 0x111827, 0.55).setStrokeStyle(2, 0xc8952a, 0.7).setDepth(100);
    this.joyKnob = this.add.circle(70, H - 80, 20, 0xc8952a, 0.85).setDepth(101);

    this.input.on("pointerdown", p => {
      if (p.x < W / 2 && p.y > H / 2 && this.mode === "combat") {
        this.pointerDown = true;
        this.joyOrigin = new Phaser.Math.Vector2(70, H - 80);
      }
    });

    this.input.on("pointermove", p => {
      if (!this.pointerDown || this.mode !== "combat") return;
      const dx = p.x - this.joyOrigin.x;
      const dy = p.y - this.joyOrigin.y;
      const len = Math.min(42, Math.sqrt(dx * dx + dy * dy));
      const ang = Math.atan2(dy, dx);

      this.joyKnob.x = this.joyOrigin.x + Math.cos(ang) * len;
      this.joyKnob.y = this.joyOrigin.y + Math.sin(ang) * len;

      this.move.set(Math.cos(ang) * (len / 42), Math.sin(ang) * (len / 42));
    });

    this.input.on("pointerup", () => {
      this.pointerDown = false;
      this.move.set(0, 0);
      this.joyKnob.setPosition(70, H - 80);
    });
  }

  clearMenu() {
    for (const o of this.menuUI) {
      if (o && o.destroy) o.destroy();
    }
    this.menuUI = [];
  }

  showMap() {
    this.mode = "menu";
    this.clearCombat();
    this.clearMenu();
    this.player.setVisible(false);
    this.setHUDVisible(false);

    const ui = this.menuUI;

    ui.push(this.add.rectangle(W / 2, H / 2, W, H, 0x04030a, 0.96).setDepth(200));
    ui.push(this.add.text(W / 2, 34, "EMBERVEIL", {
      fontSize: "26px",
      color: "#c8952a",
      stroke: "#000",
      strokeThickness: 5
    }).setOrigin(0.5).setDepth(201));

    ui.push(this.add.text(W / 2, 63, "Chapter " + this.chapter + "  •  Wave " + this.wave + "/" + this.maxWave, {
      fontSize: "13px",
      color: "#f0d890",
      stroke: "#000",
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(201));

    ui.push(this.add.text(W / 2, 91, "Coins: " + this.coins + "     Gems: " + this.gems, {
      fontSize: "13px",
      color: "#ffe080",
      stroke: "#000",
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(201));

    const points = [];
    for (let i = 0; i < this.maxWave; i++) {
      const t = i / (this.maxWave - 1);
      points.push({
        x: W / 2 + Math.sin(i * 1.25) * 58,
        y: Phaser.Math.Linear(565, 130, t),
        type: this.roomTypes[i]
      });
    }

    for (let i = 0; i < points.length - 1; i++) {
      const g = this.add.graphics().setDepth(201);
      g.lineStyle(3, 0x3c334c, 0.9);
      g.lineBetween(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
      ui.push(g);
    }

    points.forEach((p, i) => {
      const current = i === this.wave - 1;
      const passed = i < this.wave - 1;
      const color = passed ? 0x286a2d : current ? 0xc8952a : this.roomColor(p.type);
      const size = p.type === "boss" ? 23 : 17;

      ui.push(this.add.circle(p.x, p.y, size, color, 1).setStrokeStyle(2, current ? 0xffffff : 0x000000).setDepth(202));

      ui.push(this.add.text(p.x, p.y, passed ? "✓" : this.roomIcon(p.type), {
        fontSize: p.type === "boss" ? "17px" : "13px",
        color: "#fff",
        stroke: "#000",
        strokeThickness: 3
      }).setOrigin(0.5).setDepth(203));
    });

    this.makeButton(W / 2, H - 86, 210, 42, "ENTER DUNGEON", 0x214d25, () => this.startRoom(), ui);
    this.makeButton(80, H - 32, 120, 32, "HERO", 0x151b35, () => this.showCharacterSelect(), ui);
    this.makeButton(W / 2, H - 32, 120, 32, "SKILLS", 0x271538, () => this.showSkillTree(), ui);
    this.makeButton(W - 80, H - 32, 120, 32, "RESET", 0x321414, () => {
      localStorage.removeItem(SAVE_KEY);
      location.reload();
    }, ui);
  }

  roomIcon(type) {
    return { normal: "⚔", treasure: "💰", elite: "👑", curse: "💀", boss: "☠" }[type] || "⚔";
  }

  roomColor(type) {
    return { normal: 0x272945, treasure: 0x6a4a10, elite: 0x5b2180, curse: 0x611818, boss: 0xb01818 }[type] || 0x272945;
  }

  makeButton(x, y, w, h, label, color, cb, list) {
    const r = this.add.rectangle(x, y, w, h, color, 0.96).setStrokeStyle(2, 0xc8952a).setDepth(210).setInteractive();
    const t = this.add.text(x, y, label, { fontSize: "13px", color: "#ffffff", stroke: "#000", strokeThickness: 3 }).setOrigin(0.5).setDepth(211);
    r.on("pointerdown", cb);
    r.on("pointerover", () => r.setScale(1.03));
    r.on("pointerout", () => r.setScale(1));
    if (list) list.push(r, t);
    return r;
  }

  showCharacterSelect() {
    this.clearMenu();
    const ui = this.menuUI;

    ui.push(this.add.rectangle(W / 2, H / 2, W, H, 0x04030a, 0.97).setDepth(200));
    ui.push(this.add.text(W / 2, 42, "HERO SELECT", {
      fontSize: "24px",
      color: "#c8952a",
      stroke: "#000",
      strokeThickness: 5
    }).setOrigin(0.5).setDepth(201));

    CHARACTERS.forEach((ch, i) => {
      const unlocked = this.chapter >= ch.unlockChapter;
      const y = 160 + i * 145;
      const selected = this.selectedChar === ch.id;

      ui.push(this.add.rectangle(W / 2, y, W - 44, 112, selected ? 0x243015 : 0x11101b, 0.95)
        .setStrokeStyle(2, selected ? 0x88ff66 : 0xc8952a).setDepth(201));

      ui.push(this.add.text(55, y - 18, unlocked ? ch.icon : "🔒", { fontSize: "32px" }).setOrigin(0.5).setDepth(202));

      ui.push(this.add.text(92, y - 36, ch.name, {
        fontSize: "17px",
        color: unlocked ? "#ffe080" : "#777777",
        stroke: "#000",
        strokeThickness: 3
      }).setOrigin(0, 0.5).setDepth(202));

      ui.push(this.add.text(92, y - 8, unlocked ? ch.desc : "Unlocks after completing Chapter 3", {
        fontSize: "11px",
        color: "#bbb",
        wordWrap: { width: 260 }
      }).setOrigin(0, 0.5).setDepth(202));

      ui.push(this.add.text(92, y + 24, "HP " + ch.stats.maxHp + "  DMG " + ch.stats.damage + "  SPD " + ch.stats.speed + "  DASH " + ch.stats.dashCharges, {
        fontSize: "10px",
        color: "#9fdcff",
        stroke: "#000",
        strokeThickness: 2
      }).setOrigin(0, 0.5).setDepth(202));

      const hit = this.add.rectangle(W / 2, y, W - 44, 112, 0xffffff, 0.001).setDepth(203).setInteractive();
      hit.on("pointerdown", () => {
        if (!unlocked) {
          this.toast("Complete Chapter 3 to unlock Shadow Rogue.", "#ff6666");
          return;
        }
        this.selectedChar = ch.id;
        this.saveGame();
        this.showCharacterSelect();
      });
      ui.push(hit);
    });

    this.makeButton(W / 2, H - 45, 180, 36, "BACK", 0x1a1730, () => this.showMap(), ui);
  }

  showSkillTree() {
    this.clearMenu();
    const ui = this.menuUI;

    ui.push(this.add.rectangle(W / 2, H / 2, W, H, 0x04030a, 0.97).setDepth(200));
    ui.push(this.add.text(W / 2, 34, "PASSIVE SKILLS", {
      fontSize: "22px",
      color: "#c8952a",
      stroke: "#000",
      strokeThickness: 5
    }).setOrigin(0.5).setDepth(201));

    ui.push(this.add.text(W / 2, 62, "Gems: " + this.gems, {
      fontSize: "14px",
      color: "#66ddff",
      stroke: "#000",
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(201));

    SKILL_TREE.forEach((n, i) => {
      const col = i % 4;
      const row = Math.floor(i / 4);
      const x = 64 + col * 98;
      const y = 112 + row * 96;
      const owned = this.unlockedSkills.has(n.id);
      const available = this.canUnlock(n);

      const box = this.add.rectangle(x, y, 82, 74, owned ? 0x173318 : available ? 0x241838 : 0x111018, 0.96)
        .setStrokeStyle(2, owned ? 0x66ff66 : available ? 0xd966ff : 0x444444)
        .setDepth(201)
        .setInteractive();

      ui.push(box);
      ui.push(this.add.text(x, y - 22, n.icon, { fontSize: "18px" }).setOrigin(0.5).setDepth(202));
      ui.push(this.add.text(x, y - 3, n.name, { fontSize: "8px", color: "#fff", stroke: "#000", strokeThickness: 2 }).setOrigin(0.5).setDepth(202));
      ui.push(this.add.text(x, y + 13, n.desc, { fontSize: "7px", color: "#bbb" }).setOrigin(0.5).setDepth(202));
      ui.push(this.add.text(x, y + 28, owned ? "OWNED" : n.cost + " gems", {
        fontSize: "8px",
        color: owned ? "#88ff88" : available ? "#66ddff" : "#777777",
        stroke: "#000",
        strokeThickness: 2
      }).setOrigin(0.5).setDepth(202));

      box.on("pointerdown", () => {
        if (owned) return;
        if (!available) {
          this.toast("Need gems or previous skill.", "#ff6666");
          return;
        }
        this.gems -= n.cost;
        this.unlockedSkills.add(n.id);
        this.saveGame();
        this.showSkillTree();
      });
    });

    this.makeButton(W / 2, H - 45, 180, 36, "BACK", 0x1a1730, () => this.showMap(), ui);
  }

  canUnlock(node) {
    if (this.unlockedSkills.has(node.id)) return false;
    if (this.gems < node.cost) return false;
    return node.req.every(r => this.unlockedSkills.has(r));
  }

  startRoom() {
    this.clearMenu();
    this.mode = "combat";
    this.roomType = this.roomTypes[this.wave - 1] || "normal";
    this.drawRoomBackground();

    this.stats = this.buildStats();
    this.dashCharges = this.stats.dashCharges;
    this.bossActive = false;
    this.cinematic = false;

    this.player.setVisible(true);
    this.player.setPosition(W / 2, H - 160);
    this.player.setScale(1);
    this.player.setAlpha(1);
    this.setHUDVisible(true);

    this.clearCombat();
    this.updateHUD();

    if (this.roomType === "treasure") {
      this.showTreasureRoom();
      return;
    }

    if (this.roomType === "curse") {
      this.applyCurse();
    }

    if (this.roomType === "boss") {
      this.startBossCinematic();
      return;
    }

    this.toSpawn = this.roomType === "elite" ? 3 : 7 + this.wave * 2;
    this.spawnTimer = 300;
  }

  clearCombat() {
    const all = [...this.enemies, ...this.bullets, ...this.enemyShots, ...this.pickups, ...this.weather];
    for (const o of all) {
      if (o && o.destroy) o.destroy();
      if (o && o.hpBar && o.hpBar.destroy) o.hpBar.destroy();
    }

    this.enemies = [];
    this.bullets = [];
    this.enemyShots = [];
    this.pickups = [];
    this.weather = [];
  }

  showTreasureRoom() {
    this.mode = "event";
    this.setHUDVisible(false);

    const panel = this.add.rectangle(W / 2, H / 2, W - 42, 350, 0x100b16, 0.96).setStrokeStyle(2, 0xffd56a).setDepth(300);
    const title = this.add.text(W / 2, H / 2 - 145, "TREASURE ROOM", {
      fontSize: "24px",
      color: "#ffe080",
      stroke: "#000",
      strokeThickness: 5
    }).setOrigin(0.5).setDepth(301);

    const picks = Phaser.Utils.Array.Shuffle([...PERKS]).slice(0, 3);
    const objects = [panel, title];

    picks.forEach((p, i) => {
      const y = H / 2 - 70 + i * 82;
      const card = this.add.rectangle(W / 2, y, W - 86, 64, 0x1b1422, 0.95).setStrokeStyle(2, 0xc8952a).setDepth(301).setInteractive();
      const txt = this.add.text(W / 2, y, p.icon + "  " + p.name + "\n" + p.desc, {
        fontSize: "14px",
        color: "#ffffff",
        align: "center",
        stroke: "#000",
        strokeThickness: 3
      }).setOrigin(0.5).setDepth(302);

      card.on("pointerdown", () => {
        p.apply(this.stats);
        for (const o of objects) if (o.destroy) o.destroy();
        this.finishRoom();
      });

      objects.push(card, txt);
    });
  }

  applyCurse() {
    const curses = [
      { text: "CURSE: HP HALVED, but rewards doubled.", fn: () => { this.stats.hp = Math.max(1, Math.floor(this.stats.hp * 0.5)); this.stats.rewardMult = 2; } },
      { text: "CURSE: RANGE CUT, but rewards doubled.", fn: () => { this.stats.range *= 0.65; this.stats.rewardMult = 2; } },
      { text: "CURSE: DAMAGE CUT, but rewards doubled.", fn: () => { this.stats.damage *= 0.7; this.stats.rewardMult = 2; } }
    ];

    const c = Phaser.Utils.Array.GetRandom(curses);
    c.fn();
    this.toast(c.text, "#ff5555");
  }

  startBossCinematic() {
    this.mode = "cinematic";
    this.cinematic = true;
    this.setHUDVisible(false);

    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.72).setDepth(300);
    const warning = this.add.text(W / 2, H / 2 - 30, "⚠ BOSS INCOMING", {
      fontSize: "30px",
      color: "#ff2d2d",
      stroke: "#000",
      strokeThickness: 7
    }).setOrigin(0.5).setDepth(301).setScale(0.3);

    this.tweens.add({
      targets: warning,
      scale: 1.05,
      duration: 380,
      ease: "Back.Out",
      yoyo: true,
      hold: 500,
      onComplete: () => {
        warning.destroy();

        const boss = this.createEnemy(W / 2, -90, "boss");
        boss.setDepth(80);

        this.tweens.add({
          targets: boss,
          y: 165,
          duration: 700,
          ease: "Bounce.Out",
          onComplete: () => {
            overlay.destroy();
            this.cameras.main.shake(260, 0.018);
            this.shockwave(boss.x, boss.y);
            this.setHUDVisible(true);
            this.mode = "combat";
            this.cinematic = false;
            this.bossActive = true;
            this.updateHUD();
          }
        });
      }
    });
  }

  createEnemy(x, y, type) {
    let radius = 14;
    let color = 0x5ee04f;
    let hp = 40 + this.wave * 7;
    let speed = 55 + this.wave * 3;
    let damage = 12;

    if (type === "goblin") {
      color = 0x66cc55;
      hp *= 0.9;
      speed += 8;
    }

    if (type === "ember") {
      color = 0xff7630;
      hp *= 0.75;
      speed += 15;
    }

    if (type === "elite") {
      color = 0x9b5cff;
      radius = 20;
      hp *= 2.2;
      speed *= 0.75;
      damage = 18;
    }

    if (type === "boss") {
      color = 0xaa1010;
      radius = 35;
      hp = 700 + this.chapter * 170;
      speed = 45;
      damage = 24;
    }

    const e = this.add.container(x, y).setDepth(20);
    e.type = type;
    e.hp = hp;
    e.maxHp = hp;
    e.speed = speed;
    e.damage = damage;
    e.radius = radius;
    e.lastShot = 0;
    e.burnTimer = 0;
    e.burnTick = 0;

    const shadow = this.add.ellipse(0, radius, radius * 2.1, 10, 0x000000, 0.35);
    const body = this.add.circle(0, 0, radius, color);
    const eye1 = this.add.circle(-radius * 0.28, -radius * 0.2, Math.max(2, radius * 0.12), 0xffffff);
    const eye2 = this.add.circle(radius * 0.28, -radius * 0.2, Math.max(2, radius * 0.12), 0xffffff);
    const core = this.add.circle(0, radius * 0.12, radius * 0.34, 0x000000, 0.28);

    e.add([shadow, body, eye1, eye2, core]);

    e.hpBarBg = this.add.rectangle(x, y - radius - 13, radius * 2, 4, 0x220000).setDepth(25);
    e.hpBar = this.add.rectangle(x - radius, y - radius - 13, radius * 2, 4, 0xff3333).setOrigin(0, 0.5).setDepth(26);

    this.enemies.push(e);
    return e;
  }

  spawnEnemy() {
    let type = "goblin";
    const roll = Phaser.Math.Between(1, 100);
    if (roll > 65) type = "ember";
    if (this.roomType === "elite") type = "elite";

    const side = Phaser.Math.Between(0, 3);
    let x, y;

    if (side === 0) { x = Phaser.Math.Between(30, W - 30); y = 90; }
    else if (side === 1) { x = Phaser.Math.Between(30, W - 30); y = H - 260; }
    else if (side === 2) { x = 25; y = Phaser.Math.Between(110, H - 260); }
    else { x = W - 25; y = Phaser.Math.Between(110, H - 260); }

    this.createEnemy(x, y, type);
  }

  update(time, delta) {
    if (this.mode !== "combat") {
      this.updateWeather(delta);
      return;
    }

    this.updateMovement(delta);
    this.updateShooting(time);
    this.updateBullets(delta);
    this.updateEnemies(time, delta);
    this.updateEnemyShots(delta);
    this.updatePickups(delta);
    this.updateWeather(delta);
    this.updateRegen(delta);
    this.updateDash(delta);
    this.updateHUD();

    if (!this.cinematic && this.toSpawn > 0) {
      this.spawnTimer -= delta;
      if (this.spawnTimer <= 0) {
        this.spawnEnemy();
        this.toSpawn--;
        this.spawnTimer = this.roomType === "elite" ? 1250 : 700;
      }
    }

    if (!this.cinematic && this.toSpawn <= 0 && this.enemies.length === 0 && this.mode === "combat") {
      this.finishRoom();
    }
  }

  updateMovement(delta) {
    const dt = delta / 1000;

    let mx = this.move.x;
    let my = this.move.y;

    if (this.keys.A.isDown || this.keys.LEFT.isDown) mx -= 1;
    if (this.keys.D.isDown || this.keys.RIGHT.isDown) mx += 1;
    if (this.keys.W.isDown || this.keys.UP.isDown) my -= 1;
    if (this.keys.S.isDown || this.keys.DOWN.isDown) my += 1;

    const v = new Phaser.Math.Vector2(mx, my);
    if (v.length() > 1) v.normalize();

    this.player.x += v.x * this.stats.speed * dt;
    this.player.y += v.y * this.stats.speed * dt;

    this.player.x = Phaser.Math.Clamp(this.player.x, 24, W - 24);
    this.player.y = Phaser.Math.Clamp(this.player.y, 88, H - 130);

    if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) this.tryDash();
  }

  tryDash() {
    if (this.mode !== "combat") return;
    if (this.dashCharges <= 0) return;

    let dx = this.move.x;
    let dy = this.move.y;

    if (this.keys.A.isDown || this.keys.LEFT.isDown) dx -= 1;
    if (this.keys.D.isDown || this.keys.RIGHT.isDown) dx += 1;
    if (this.keys.W.isDown || this.keys.UP.isDown) dy -= 1;
    if (this.keys.S.isDown || this.keys.DOWN.isDown) dy += 1;

    const v = new Phaser.Math.Vector2(dx, dy);
    if (v.length() <= 0.05) v.set(0, -1);
    v.normalize();

    this.dashCharges--;

    this.player.x = Phaser.Math.Clamp(this.player.x + v.x * this.stats.dashRange, 24, W - 24);
    this.player.y = Phaser.Math.Clamp(this.player.y + v.y * this.stats.dashRange, 88, H - 130);

    this.cameras.main.shake(70, 0.005);
    this.add.circle(this.player.x, this.player.y, 30, 0x66ccff, 0.18).setDepth(10);

    this.time.delayedCall(900, () => {
      if (this.dashCharges < this.stats.dashCharges) this.dashCharges++;
    });
  }

  updateDash(delta) {
    this.dashDots.setText("⚡".repeat(this.dashCharges));
  }

  nearestEnemy() {
    let best = null;
    let bestD = Infinity;

    for (const e of this.enemies) {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, e.x, e.y);
      if (d < bestD && d <= this.stats.range) {
        best = e;
        bestD = d;
      }
    }

    return best;
  }

  updateShooting(time) {
    if (time - this.lastShot < this.stats.fireRate) return;

    const target = this.nearestEnemy();
    if (!target) return;

    this.lastShot = time;

    const count = Math.min(6, this.stats.multishot);
    for (let i = 0; i < count; i++) {
      this.time.delayedCall(i * 55, () => {
        if (!target || !target.active) return;
        this.fireBullet(target);
      });
    }
  }

  fireBullet(target) {
    const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, target.x, target.y);

    const b = this.add.circle(this.player.x, this.player.y, 5, this.stats.burn ? 0xff7733 : 0xffe38a).setDepth(40);
    b.vx = Math.cos(angle) * this.stats.bulletSpeed;
    b.vy = Math.sin(angle) * this.stats.bulletSpeed;
    b.damage = this.stats.damage;
    b.life = 850;
    b.bounces = this.stats.ricochet ? 1 : 0;

    this.bullets.push(b);
  }

  updateBullets(delta) {
    const dt = delta / 1000;

    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.life -= delta;

      let hit = null;
      for (const e of this.enemies) {
        const d = Phaser.Math.Distance.Between(b.x, b.y, e.x, e.y);
        if (d < e.radius + 6) {
          hit = e;
          break;
        }
      }

      if (hit) {
        this.damageEnemy(hit, b.damage);

        if (this.stats.burn) {
          hit.burnTimer = 2200;
          hit.burnTick = 0;
        }

        if (this.stats.lightning) {
          this.chainLightning(hit);
        }

        if (b.bounces > 0) {
          const next = this.enemies.find(e => e !== hit && Phaser.Math.Distance.Between(hit.x, hit.y, e.x, e.y) < 180);
          if (next) {
            const a = Phaser.Math.Angle.Between(b.x, b.y, next.x, next.y);
            b.vx = Math.cos(a) * this.stats.bulletSpeed;
            b.vy = Math.sin(a) * this.stats.bulletSpeed;
            b.damage *= 0.35;
            b.bounces--;
            continue;
          }
        }

        b.destroy();
        this.bullets.splice(i, 1);
        continue;
      }

      if (b.life <= 0 || b.x < -20 || b.x > W + 20 || b.y < -20 || b.y > H + 20) {
        b.destroy();
        this.bullets.splice(i, 1);
      }
    }
  }

  chainLightning(source) {
    const target = this.enemies.find(e => e !== source && Phaser.Math.Distance.Between(source.x, source.y, e.x, e.y) < 150);
    if (!target) return;

    const g = this.add.graphics().setDepth(45);
    g.lineStyle(3, 0x66ddff, 0.9);
    g.lineBetween(source.x, source.y, target.x, target.y);
    this.time.delayedCall(90, () => g.destroy());

    this.damageEnemy(target, this.stats.damage * 0.45);
  }

  damageEnemy(e, amount) {
    const crit = Math.random() < this.stats.critChance;
    const dmg = Math.floor(amount * (crit ? 2.2 : 1));

    e.hp -= dmg;
    e.hpBar.width = Math.max(0, (e.hp / e.maxHp) * e.radius * 2);

    this.floatText(e.x, e.y - e.radius, crit ? dmg + "!" : dmg, crit ? "#ffff66" : "#ffffff");
    this.addSpark(e.x, e.y, crit ? 0xffff66 : 0xffd080);

    if (e.hp <= 0) this.killEnemy(e);
  }

  killEnemy(e) {
    const idx = this.enemies.indexOf(e);
    if (idx >= 0) this.enemies.splice(idx, 1);

    if (e.hpBar) e.hpBar.destroy();
    if (e.hpBarBg) e.hpBarBg.destroy();

    const mult = this.stats.rewardMult || 1;
    this.dropPickup(e.x, e.y, "coin", Phaser.Math.Between(3, 7) * mult);
    if (Math.random() < 0.12) this.dropPickup(e.x, e.y, "heart", 1);
    if (Math.random() < 0.06) this.dropPickup(e.x, e.y, "gem", 1);

    if (this.stats.vampiric) {
      this.stats.hp = Math.min(this.stats.maxHp, this.stats.hp + 4);
    }

    this.addDeathBurst(e.x, e.y);
    e.destroy();
  }

  updateEnemies(time, delta) {
    const dt = delta / 1000;

    for (const e of [...this.enemies]) {
      if (!e.active) continue;

      if (e.burnTimer > 0) {
        e.burnTimer -= delta;
        e.burnTick -= delta;
        if (e.burnTick <= 0) {
          e.burnTick = 450;
          this.damageEnemy(e, 5);
        }
      }

      const angle = Phaser.Math.Angle.Between(e.x, e.y, this.player.x, this.player.y);
      const dist = Phaser.Math.Distance.Between(e.x, e.y, this.player.x, this.player.y);

      if (dist > 34 + e.radius) {
        e.x += Math.cos(angle) * e.speed * dt;
        e.y += Math.sin(angle) * e.speed * dt;
      } else {
        this.hitPlayer(e.damage);
        e.x -= Math.cos(angle) * 24;
        e.y -= Math.sin(angle) * 24;
      }

      if ((e.type === "goblin" || e.type === "ember" || e.type === "boss") && dist < 330 && time - e.lastShot > (e.type === "boss" ? 850 : 1700)) {
        e.lastShot = time;
        this.enemyShoot(e);
      }

      e.hpBarBg.setPosition(e.x, e.y - e.radius - 13);
      e.hpBar.setPosition(e.x - e.radius, e.y - e.radius - 13);
    }
  }

  enemyShoot(e) {
    if (e.type === "boss") {
      for (let i = -2; i <= 2; i++) {
        const a = Phaser.Math.Angle.Between(e.x, e.y, this.player.x, this.player.y) + i * 0.22;
        this.createEnemyShot(e.x, e.y, Math.cos(a) * 210, Math.sin(a) * 210, 15, 0xff2222, "straight");
      }
      return;
    }

    if (e.type === "goblin") {
      const a = Phaser.Math.Angle.Between(e.x, e.y, this.player.x, this.player.y);
      this.createEnemyShot(e.x, e.y, Math.cos(a) * 200, Math.sin(a) * 200, 12, 0xd8c090, "straight");
    }

    if (e.type === "ember") {
      const a = Phaser.Math.Angle.Between(e.x, e.y, this.player.x, this.player.y);
      const p = this.createEnemyShot(e.x, e.y, Math.cos(a) * 160, Math.sin(a) * 160, 13, 0xff6600, "homing");
      p.track = 800;
    }
  }

  createEnemyShot(x, y, vx, vy, dmg, color, type) {
    const p = this.add.circle(x, y, 6, color).setDepth(35);
    p.vx = vx;
    p.vy = vy;
    p.damage = dmg;
    p.type = type;
    p.life = 2800;
    p.track = 0;
    this.enemyShots.push(p);
    return p;
  }

  updateEnemyShots(delta) {
    const dt = delta / 1000;

    for (let i = this.enemyShots.length - 1; i >= 0; i--) {
      const p = this.enemyShots[i];

      if (p.type === "homing" && p.track > 0) {
        p.track -= delta;
        const a = Phaser.Math.Angle.Between(p.x, p.y, this.player.x, this.player.y);
        p.vx = Math.cos(a) * 175;
        p.vy = Math.sin(a) * 175;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= delta;

      const d = Phaser.Math.Distance.Between(p.x, p.y, this.player.x, this.player.y);
      if (d < 20) {
        this.hitPlayer(p.damage);
        p.destroy();
        this.enemyShots.splice(i, 1);
        continue;
      }

      if (p.life <= 0 || p.x < -30 || p.x > W + 30 || p.y < -30 || p.y > H + 30) {
        p.destroy();
        this.enemyShots.splice(i, 1);
      }
    }
  }

  hitPlayer(amount) {
    const dmg = Math.max(1, Math.floor(amount * (1 - this.stats.armor)));
    this.stats.hp -= dmg;
    this.floatText(this.player.x, this.player.y - 22, "-" + dmg, "#ff5555");
    this.cameras.main.shake(90, 0.006);

    this.playerBody.setFillStyle(0xff3333);
    this.time.delayedCall(80, () => {
      if (this.playerBody) this.playerBody.setFillStyle(0xf0c060);
    });

    if (this.stats.hp <= 0) this.gameOver();
  }

  dropPickup(x, y, type, value) {
    const p = this.add.image(x, y, type).setDepth(22);
    p.type = type;
    p.value = value;
    p.vx = Phaser.Math.Between(-40, 40);
    p.vy = Phaser.Math.Between(-40, 40);
    this.pickups.push(p);
  }

  updatePickups(delta) {
    const dt = delta / 1000;

    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const p = this.pickups[i];
      const d = Phaser.Math.Distance.Between(p.x, p.y, this.player.x, this.player.y);

      if (d < this.stats.magnet) {
        const a = Phaser.Math.Angle.Between(p.x, p.y, this.player.x, this.player.y);
        p.x += Math.cos(a) * 330 * dt;
        p.y += Math.sin(a) * 330 * dt;
      } else {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 0.95;
        p.vy *= 0.95;
      }

      if (d < 22) {
        this.collectPickup(p);
        this.pickups.splice(i, 1);
      }
    }
  }

  collectPickup(p) {
    if (p.type === "coin") {
      this.coins += p.value;
      this.floatText(p.x, p.y, "+" + p.value, "#ffe080");
    }

    if (p.type === "gem") {
      this.gems += p.value;
      this.floatText(p.x, p.y, "+GEM", "#66ddff");
    }

    if (p.type === "heart") {
      this.stats.hp = Math.min(this.stats.maxHp, this.stats.hp + 20);
      this.floatText(p.x, p.y, "+HP", "#ff7777");
    }

    p.destroy();
    this.saveGame();
  }

  updateRegen(delta) {
    if (!this.stats.regen) return;

    this.regenTimer -= delta;
    if (this.regenTimer <= 0) {
      this.regenTimer = 1000;
      this.stats.hp = Math.min(this.stats.maxHp, this.stats.hp + 1);
    }
  }

  updateWeather(delta) {
    if (!this.roomType) return;

    if (!this.weatherTimer) this.weatherTimer = 0;
    this.weatherTimer -= delta;
    if (this.weatherTimer > 0) return;

    if (this.roomType === "boss") this.weatherTimer = 60;
    else if (this.roomType === "elite" || this.roomType === "curse") this.weatherTimer = 120;
    else this.weatherTimer = 220;

    let color = 0xaaaaaa;
    let alpha = 0.18;
    let size = 2;
    let speed = 20;

    if (this.roomType === "elite" || this.roomType === "curse") {
      color = 0xff6a20;
      alpha = 0.65;
      size = 3;
      speed = 90;
    }

    if (this.roomType === "boss") {
      color = 0xcc0000;
      alpha = 0.65;
      size = 2;
      speed = 210;
    }

    const p = this.add.circle(Phaser.Math.Between(0, W), Phaser.Math.Between(80, 130), size, color, alpha).setDepth(5);
    p.vy = speed;
    p.vx = Phaser.Math.Between(-25, 25);
    p.life = 2400;
    this.weather.push(p);

    for (let i = this.weather.length - 1; i >= 0; i--) {
      const q = this.weather[i];
      q.x += q.vx * delta / 1000;
      q.y += q.vy * delta / 1000;
      q.life -= delta;
      q.alpha = Math.max(0, q.life / 2400);

      if (q.life <= 0 || q.y > H) {
        q.destroy();
        this.weather.splice(i, 1);
      }
    }
  }

  shockwave(x, y) {
    const ring = this.add.circle(x, y, 12, 0xffffff, 0.25).setStrokeStyle(4, 0xff5555).setDepth(90);
    this.tweens.add({
      targets: ring,
      scale: 9,
      alpha: 0,
      duration: 600,
      ease: "Cubic.Out",
      onComplete: () => ring.destroy()
    });
  }

  addSpark(x, y, color) {
    for (let i = 0; i < 6; i++) {
      const p = this.add.circle(x, y, 2, color, 0.9).setDepth(50);
      const a = Math.random() * Math.PI * 2;
      const dist = Phaser.Math.Between(15, 35);

      this.tweens.add({
        targets: p,
        x: x + Math.cos(a) * dist,
        y: y + Math.sin(a) * dist,
        alpha: 0,
        duration: 260,
        onComplete: () => p.destroy()
      });
    }
  }

  addDeathBurst(x, y) {
    for (let i = 0; i < 10; i++) {
      const p = this.add.circle(x, y, Phaser.Math.Between(2, 4), 0xff7040, 0.9).setDepth(48);
      const a = Math.random() * Math.PI * 2;
      const dist = Phaser.Math.Between(25, 55);

      this.tweens.add({
        targets: p,
        x: x + Math.cos(a) * dist,
        y: y + Math.sin(a) * dist,
        alpha: 0,
        duration: 360,
        onComplete: () => p.destroy()
      });
    }
  }

  floatText(x, y, text, color) {
    const t = this.add.text(x, y, text, {
      fontSize: "14px",
      color,
      stroke: "#000",
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(120);

    this.tweens.add({
      targets: t,
      y: y - 34,
      alpha: 0,
      duration: 650,
      onComplete: () => t.destroy()
    });
  }

  toast(text, color = "#ffffff") {
    const t = this.add.text(W / 2, 115, text, {
      fontSize: "15px",
      color,
      align: "center",
      wordWrap: { width: W - 40 },
      stroke: "#000",
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(500);

    this.tweens.add({
      targets: t,
      y: 82,
      alpha: 0,
      delay: 1100,
      duration: 450,
      onComplete: () => t.destroy()
    });
  }

  finishRoom() {
    this.mode = "reward";

    const rewardGems = this.roomType === "boss" ? 5 : this.roomType === "elite" ? 2 : this.roomType === "curse" ? 2 : 1;
    const rewardCoins = this.roomType === "boss" ? 45 : this.roomType === "elite" ? 28 : this.roomType === "curse" ? 32 : 16;

    this.coins += rewardCoins;
    this.gems += rewardGems;

    for (const p of this.pickups) {
      if (p && p.destroy) p.destroy();
    }
    this.pickups = [];

    this.saveGame();

    this.setHUDVisible(false);

    const panel = this.add.rectangle(W / 2, H / 2, W - 50, 250, 0x100b16, 0.96).setStrokeStyle(2, 0xc8952a).setDepth(300);
    const title = this.add.text(W / 2, H / 2 - 80, this.roomType === "boss" ? "BOSS DEFEATED!" : "ROOM CLEARED!", {
      fontSize: "24px",
      color: "#ffe080",
      stroke: "#000",
      strokeThickness: 5
    }).setOrigin(0.5).setDepth(301);

    const rewards = this.add.text(W / 2, H / 2 - 20, "+" + rewardCoins + " Coins\n+" + rewardGems + " Gems", {
      fontSize: "18px",
      color: "#ffffff",
      align: "center",
      stroke: "#000",
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(301);

    this.makeButton(W / 2, H / 2 + 75, 190, 38, "CONTINUE", 0x214d25, () => {
      panel.destroy();
      title.destroy();
      rewards.destroy();

      this.wave++;

      if (this.wave > this.maxWave) {
        this.chapter++;
        this.wave = 1;
        this.roomTypes = this.generateRooms();

        if (this.chapter === 4) {
          this.toast("Shadow Rogue unlocked!", "#d966ff");
        }
      }

      this.saveGame();
      this.showMap();
    }, this.menuUI);
  }

  gameOver() {
    this.mode = "dead";
    this.clearCombat();
    this.setHUDVisible(false);

    const panel = this.add.rectangle(W / 2, H / 2, W - 48, 230, 0x16070a, 0.97).setStrokeStyle(2, 0xff4444).setDepth(400);
    const title = this.add.text(W / 2, H / 2 - 68, "DEFEATED", {
      fontSize: "28px",
      color: "#ff5555",
      stroke: "#000",
      strokeThickness: 6
    }).setOrigin(0.5).setDepth(401);

    const msg = this.add.text(W / 2, H / 2 - 12, "You keep your coins and gems.\nTry another route.", {
      fontSize: "15px",
      color: "#ffffff",
      align: "center",
      stroke: "#000",
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(401);

    this.makeButton(W / 2, H / 2 + 70, 180, 38, "BACK TO MAP", 0x241838, () => {
      panel.destroy();
      title.destroy();
      msg.destroy();
      this.showMap();
    }, this.menuUI);
  }

  updateHUD() {
    if (!this.stats) return;

    const pct = Phaser.Math.Clamp(this.stats.hp / this.stats.maxHp, 0, 1);
    this.hpFill.width = 150 * pct;
    this.hpText.setText(Math.ceil(this.stats.hp) + "/" + this.stats.maxHp);
    this.infoText.setText("Chapter " + this.chapter + "  Wave " + this.wave + "/" + this.maxWave + "  " + this.roomIcon(this.roomType));
    this.currencyText.setText("🪙 " + this.coins + "  💎 " + this.gems);
    this.dashDots.setText("⚡".repeat(this.dashCharges));
  }
}

const config = {
  type: Phaser.AUTO,
  parent: "game",
  width: W,
  height: H,
  backgroundColor: "#04030a",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [GameScene]
};

window.addEventListener("load", () => {
  new Phaser.Game(config);
});