import { CharacterDef } from '../types/game';

export const CHARACTERS: CharacterDef[] = [
  {
    id: 'alok',
    name: 'DJ ALOK',
    title: 'World Famous DJ',
    skillName: 'Drop the Beat',
    skillType: 'ACTIVE',
    skillCooldown: 40,
    skillDuration: 10,
    description: 'Creates a 5m glowing aura that increases movement speed by +25% and regenerates +5 HP/sec for 10 seconds.',
    lore: 'Using the power of music, Alok left Brazil and traveled the world. His beats inspire hope and vitality on the battlefield.',
    themeColor: '#10b981', // emerald green aura
    accentColor: '#34d399',
    hairColor: 0x111111,
    shirtColor: 0x1f2937,
    pantsColor: 0x111827,
    hasAccessory: 'sunglasses',
    stats: {
      speedBoost: 1.25,
      healthRegen: 5,
    }
  },
  {
    id: 'chrono',
    name: 'CHRONO',
    title: 'Cosmic Bounty Hunter',
    skillName: 'Time Turner',
    skillType: 'ACTIVE',
    skillCooldown: 60,
    skillDuration: 6,
    description: 'Creates a force field sphere that blocks 800 damage from incoming enemy bullets for 6 seconds.',
    lore: 'From an alternate cosmic dimension, Chrono controls space-time warping shields that withstand catastrophic military strikes.',
    themeColor: '#06b6d4', // cyan energy shield
    accentColor: '#38bdf8',
    hairColor: 0x1e293b,
    shirtColor: 0x0f172a,
    pantsColor: 0x1e1b4b,
    hasAccessory: 'coat',
    stats: {
      shieldHp: 800,
    }
  },
  {
    id: 'kelly',
    name: 'KELLY',
    title: 'The Swift Highschooler',
    skillName: 'Deadly Velocity',
    skillType: 'PASSIVE',
    skillCooldown: 0,
    skillDuration: 0,
    description: 'Increases sprinting speed by +18%. Sprinting for 3 seconds empowers the next bullet to deal +40% critical damage!',
    lore: 'Kelly is a high-school track star. On the Bermuda battleground, no one can outrun her swift dash and quick-trigger instincts.',
    themeColor: '#eab308', // yellow lightning
    accentColor: '#facc15',
    hairColor: 0x78350f,
    shirtColor: 0xeab308, // iconic yellow tracksuit
    pantsColor: 0xca8a04,
    hasAccessory: 'headset',
    stats: {
      speedBoost: 1.18,
    }
  },
  {
    id: 'hayato',
    name: 'HAYATO',
    title: 'Legendary Samurai',
    skillName: 'Bushido',
    skillType: 'PASSIVE',
    skillCooldown: 0,
    skillDuration: 0,
    description: 'For every 10% decrease in maximum HP, armor penetration and bullet damage increases by +12%.',
    lore: 'Born to a legendary samurai lineage, Hayato turns pain into devastating offensive power when near death.',
    themeColor: '#ef4444', // crimson blade
    accentColor: '#f87171',
    hairColor: 0x18181b,
    shirtColor: 0x7f1d1d,
    pantsColor: 0x18181b,
    hasAccessory: 'coat',
    stats: {
      armorPen: 0.12,
    }
  },
  {
    id: 'wukong',
    name: 'WUKONG',
    title: 'The Monkey King',
    skillName: 'Camouflage',
    skillType: 'ACTIVE',
    skillCooldown: 45,
    skillDuration: 15,
    description: 'Turns into a stealth bush, breaking enemy auto-aim and visual tracking! Cooldown resets immediately upon scoring a kill.',
    lore: 'An enigmatic bionic warrior infused with mystical monkey DNA. Capable of vanishing into the grass before ambushing foes.',
    themeColor: '#84cc16', // bush green
    accentColor: '#a3e635',
    hairColor: 0xd97706,
    shirtColor: 0x65a30d,
    pantsColor: 0x3f6212,
    hasAccessory: 'bush',
    stats: {
      speedBoost: 0.9,
    }
  },
  {
    id: 'maxim',
    name: 'MAXIM',
    title: 'Speed Eater',
    skillName: 'Gluttony',
    skillType: 'PASSIVE',
    skillCooldown: 0,
    skillDuration: 0,
    description: 'Consumes Med Kits and mushrooms 50% faster (heal time reduced from 4.0s to 2.0s).',
    lore: 'A competitive speed-eater whose lightning-fast metabolism allows him to restore full combat condition in record time.',
    themeColor: '#f97316',
    accentColor: '#fb923c',
    hairColor: 0x475569,
    shirtColor: 0xf97316,
    pantsColor: 0x334155,
    stats: {
      healthRegen: 1.5,
    }
  }
];
