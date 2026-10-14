import * as THREE from 'three';
import { BotEntity, DamageNumber, KillFeedItem, SafeZoneState } from '../types/game';
import { WEAPONS } from './weapons';
import { CHARACTERS } from './characters';
import { createCharacterMesh, createDeathLootBoxMesh } from './models';
import { sounds } from './audio';

const BOT_NAMES = [
  '★彡[Vɪᴘᴇʀ]彡★',
  '꧁༺B2K༻꧂',
  'Raistar_FF',
  'TotalGaming_Fan',
  'Badge99_Boss',
  'Ajjubhai_OP',
  'GarenaSniper',
  'SK_Sabir_King',
  'Hunter_99',
  'Alpha_Rider',
  'Headshot_God',
  'GlooWall_Master',
  'Poco_Gamer',
  'Born2Kill_Pro',
  'Vincenzo_FF',
  'Ruok_999',
  'Dynamo_Gaming',
  'Mythic_Fox',
  'Shadow_Striker',
  'Phoenix_Max',
];

export class BotManager {
  public bots: BotEntity[] = [];
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  public spawnBots(count: number, spawns: { x: number; y: number; z: number }[]) {
    // Clear old bots
    this.bots.forEach(b => {
      if (b.mesh) this.scene.remove(b.mesh);
    });
    this.bots = [];

    const weaponKeys = ['ak47', 'mp40', 'm1887', 'deagle'];

    for (let i = 0; i < Math.min(count, spawns.length); i++) {
      const charDef = CHARACTERS[i % CHARACTERS.length];
      const name = BOT_NAMES[i % BOT_NAMES.length];
      const spawn = spawns[i];
      const weaponKey = weaponKeys[Math.floor(Math.random() * weaponKeys.length)];
      const weapon = WEAPONS[weaponKey];

      const mesh = createCharacterMesh(charDef);
      mesh.position.set(spawn.x, spawn.y, spawn.z);
      this.scene.add(mesh);

      const bot: BotEntity = {
        id: `bot_${i}`,
        name,
        characterId: charDef.id,
        x: spawn.x,
        y: spawn.y,
        z: spawn.z,
        rotationY: Math.random() * Math.PI * 2,
        hp: 200,
        maxHp: 200,
        isDead: false,
        weapon,
        targetId: null,
        state: 'PATROL',
        patrolTarget: {
          x: spawn.x + (Math.random() - 0.5) * 40,
          z: spawn.z + (Math.random() - 0.5) * 40,
        },
        shootCooldown: Math.random() * 1.5,
        reactionTimer: 0,
        mesh,
      };

      this.bots.push(bot);
    }
  }

