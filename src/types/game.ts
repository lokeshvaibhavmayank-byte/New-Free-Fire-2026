export type WeaponType = 'ak47' | 'mp40' | 'm1887' | 'awm' | 'deagle' | 'scar' | 'm1014' | 'gloowall' | 'grenade';

export type GameMode = 'bermuda' | 'clash_squad' | 'lone_wolf' | 'training';

export interface WeaponSkinDef {
  id: string;
  weaponId: WeaponType;
  name: string;
  tier: 'Legendary' | 'Evo Level 7' | 'Epic' | 'Mythic';
  color: string;
  glowColor: string;
  bonus: string;
  damageBonus: number;
  fireRateBonus: number;
  reloadBonus: number;
}

export interface EmoteDef {
  id: string;
  name: string;
  icon: string;
  description: string;
  duration: number; // in seconds
  sound: 'lol' | 'tea' | 'applause' | 'pushup' | 'threaten' | 'dance' | 'flag';
}

export interface OutfitBundle {
  id: string;
  name: string;
  rarity: 'Mythic' | 'Legendary' | 'Epic';
  description: string;
  tag: string;
  shirtColor: number;
  pantsColor: number;
  hairColor: number;
  glowColor?: string;
  accessory: 'sunglasses' | 'mask' | 'headset' | 'hoodie' | 'none';
  icon: string;
}

export interface WeaponDef {
  id: WeaponType;
  name: string;
  category: 'AR' | 'SMG' | 'SG' | 'SR' | 'Pistol' | 'Utility';
  damage: number;
  headshotMultiplier: number;
  fireRate: number; // seconds between shots
  magazineSize: number;
  reloadTime: number; // seconds
  pellets?: number; // for shotgun
  spread: number;
  range: number;
  bulletSpeed: number;
  color: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  description: string;
  skinName: string;
}

export interface CharacterDef {
  id: string;
  name: string;
  title: string;
  skillName: string;
  skillType: 'ACTIVE' | 'PASSIVE';
  skillCooldown: number; // in seconds
  skillDuration: number; // in seconds
  description: string;
  lore: string;
  themeColor: string;
  accentColor: string;
  hairColor: number;
  shirtColor: number;
  pantsColor: number;
  hasAccessory?: string; // 'sunglasses', 'headset', 'bush', 'coat'
  stats: {
    speedBoost?: number;
    healthRegen?: number;
    armorPen?: number;
    shieldHp?: number;
  };
}

export interface PlayerState {
  x: number;
  y: number;
  z: number;
  rotationY: number;
  pitch: number;
  vx: number;
  vy: number;
  vz: number;
  hp: number;
  maxHp: number;
  ep: number;
  maxEp: number;
  armor: number; // 0 to 100 (vest protection)
  helmet: number; // 0 to 100
  isDead: boolean;
  isGrounded: boolean;
  isCrouching: boolean;
  isSprinting: boolean;
  isAiming: boolean;
  isFiring: boolean;
  activeSkillCooldown: number;
  activeSkillTimer: number; // time skill is currently active
  selectedWeaponIndex: number;
  weapons: {
    weapon: WeaponDef;
    currentAmmo: number;
    reserveAmmo: number;
  }[];
  glooWallCount: number;
  medkitCount: number;
  isHealing: boolean;
  healProgress: number; // 0 to 1
  currentEmote: string | null;
  emoteTimer: number;
  outfitId: string;
}

export interface BotEntity {
  id: string;
  name: string;
  characterId: string;
  x: number;
  y: number;
  z: number;
  rotationY: number;
  hp: number;
  maxHp: number;
  isDead: boolean;
  weapon: WeaponDef;
  targetId: string | null;
  state: 'PATROL' | 'COMBAT' | 'FLEE_STORM' | 'LOOT';
  patrolTarget: { x: number; z: number };
  shootCooldown: number;
  reactionTimer: number;
  mesh?: any;
}

export interface GlooWallObject {
  id: string;
  x: number;
  y: number;
  z: number;
  rotationY: number;
  hp: number;
  maxHp: number;
  mesh: any;
  ownerId: string;
}

export interface LootItem {
  id: string;
  type: 'weapon' | 'ammo' | 'medkit' | 'gloowall' | 'armor';
  weaponId?: WeaponType;
  count?: number;
  x: number;
  y: number;
  z: number;
  mesh: any;
}

export interface DamageNumber {
  id: string;
  x: number;
  y: number;
  z: number;
  amount: number;
  isHeadshot: boolean;
  lifetime: number; // 0 to 1
}

export interface KillFeedItem {
  id: string;
  killer: string;
  victim: string;
  weapon: string;
  isHeadshot: boolean;
  timestamp: number;
}

export interface SafeZoneState {
  currentCenter: { x: number; z: number };
  currentRadius: number;
  nextCenter: { x: number; z: number };
  nextRadius: number;
  isShrinking: boolean;
  shrinkTimer: number; // countdown
  totalShrinkDuration: number;
  damagePerTick: number;
}

export interface MatchStats {
  kills: number;
  damageDealt: number;
  headshots: number;
  rankPointsGained: number;
  survivalTimeSeconds: number;
  position: number;
  totalPlayers: number;
  booyah: boolean;
}
