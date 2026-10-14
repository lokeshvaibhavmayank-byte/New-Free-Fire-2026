import * as THREE from 'three';
import {
  CharacterDef,
  DamageNumber,
  GameMode,
  GlooWallObject,
  KillFeedItem,
  LootItem,
  MatchStats,
  OutfitBundle,
  PlayerState,
  SafeZoneState,
  WeaponType,
} from '../types/game';
import { WEAPONS } from './weapons';
import { CHARACTERS } from './characters';
import { OUTFIT_BUNDLES } from './outfits';
import { EMOTES } from './emotes';
import {
  animateEmote,
  createAirdropMesh,
  createCharacterMesh,
  createGlooWallMesh,
  createTrainingDummyMesh,
  createWeaponMesh,
} from './models';
import { buildBermudaMap, BermudaMapData } from './map';
import { BotManager } from './ai';
import { sounds } from './audio';

export interface GameEngineCallbacks {
  onStateUpdate: (player: PlayerState, aliveCount: number, safeZone: SafeZoneState) => void;
  onKillFeed: (item: KillFeedItem) => void;
  onDamageNumber: (num: DamageNumber) => void;
  onGameOver: (stats: MatchStats) => void;
  onCrosshairTarget: (isTargetingEnemy: boolean) => void;
  onToggleEmoteWheel?: () => void;
}

export class GameEngine {
  private container: HTMLElement;
  private callbacks: GameEngineCallbacks;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private clock!: THREE.Clock;

  // Game Entities
  private mapData!: BermudaMapData;
  private botManager!: BotManager;
  private playerMesh!: THREE.Group;
  private currentWeaponMesh: THREE.Group | null = null;
  private glooWalls: GlooWallObject[] = [];
  private lootItems: LootItem[] = [];
  private airdropMesh: THREE.Group | null = null;
  private safeZoneMesh!: THREE.Mesh;
  private nextSafeZoneMesh!: THREE.Mesh;

  // Game State
  public player!: PlayerState;
  public character!: CharacterDef;
  public safeZone!: SafeZoneState;
  public isRunning: boolean = false;
  private matchStats: MatchStats = {
    kills: 0,
    damageDealt: 0,
    headshots: 0,
    rankPointsGained: 0,
    survivalTimeSeconds: 0,
    position: 25,
    totalPlayers: 25,
    booyah: false,
  };

  // Input states
  public keys: Record<string, boolean> = {
    w: false,
    a: false,
    s: false,
    d: false,
    space: false,
    shift: false,
    c: false,
  };
  public virtualStick: { x: number; y: number } = { x: 0, y: 0 };
  public mouseLook: { yaw: number; pitch: number } = { yaw: 0, pitch: 0.15 };
  public isPointerLocked: boolean = false;

  // Animation frame id
  private animFrameId: number | null = null;

  public mode: GameMode = 'bermuda';
  public outfit: OutfitBundle;
  private trainingDummies: { mesh: THREE.Group; hp: number; id: string }[] = [];

  constructor(
    container: HTMLElement,
    characterId: string,
    outfitId: string = 'default',
    mode: GameMode = 'bermuda',
    callbacks: GameEngineCallbacks
  ) {
    this.container = container;
    this.callbacks = callbacks;
    this.mode = mode;

    const foundChar = CHARACTERS.find(c => c.id === characterId) || CHARACTERS[0];
    this.character = foundChar;

    const foundOutfit = OUTFIT_BUNDLES.find(o => o.id === outfitId) || OUTFIT_BUNDLES[0];
    this.outfit = foundOutfit;

    this.initPlayer();
    this.initSafeZone();
    this.initThree();
    this.initBermuda();
    this.initBots();
    this.setupListeners();
  }