  public update(
    delta: number,
    playerPos: { x: number; y: number; z: number },
    playerHp: number,
    safeZone: SafeZoneState,
    onPlayerHit: (damage: number, isHeadshot: boolean, attackerName: string) => void,
    onKillFeed: (item: KillFeedItem) => void,
    onDamageNumber: (num: DamageNumber) => void,
    onDeployGlooWall: (x: number, y: number, z: number, rotationY: number, ownerId: string) => void
  ) {
    const aliveBots = this.bots.filter(b => !b.hp || !b.isDead);

    for (const bot of aliveBots) {
      if (bot.isDead) continue;

      // Safe zone storm damage
      const distFromCenter = Math.hypot(bot.x - safeZone.currentCenter.x, bot.z - safeZone.currentCenter.z);
      if (distFromCenter > safeZone.currentRadius) {
        bot.hp -= safeZone.damagePerTick * delta * 2;
        if (bot.hp <= 0) {
          bot.isDead = true;
          this.handleBotDeath(bot, 'The Storm', onKillFeed);
          continue;
        }
      }

      // Check distance to player
      const distToPlayer = Math.hypot(bot.x - playerPos.x, bot.z - playerPos.z);

      // Bot tactical behavior
      if (distFromCenter > safeZone.currentRadius - 10) {
        // Move towards safe zone center
        bot.state = 'FLEE_STORM';
        const angle = Math.atan2(safeZone.currentCenter.z - bot.z, safeZone.currentCenter.x - bot.x);
        bot.rotationY = -angle + Math.PI / 2;
        const speed = 4.8 * delta;
        bot.x += Math.cos(angle) * speed;
        bot.z += Math.sin(angle) * speed;

      } else if (distToPlayer < 45 && playerHp > 0) {
        // Combat against player
        bot.state = 'COMBAT';
        const dx = playerPos.x - bot.x;
        const dz = playerPos.z - bot.z;
        const targetAngle = Math.atan2(dz, dx);
        bot.rotationY = -targetAngle + Math.PI / 2;

        // Gloo Wall clutch defense if low HP (< 65) and hasn't placed one
        if (bot.hp < 65 && Math.random() < 0.05) {
          const glooDist = 3.5;
          const gx = bot.x + Math.cos(targetAngle) * glooDist;
          const gz = bot.z + Math.sin(targetAngle) * glooDist;
          onDeployGlooWall(gx, bot.y, gz, bot.rotationY, bot.id);
        }

        // Strafe slightly
        if (distToPlayer > 12) {
          const strafeSpeed = 3.2 * delta;
          bot.x += Math.cos(targetAngle) * strafeSpeed * 0.7;
          bot.z += Math.sin(targetAngle) * strafeSpeed * 0.7;
        }

        // Firing weapon
        bot.shootCooldown -= delta;
        if (bot.shootCooldown <= 0) {
          bot.shootCooldown = bot.weapon.fireRate * (1.2 + Math.random() * 0.8);

          // Calculate accuracy and hit chance
          const hitChance = Math.max(0.2, 0.65 - distToPlayer * 0.01);
          if (Math.random() < hitChance) {
            const isHeadshot = Math.random() < 0.15;
            const dmg = isHeadshot
              ? Math.round(bot.weapon.damage * 2.2)
              : Math.round(bot.weapon.damage * (0.8 + Math.random() * 0.4));

            onPlayerHit(dmg, isHeadshot, bot.name);
            sounds.playGunshot(bot.weapon.id as any);
          }
        }

      } else {
        // Patrol & Scavenge
        bot.state = 'PATROL';
        const ptx = bot.patrolTarget.x - bot.x;
        const ptz = bot.patrolTarget.z - bot.z;
        const pdist = Math.hypot(ptx, ptz);

        if (pdist < 4) {
          bot.patrolTarget = {
            x: bot.x + (Math.random() - 0.5) * 50,
            z: bot.z + (Math.random() - 0.5) * 50,
          };
        } else {
          const angle = Math.atan2(ptz, ptx);
          bot.rotationY = -angle + Math.PI / 2;
          const speed = 3.5 * delta;
          bot.x += Math.cos(angle) * speed;
          bot.z += Math.sin(angle) * speed;
        }

        // Random bot-on-bot shootouts in the distance
        if (Math.random() < 0.003 && aliveBots.length > 3) {
          const otherBot = aliveBots.find(b => b.id !== bot.id && !b.isDead);
          if (otherBot) {
            const bDist = Math.hypot(bot.x - otherBot.x, bot.z - otherBot.z);
            if (bDist < 35) {
              otherBot.hp -= 45;
              if (otherBot.hp <= 0) {
                otherBot.isDead = true;
                this.handleBotDeath(otherBot, bot.name, onKillFeed);
              }
            }
          }
        }
      }

      // Update mesh position and leg running animation
      if (bot.mesh) {
        bot.mesh.position.set(bot.x, bot.y, bot.z);
        bot.mesh.rotation.y = bot.rotationY;

        // Running leg animation
        const runCycle = Math.sin(Date.now() * 0.012) * 0.4;
        const leftLeg = bot.mesh.getObjectByName('leftLeg');
        const rightLeg = bot.mesh.getObjectByName('rightLeg');
        if (leftLeg && rightLeg) {
          leftLeg.rotation.x = runCycle;
          rightLeg.rotation.x = -runCycle;
        }
      }
    }
  }

  public damageBot(
    botId: string,
    damage: number,
    isHeadshot: boolean,
    killerName: string,
    weaponName: string,
    onKillFeed: (item: KillFeedItem) => void,
    onDamageNumber: (num: DamageNumber) => void
  ): boolean {
    const bot = this.bots.find(b => b.id === botId && !b.isDead);
    if (!bot) return false;

    bot.hp -= damage;
    onDamageNumber({
      id: Math.random().toString(),
      x: bot.x,
      y: bot.y + (isHeadshot ? 2.3 : 1.5),
      z: bot.z,
      amount: Math.round(damage),
      isHeadshot,
      lifetime: 1.0,
    });

    if (bot.hp <= 0) {
      bot.isDead = true;
      bot.hp = 0;
      this.handleBotDeath(bot, killerName, onKillFeed, weaponName, isHeadshot);
      return true; // was eliminated
    }
    return false;
  }

  private handleBotDeath(
    bot: BotEntity,
    killer: string,
    onKillFeed: (item: KillFeedItem) => void,
    weaponName: string = 'Storm',
    isHeadshot: boolean = false
  ) {
    if (bot.mesh) {
      // Remove character mesh
      this.scene.remove(bot.mesh);

      // Spawn Free Fire Death Loot Crate
      const deathBox = createDeathLootBoxMesh();
      deathBox.position.set(bot.x, bot.y, bot.z);
      this.scene.add(deathBox);
    }

    onKillFeed({
      id: Math.random().toString(),
      killer,
      victim: bot.name,
      weapon: weaponName,
      isHeadshot,
      timestamp: Date.now(),
    });
  }

  public getAliveCount(): number {
    return this.bots.filter(b => !b.isDead).length;
  }
}