  private initPlayer() {
    let spawnX = 0;
    let spawnZ = 75;

    if (this.mode === 'clash_squad') {
      spawnX = -50;
      spawnZ = 35;
    } else if (this.mode === 'lone_wolf') {
      spawnX = 0;
      spawnZ = 15;
    } else if (this.mode === 'training') {
      spawnX = 65;
      spawnZ = 45;
    }

    const isInfiniteAmmo = this.mode === 'training';

    this.player = {
      x: spawnX,
      y: 0.5,
      z: spawnZ,
      rotationY: 0,
      pitch: 0.1,
      vx: 0,
      vy: 0,
      vz: 0,
      hp: 200,
      maxHp: 200,
      ep: 150,
      maxEp: 200,
      armor: 100, // Level 3 Vest
      helmet: 100, // Level 3 Helmet
      isDead: false,
      isGrounded: true,
      isCrouching: false,
      isSprinting: false,
      isAiming: false,
      isFiring: false,
      activeSkillCooldown: 0,
      activeSkillTimer: 0,
      selectedWeaponIndex: 0,
      weapons: [
        { weapon: WEAPONS.mp40, currentAmmo: 32, reserveAmmo: isInfiniteAmmo ? 9999 : 180 },
        { weapon: WEAPONS.m1887, currentAmmo: 2, reserveAmmo: isInfiniteAmmo ? 9999 : 30 },
        { weapon: WEAPONS.ak47, currentAmmo: 30, reserveAmmo: isInfiniteAmmo ? 9999 : 150 },
        { weapon: WEAPONS.awm, currentAmmo: 5, reserveAmmo: isInfiniteAmmo ? 9999 : 35 },
        { weapon: WEAPONS.deagle, currentAmmo: 7, reserveAmmo: isInfiniteAmmo ? 9999 : 45 },
      ],
      glooWallCount: isInfiniteAmmo ? 99 : 3,
      medkitCount: isInfiniteAmmo ? 99 : 4,
      isHealing: false,
      healProgress: 0,
      currentEmote: null,
      emoteTimer: 0,
      outfitId: this.outfit.id,
    };
  }

  private initSafeZone() {
    if (this.mode === 'training') {
      // Training mode: No safe zone hazard
      this.safeZone = {
        currentCenter: { x: 0, z: 0 },
        currentRadius: 500,
        nextCenter: { x: 0, z: 0 },
        nextRadius: 500,
        isShrinking: false,
        shrinkTimer: 9999,
        totalShrinkDuration: 9999,
        damagePerTick: 0,
      };
    } else if (this.mode === 'clash_squad') {
      // Clash Squad: Clock Tower tight zone
      this.safeZone = {
        currentCenter: { x: -60, z: 40 },
        currentRadius: 55,
        nextCenter: { x: -60, z: 40 },
        nextRadius: 30,
        isShrinking: false,
        shrinkTimer: 30,
        totalShrinkDuration: 25,
        damagePerTick: 6.0,
      };
    } else if (this.mode === 'lone_wolf') {
      // Lone Wolf: Peak duel ring
      this.safeZone = {
        currentCenter: { x: 0, z: 0 },
        currentRadius: 35,
        nextCenter: { x: 0, z: 0 },
        nextRadius: 20,
        isShrinking: false,
        shrinkTimer: 25,
        totalShrinkDuration: 20,
        damagePerTick: 8.0,
      };
    } else {
      // Classic Bermuda Battle Royale
      this.safeZone = {
        currentCenter: { x: 0, z: 0 },
        currentRadius: 160,
        nextCenter: { x: (Math.random() - 0.5) * 40, z: (Math.random() - 0.5) * 40 },
        nextRadius: 90,
        isShrinking: false,
        shrinkTimer: 45,
        totalShrinkDuration: 30,
        damagePerTick: 3.5,
      };
    }
  }

  private initThree() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb); // Bermuda sunny sky
    this.scene.fog = new THREE.FogExp2(0xa7d8ff, 0.0035);

    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(65, aspect, 0.1, 600);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);
    this.clock = new THREE.Clock();

    // Studio Lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.9);
    hemiLight.position.set(0, 100, 0);
    this.scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfff7ed, 1.4);
    dirLight.position.set(60, 120, 50);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 300;
    dirLight.shadow.camera.left = -120;
    dirLight.shadow.camera.right = 120;
    dirLight.shadow.camera.top = 120;
    dirLight.shadow.camera.bottom = -120;
    dirLight.shadow.bias = -0.0003;
    this.scene.add(dirLight);

    // Player Mesh with Outfit
    this.playerMesh = createCharacterMesh(this.character, this.outfit);
    this.playerMesh.position.set(this.player.x, this.player.y, this.player.z);
    this.scene.add(this.playerMesh);
    this.equipWeaponMesh(this.player.weapons[0].weapon.id);

    // Safe Zone Storm Wall (Electric Blue Cylinder)
    const szGeo = new THREE.CylinderGeometry(this.safeZone.currentRadius, this.safeZone.currentRadius, 80, 48, 1, true);
    const szMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide,
    });
    this.safeZoneMesh = new THREE.Mesh(szGeo, szMat);
    this.safeZoneMesh.position.y = 40;
    this.scene.add(this.safeZoneMesh);

    // Next Safe Zone Ring Indicator (White outline on ground)
    const ringGeo = new THREE.RingGeometry(this.safeZone.nextRadius - 0.4, this.safeZone.nextRadius + 0.4, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
    this.nextSafeZoneMesh = new THREE.Mesh(ringGeo, ringMat);
    this.nextSafeZoneMesh.rotation.x = -Math.PI / 2;
    this.nextSafeZoneMesh.position.set(this.safeZone.nextCenter.x, 0.15, this.safeZone.nextCenter.z);
    this.scene.add(this.nextSafeZoneMesh);
  }

  private initBermuda() {
    this.mapData = buildBermudaMap();
    this.scene.add(this.mapData.group);

    // Spawn Airdrop in the distance
    this.airdropMesh = createAirdropMesh();
    this.airdropMesh.position.set(10, 0, -10);
    this.scene.add(this.airdropMesh);
  }

  private initBots() {
    this.botManager = new BotManager(this.scene);

    if (this.mode === 'training') {
      // Training mode: Spawn 6 target practice dummies
      const dummyPositions = [
        { x: 65, z: 25 },
        { x: 65, z: 10 },
        { x: 50, z: 25 },
        { x: 80, z: 20 },
        { x: 65, z: -10 },
        { x: 40, z: 40 },
      ];
      dummyPositions.forEach((pos, idx) => {
        const dummy = createTrainingDummyMesh();
        dummy.position.set(pos.x, 0, pos.z);
        this.scene.add(dummy);
        this.trainingDummies.push({ mesh: dummy, hp: 1000, id: `dummy_${idx}` });
      });
    } else if (this.mode === 'lone_wolf') {
      // 1v1 intense duel
      this.botManager.spawnBots(1, [{ x: 0, y: 0.5, z: -15 }]);
    } else if (this.mode === 'clash_squad') {
      // 4v4 Clock Tower clash
      this.botManager.spawnBots(4, [
        { x: -65, y: 0.5, z: 52 },
        { x: -70, y: 0.5, z: 45 },
        { x: -55, y: 0.5, z: 55 },
        { x: -60, y: 0.5, z: 60 },
      ]);
    } else {
      // Classic Bermuda BR (24 bots)
      this.botManager.spawnBots(24, this.mapData.playerSpawns);
    }
  }

  private equipWeaponMesh(weaponId: WeaponType) {
    const anchor = this.playerMesh.getObjectByName('weaponAnchor');
    if (!anchor) return;

    if (this.currentWeaponMesh) {
      anchor.remove(this.currentWeaponMesh);
    }
    this.currentWeaponMesh = createWeaponMesh(weaponId);
    anchor.add(this.currentWeaponMesh);
  }

  private setupListeners() {
    // Keyboard handlers
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key in this.keys) this.keys[key] = true;
      if (e.code === 'Space') {
        this.keys.space = true;
        this.jump();
      }
      if (key === 'c') {
        this.player.isCrouching = !this.player.isCrouching;
      }
      if (key === 'r') {
        this.reload();
      }
      if (key === 'g') {
        this.deployGlooWall();
      }
      if (key === 'e') {
        this.triggerCharacterSkill();
      }
      if (key === 'h' || key === 'v') {
        this.useMedkit();
      }
      if (['1', '2', '3', '4', '5'].includes(key)) {
        const idx = parseInt(key) - 1;
        this.selectWeapon(idx);
      }
      if (key === 'b') {
        this.callbacks.onToggleEmoteWheel?.();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key in this.keys) this.keys[key] = false;
      if (e.code === 'Space') this.keys.space = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // Pointer lock & mouse movement
    const onMouseMove = (e: MouseEvent) => {
      if (this.isPointerLocked) {
        const sens = this.player.isAiming ? 0.0012 : 0.0022;
        this.mouseLook.yaw -= e.movementX * sens;
        this.mouseLook.pitch -= e.movementY * sens;
        this.mouseLook.pitch = Math.max(-0.6, Math.min(0.8, this.mouseLook.pitch));
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        this.player.isFiring = true;
        this.fireWeapon();
      } else if (e.button === 2) {
        e.preventDefault();
        this.player.isAiming = !this.player.isAiming;
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      if (e.button === 0) {
        this.player.isFiring = false;
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    this.container.addEventListener('contextmenu', e => e.preventDefault());

    // Window resize
    const onResize = () => {
      if (!this.container || !this.renderer) return;
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);
  }

  public requestPointerLock() {
    this.container.requestPointerLock?.();
    this.isPointerLocked = true;
  }

  public exitPointerLock() {
    document.exitPointerLock?.();
    this.isPointerLocked = false;
  }

  public start() {
    this.isRunning = true;
    this.clock.start();
    this.loop();
  }

  public stop() {
    this.isRunning = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private loop = () => {
    if (!this.isRunning) return;
    this.animFrameId = requestAnimationFrame(this.loop);

    const delta = Math.min(this.clock.getDelta(), 0.1);
    this.update(delta);
    this.renderer.render(this.scene, this.camera);
  };

  private update(delta: number) {
    if (this.player.isDead) return;

    this.matchStats.survivalTimeSeconds += delta;

    // 1. Update Safe Zone
    this.updateSafeZone(delta);

    // 2. Update Character Skills & Medkits
    this.updateSkillsAndHealth(delta);

    // 3. Player Movement & Physics
    this.updatePlayerMovement(delta);

    // 4. Update Camera Orbit & Follow
    this.updateCamera(delta);

    // 5. Update Continuous Firing
    if (this.player.isFiring) {
      const curWep = this.player.weapons[this.player.selectedWeaponIndex];
      if (curWep.weapon.fireRate < 0.2) {
        this.fireWeapon();
      }
    }

    // 6. Crosshair Raycasting for Free Fire Red Auto-Aim Assist
    this.updateAimAssist();

    // 7. Update Bots
    this.botManager.update(
      delta,
      { x: this.player.x, y: this.player.y, z: this.player.z },
      this.player.hp,
      this.safeZone,
      (dmg, isHeadshot, attacker) => {
        this.takeDamage(dmg, isHeadshot, attacker);
      },
      item => this.callbacks.onKillFeed(item),
      num => this.callbacks.onDamageNumber(num),
      (gx, gy, gz, rotY, ownerId) => {
        this.spawnGlooWallObject(gx, gy, gz, rotY, ownerId);
      }
    );

    // 8. Check Victory (Booyah!) condition
    const aliveBots = this.botManager.getAliveCount();
    const totalAlive = (this.player.isDead ? 0 : 1) + aliveBots;

    if (aliveBots === 0 && !this.player.isDead && !this.matchStats.booyah) {
      this.triggerBooyah();
    }

    // State callback to React HUD
    this.callbacks.onStateUpdate(this.player, totalAlive, this.safeZone);
  }

  private updateSafeZone(delta: number) {
    this.safeZone.shrinkTimer -= delta;

    if (this.safeZone.shrinkTimer <= 0) {
      if (!this.safeZone.isShrinking) {
        this.safeZone.isShrinking = true;
        this.safeZone.shrinkTimer = this.safeZone.totalShrinkDuration;
        sounds.playSafeZoneAlarm();
      } else {
        // Finished shrinking, prepare next circle
        this.safeZone.isShrinking = false;
        this.safeZone.shrinkTimer = 40;
        this.safeZone.currentRadius = this.safeZone.nextRadius;
        this.safeZone.currentCenter = { ...this.safeZone.nextCenter };
        this.safeZone.nextRadius = Math.max(20, this.safeZone.currentRadius * 0.55);
        this.safeZone.nextCenter = {
          x: this.safeZone.currentCenter.x + (Math.random() - 0.5) * (this.safeZone.currentRadius * 0.4),
          z: this.safeZone.currentCenter.z + (Math.random() - 0.5) * (this.safeZone.currentRadius * 0.4),
        };
        this.safeZone.damagePerTick += 2.0;

        // Reposition next safe circle
        this.nextSafeZoneMesh.position.set(this.safeZone.nextCenter.x, 0.15, this.safeZone.nextCenter.z);
        this.nextSafeZoneMesh.scale.set(this.safeZone.nextRadius / 90, this.safeZone.nextRadius / 90, 1);
      }
    }

    if (this.safeZone.isShrinking) {
      const progress = 1 - this.safeZone.shrinkTimer / this.safeZone.totalShrinkDuration;
      const curR = THREE.MathUtils.lerp(this.safeZone.currentRadius, this.safeZone.nextRadius, progress);
      const curX = THREE.MathUtils.lerp(this.safeZone.currentCenter.x, this.safeZone.nextCenter.x, progress);
      const curZ = THREE.MathUtils.lerp(this.safeZone.currentCenter.z, this.safeZone.nextCenter.z, progress);

      this.safeZoneMesh.scale.set(curR / 160, 1, curR / 160);
      this.safeZoneMesh.position.set(curX, 40, curZ);
    }

    // Damage player if outside safe zone
    const distFromCenter = Math.hypot(
      this.player.x - this.safeZone.currentCenter.x,
      this.player.z - this.safeZone.currentCenter.z
    );
    if (distFromCenter > (this.safeZone.isShrinking ? this.safeZone.nextRadius : this.safeZone.currentRadius)) {
      this.player.hp = Math.max(0, this.player.hp - this.safeZone.damagePerTick * delta * 2);
      if (this.player.hp <= 0 && !this.player.isDead) {
        this.handlePlayerDeath('The Storm');
      }
    }
  }

  private updateSkillsAndHealth(delta: number) {
    // Alok Active Skill countdown & aura
    if (this.player.activeSkillTimer > 0) {
      this.player.activeSkillTimer -= delta;
      if (this.character.id === 'alok') {
        // Heal +5 HP/sec
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + 5 * delta);
      }
      if (this.player.activeSkillTimer <= 0) {
        this.player.activeSkillCooldown = this.character.skillCooldown;
        const aura = this.playerMesh.getObjectByName('alokAura') as THREE.Mesh;
        if (aura) (aura.material as THREE.MeshBasicMaterial).opacity = 0;
        const chronoShield = this.playerMesh.getObjectByName('chronoShield') as THREE.Mesh;
        if (chronoShield) (chronoShield.material as THREE.MeshPhysicalMaterial).opacity = 0;
        const wukongBush = this.playerMesh.getObjectByName('wukongBush');
        if (wukongBush) wukongBush.visible = false;
      }
    } else if (this.player.activeSkillCooldown > 0) {
      this.player.activeSkillCooldown = Math.max(0, this.player.activeSkillCooldown - delta);
    }

    // EP to HP conversion (Free Fire signature EP consumption)
    if (this.player.hp < this.player.maxHp && this.player.ep > 0) {
      const epToHp = 2 * delta;
      this.player.ep = Math.max(0, this.player.ep - epToHp);
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + epToHp);
    }

    // Medkit healing progress
    if (this.player.isHealing) {
      const healTotalTime = this.character.id === 'maxim' ? 2.0 : 4.0;
      this.player.healProgress += delta / healTotalTime;
      if (this.player.healProgress >= 1.0) {
        this.player.isHealing = false;
        this.player.healProgress = 0;
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + 75);
        this.player.ep = Math.min(this.player.maxEp, this.player.ep + 50);
        sounds.playMedkit();
      }
    }
  }

  private updatePlayerMovement(delta: number) {
    let moveForward = 0;
    let moveRight = 0;

    if (this.keys.w) moveForward += 1;
    if (this.keys.s) moveForward -= 1;
    if (this.keys.d) moveRight += 1;
    if (this.keys.a) moveRight -= 1;

    // Virtual stick input (mobile/touch)
    if (this.virtualStick.x !== 0 || this.virtualStick.y !== 0) {
      moveRight += this.virtualStick.x;
      moveForward += this.virtualStick.y;
    }

    // Base speed calculation with Character Skills
    let speed = 9.0;
    if (this.player.isCrouching) speed = 4.5;
    if (this.player.isAiming) speed = 5.0;

    // Kelly Passive Speed Boost (+18%)
    if (this.character.id === 'kelly') speed *= 1.18;

    // Alok Active Skill Speed Boost (+25%)
    if (this.player.activeSkillTimer > 0 && this.character.id === 'alok') speed *= 1.25;

    // Apply movement relative to camera yaw
    if (moveForward !== 0 || moveRight !== 0) {
      // Moving cancels active emote
      if (this.player.currentEmote) {
        this.player.currentEmote = null;
        this.player.emoteTimer = 0;
      }

      const moveAngle = Math.atan2(moveRight, moveForward);
      const worldAngle = this.mouseLook.yaw + moveAngle;

      this.player.vx = Math.sin(worldAngle) * speed;
      this.player.vz = Math.cos(worldAngle) * speed;
      this.player.rotationY = this.mouseLook.yaw;

      // Leg running animation
      const runCycle = Math.sin(Date.now() * 0.015) * 0.55;
      const leftLeg = this.playerMesh.getObjectByName('leftLeg');
      const rightLeg = this.playerMesh.getObjectByName('rightLeg');
      if (leftLeg && rightLeg) {
        leftLeg.rotation.x = runCycle;
        rightLeg.rotation.x = -runCycle;
      }
    } else {
      this.player.vx = 0;
      this.player.vz = 0;
      this.player.rotationY = this.mouseLook.yaw;

      // Emote playback while standing still
      if (this.player.currentEmote && this.player.emoteTimer > 0) {
        this.player.emoteTimer -= delta;
        const emoteDef = EMOTES.find(e => e.id === this.player.currentEmote);
        const duration = emoteDef ? emoteDef.duration : 3.0;
        animateEmote(this.playerMesh, this.player.currentEmote, duration - this.player.emoteTimer);
        if (this.player.emoteTimer <= 0) {
          this.player.currentEmote = null;
        }
      }
    }

    // Gravity & Jump Physics
    if (!this.player.isGrounded) {
      this.player.vy -= 22 * delta;
    }
    this.player.y += this.player.vy * delta;

    if (this.player.y <= 0.5) {
      this.player.y = 0.5;
      this.player.vy = 0;
      this.player.isGrounded = true;
    }

    // Apply position
    this.player.x += this.player.vx * delta;
    this.player.z += this.player.vz * delta;

    // Simple bounds check
    this.player.x = Math.max(-190, Math.min(190, this.player.x));
    this.player.z = Math.max(-190, Math.min(190, this.player.z));

    this.playerMesh.position.set(this.player.x, this.player.y, this.player.z);
    this.playerMesh.rotation.y = this.player.rotationY;
  }

  private updateCamera(delta: number) {
    // Shoulder offset camera (Free Fire third-person perspective)
    const camDist = this.player.isAiming ? 2.2 : 5.2;
    const shoulderOffset = this.player.isAiming ? 0.7 : 0.85;
    const targetHeight = this.player.isCrouching ? 1.4 : 2.1;

    const cosPitch = Math.cos(this.mouseLook.pitch);
    const sinPitch = Math.sin(this.mouseLook.pitch);
    const sinYaw = Math.sin(this.mouseLook.yaw);
    const cosYaw = Math.cos(this.mouseLook.yaw);

    const camX = this.player.x - sinYaw * camDist * cosPitch + cosYaw * shoulderOffset;
    const camY = this.player.y + targetHeight + sinPitch * camDist;
    const camZ = this.player.z - cosYaw * camDist * cosPitch - sinYaw * shoulderOffset;

    // Smooth exponential damping
    this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, camX, 18, delta);
    this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, camY, 18, delta);
    this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, camZ, 18, delta);

    // Look at point slightly above player head
    const lookTarget = new THREE.Vector3(
      this.player.x + cosYaw * shoulderOffset * 0.4,
      this.player.y + targetHeight,
      this.player.z - sinYaw * shoulderOffset * 0.4
    );
    this.camera.lookAt(lookTarget);

    // FOV zoom for Scope Aiming (AWM Sniper / AR zoom)
    const targetFov = this.player.isAiming
      ? this.player.weapons[this.player.selectedWeaponIndex].weapon.id === 'awm'
        ? 22
        : 40
      : 65;
    this.camera.fov = THREE.MathUtils.damp(this.camera.fov, targetFov, 15, delta);
    this.camera.updateProjectionMatrix();
  }

  private updateAimAssist() {
    // Cast ray from center of screen
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);

    const botMeshes = this.botManager.bots.filter(b => !b.isDead && b.mesh).map(b => b.mesh!);
    const intersects = raycaster.intersectObjects(botMeshes, true);

    const isHovering = intersects.length > 0 && intersects[0].distance < 120;
    this.callbacks.onCrosshairTarget(isHovering);
  }

  public jump() {
    if (this.player.isGrounded) {
      this.player.vy = 8.5;
      this.player.isGrounded = false;
    }
  }

  public selectWeapon(index: number) {
    if (index >= 0 && index < this.player.weapons.length) {
      this.player.selectedWeaponIndex = index;
      this.equipWeaponMesh(this.player.weapons[index].weapon.id);
      sounds.playClick();
    }
  }

  public reload() {
    const cur = this.player.weapons[this.player.selectedWeaponIndex];
    if (cur.currentAmmo < cur.weapon.magazineSize && cur.reserveAmmo > 0) {
      sounds.playReload();
      setTimeout(() => {
        const needed = cur.weapon.magazineSize - cur.currentAmmo;
        const available = Math.min(needed, cur.reserveAmmo);
        cur.currentAmmo += available;
        cur.reserveAmmo -= available;
      }, cur.weapon.reloadTime * 1000);
    }
  }

  public fireWeapon() {
    const cur = this.player.weapons[this.player.selectedWeaponIndex];
    if (cur.currentAmmo <= 0) {
      this.reload();
      return;
    }

    cur.currentAmmo--;
    sounds.playGunshot(cur.weapon.id as any);

    // Muzzle flash particle
    this.createMuzzleFlash();

    // Raycast hit detection
    const raycaster = new THREE.Raycaster();
    const spread = this.player.isAiming ? cur.weapon.spread * 0.4 : cur.weapon.spread;
    const spreadX = (Math.random() - 0.5) * spread;
    const spreadY = (Math.random() - 0.5) * spread;
    raycaster.setFromCamera(new THREE.Vector2(spreadX, spreadY), this.camera);

    // Check hit against Gloo walls first
    const glooMeshes = this.glooWalls.map(g => g.mesh);
    const glooHits = raycaster.intersectObjects(glooMeshes, true);

    const botMeshes = this.botManager.bots.filter(b => !b.isDead && b.mesh).map(b => b.mesh!);
    const botHits = raycaster.intersectObjects(botMeshes, true);

    if (glooHits.length > 0 && (botHits.length === 0 || glooHits[0].distance < botHits[0].distance)) {
      // Hit a Gloo Wall
      const hitWall = this.glooWalls.find(g => g.mesh === glooHits[0].object.parent || g.mesh === glooHits[0].object);
      if (hitWall) {
        hitWall.hp -= cur.weapon.damage;
        if (hitWall.hp <= 0) {
          this.scene.remove(hitWall.mesh);
          this.glooWalls = this.glooWalls.filter(w => w.id !== hitWall.id);
        }
      }
      return;
    }

    if (this.mode === 'training' && this.trainingDummies.length > 0) {
      const dummyMeshes = this.trainingDummies.map(d => d.mesh);
      const dummyHits = raycaster.intersectObjects(dummyMeshes, true);
      if (dummyHits.length > 0) {
        const dHit = dummyHits[0];
        const isHeadshot = dHit.point.y > 1.9;
        let baseDmg = cur.weapon.damage;
        if (isHeadshot) baseDmg *= cur.weapon.headshotMultiplier;
        const finalDamage = Math.round(baseDmg);
        this.matchStats.damageDealt += finalDamage;
        if (isHeadshot) this.matchStats.headshots++;
        sounds.playHitMarker(isHeadshot);
        this.callbacks.onDamageNumber({
          id: Math.random().toString(),
          x: dHit.point.x,
          y: dHit.point.y + 0.3,
          z: dHit.point.z,
          amount: finalDamage,
          isHeadshot,
          lifetime: 1.0,
        });
        return;
      }
    }

    if (botHits.length > 0) {
      const hit = botHits[0];
      const botMesh = hit.object.parent as THREE.Group;
      const bot = this.botManager.bots.find(b => b.mesh === botMesh || b.mesh === hit.object);

      if (bot) {
        // Headshot detection: hit point near head height (> 1.85m)
        const hitLocalY = hit.point.y - bot.y;
        const isHeadshot = hitLocalY > 1.85;

        // Damage calculation
        let baseDmg = cur.weapon.damage;
        if (isHeadshot) baseDmg *= cur.weapon.headshotMultiplier;

        // Hayato Passive Bushido bonus (more damage as player HP is lower)
        if (this.character.id === 'hayato') {
          const hpLostPercent = (this.player.maxHp - this.player.hp) / this.player.maxHp;
          baseDmg *= 1 + hpLostPercent * 0.8;
        }

        const finalDamage = Math.round(baseDmg);
        this.matchStats.damageDealt += finalDamage;
        if (isHeadshot) this.matchStats.headshots++;

        sounds.playHitMarker(isHeadshot);

        const killed = this.botManager.damageBot(
          bot.id,
          finalDamage,
          isHeadshot,
          'YOU',
          cur.weapon.name,
          item => this.callbacks.onKillFeed(item),
          num => this.callbacks.onDamageNumber(num)
        );

        if (killed) {
          this.matchStats.kills++;
          // Wukong skill resets on kill!
          if (this.character.id === 'wukong') {
            this.player.activeSkillCooldown = 0;
          }
        }
      }
    }
  }

  private createMuzzleFlash() {
    const flashLight = new THREE.PointLight(0xffa500, 3, 8);
    flashLight.position.set(this.player.x, this.player.y + 1.4, this.player.z);
    this.scene.add(flashLight);
    setTimeout(() => this.scene.remove(flashLight), 45);
  }

  public deployGlooWall() {
    if (this.player.glooWallCount <= 0) return;
    this.player.glooWallCount--;

    const deployDist = 3.8;
    const gx = this.player.x + Math.sin(this.player.rotationY) * deployDist;
    const gz = this.player.z + Math.cos(this.player.rotationY) * deployDist;

    this.spawnGlooWallObject(gx, this.player.y, gz, this.player.rotationY, 'player');
    sounds.playGlooWallDeploy();
  }

  public spawnGlooWallObject(x: number, y: number, z: number, rotationY: number, ownerId: string) {
    const wallMesh = createGlooWallMesh();
    wallMesh.position.set(x, y, z);
    wallMesh.rotation.y = rotationY;
    this.scene.add(wallMesh);

    const wallObj: GlooWallObject = {
      id: Math.random().toString(),
      x,
      y,
      z,
      rotationY,
      hp: 500,
      maxHp: 500,
      mesh: wallMesh,
      ownerId,
    };
    this.glooWalls.push(wallObj);

    // Auto-melt after 25 seconds
    setTimeout(() => {
      this.scene.remove(wallMesh);
      this.glooWalls = this.glooWalls.filter(w => w.id !== wallObj.id);
    }, 25000);
  }

  public triggerCharacterSkill() {
    if (this.player.activeSkillCooldown > 0 || this.character.skillType !== 'ACTIVE') return;

    this.player.activeSkillTimer = this.character.skillDuration;

    if (this.character.id === 'alok') {
      sounds.playAlokSkill();
      const aura = this.playerMesh.getObjectByName('alokAura') as THREE.Mesh;
      if (aura) (aura.material as THREE.MeshBasicMaterial).opacity = 0.8;

    } else if (this.character.id === 'chrono') {
      sounds.playChronoSkill();
      const shield = this.playerMesh.getObjectByName('chronoShield') as THREE.Mesh;
      if (shield) (shield.material as THREE.MeshPhysicalMaterial).opacity = 0.5;

    } else if (this.character.id === 'wukong') {
      const bush = this.playerMesh.getObjectByName('wukongBush');
      if (bush) bush.visible = true;
    }
  }

  public useMedkit() {
    if (this.player.medkitCount > 0 && this.player.hp < this.player.maxHp && !this.player.isHealing) {
      this.player.medkitCount--;
      this.player.isHealing = true;
      this.player.healProgress = 0;
    }
  }

  public takeDamage(damage: number, isHeadshot: boolean, attackerName: string) {
    // Chrono Forcefield blocks all damage while active
    if (this.player.activeSkillTimer > 0 && this.character.id === 'chrono') {
      return;
    }

    // Armor absorption
    let effectiveDmg = damage;
    if (this.player.armor > 0) {
      const absorbed = Math.min(this.player.armor, damage * 0.5);
      this.player.armor -= absorbed;
      effectiveDmg -= absorbed;
    }

    this.player.hp -= effectiveDmg;
    sounds.playHitMarker(false);

    if (this.player.hp <= 0 && !this.player.isDead) {
      this.handlePlayerDeath(attackerName);
    }
  }

  private handlePlayerDeath(killer: string) {
    this.player.hp = 0;
    this.player.isDead = true;
    this.matchStats.position = this.botManager.getAliveCount() + 1;
    this.matchStats.rankPointsGained = Math.max(-20, 15 + this.matchStats.kills * 8);

    this.callbacks.onKillFeed({
      id: Math.random().toString(),
      killer,
      victim: 'YOU',
      weapon: 'Defeat',
      isHeadshot: false,
      timestamp: Date.now(),
    });

    setTimeout(() => {
      this.callbacks.onGameOver(this.matchStats);
    }, 1500);
  }

  private triggerBooyah() {
    this.matchStats.booyah = true;
    this.matchStats.position = 1;
    this.matchStats.rankPointsGained = 55 + this.matchStats.kills * 10;
    sounds.playBooyahFanfare();

    setTimeout(() => {
      this.callbacks.onGameOver(this.matchStats);
    }, 2000);
  }

  public playEmote(emoteId: string) {
    const emoteDef = EMOTES.find(e => e.id === emoteId);
    if (!emoteDef) return;
    this.player.currentEmote = emoteId;
    this.player.emoteTimer = emoteDef.duration;
    sounds.playEmoteSound(emoteDef.sound);
  }

  public dispose() {
    this.stop();
    if (this.renderer && this.renderer.domElement && this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
      this.renderer.dispose();
    }
  }
}
