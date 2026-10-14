import * as THREE from 'three';
import { CharacterDef, OutfitBundle, WeaponType } from '../types/game';

// Helper to create procedural noise/camo canvas textures
export function createCamoTexture(color1: string, color2: string, color3: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = color1;
  ctx.fillRect(0, 0, 256, 256);

  // Organic camo patches
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = i % 2 === 0 ? color2 : color3;
    ctx.beginPath();
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const r = 15 + Math.random() * 30;
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// Procedural Clock Dial Texture
export function createClockFaceTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(128, 128, 110, 0, Math.PI * 2);
  ctx.stroke();

  // Clock ticks
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI) / 6;
    const x1 = 128 + Math.cos(angle) * 90;
    const y1 = 128 + Math.sin(angle) * 90;
    const x2 = 128 + Math.cos(angle) * 105;
    const y2 = 128 + Math.sin(angle) * 105;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  // Clock hands
  ctx.beginPath();
  ctx.moveTo(128, 128);
  ctx.lineTo(128, 60);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(128, 128);
  ctx.lineTo(170, 128);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Procedural Free Fire Character 3D Model with Outfit Bundle support
export function createCharacterMesh(charDef: CharacterDef, outfit?: OutfitBundle): THREE.Group {
  const group = new THREE.Group();

  const shirtColor = outfit ? outfit.shirtColor : charDef.shirtColor;
  const pantsColor = outfit ? outfit.pantsColor : charDef.pantsColor;
  const hairColor = outfit ? outfit.hairColor : charDef.hairColor;
  const accessory = outfit ? outfit.accessory : charDef.hasAccessory;

  // Torso / Vest
  const torsoGeo = new THREE.BoxGeometry(0.7, 0.9, 0.45);
  const torsoMat = new THREE.MeshStandardMaterial({
    color: shirtColor,
    roughness: 0.6,
    metalness: 0.1,
  });
  const torso = new THREE.Mesh(torsoGeo, torsoMat);
  torso.position.y = 1.35;
  torso.name = 'torso';
  torso.castShadow = true;
  torso.receiveShadow = true;
  group.add(torso);

  // Tactical Vest (Free Fire Level 3 Vest armor look)
  const vestGeo = new THREE.BoxGeometry(0.76, 0.6, 0.52);
  const vestMat = new THREE.MeshStandardMaterial({
    color: outfit && outfit.glowColor ? outfit.shirtColor : 0x27272a,
    roughness: 0.4,
    metalness: 0.4,
  });
  const vest = new THREE.Mesh(vestGeo, vestMat);
  vest.position.set(0, 1.38, 0.02);
  vest.name = 'vest';
  vest.castShadow = true;
  group.add(vest);

  // Head
  const headGeo = new THREE.BoxGeometry(0.42, 0.45, 0.42);
  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xe0ac69,
    roughness: 0.8,
  });
  const head = new THREE.Mesh(headGeo, skinMat);
  head.position.y = 2.05;
  head.name = 'head';
  head.castShadow = true;
  group.add(head);

  // Hair
  const hairGeo = new THREE.BoxGeometry(0.46, 0.22, 0.46);
  const hairMat = new THREE.MeshStandardMaterial({
    color: hairColor,
    roughness: 0.9,
  });
  const hair = new THREE.Mesh(hairGeo, hairMat);
  hair.position.set(0, 2.22, 0);
  hair.name = 'hair';
  group.add(hair);

  // Accessories: sunglasses, mask, hoodie
  if (accessory === 'sunglasses') {
    const glassesGeo = new THREE.BoxGeometry(0.38, 0.1, 0.12);
    const glassesMat = new THREE.MeshStandardMaterial({
      color: 0x09090b,
      metalness: 0.9,
      roughness: 0.1,
    });
    const glasses = new THREE.Mesh(glassesGeo, glassesMat);
    glasses.position.set(0, 2.06, 0.22);
    glasses.name = 'glasses';
    group.add(glasses);
  } else if (accessory === 'mask') {
    const maskGeo = new THREE.BoxGeometry(0.44, 0.26, 0.14);
    const maskMat = new THREE.MeshStandardMaterial({
      color: outfit?.id === 'red_criminal' ? 0xffffff : 0x7f1d1d,
      roughness: 0.3,
      metalness: 0.2,
    });
    const mask = new THREE.Mesh(maskGeo, maskMat);
    mask.position.set(0, 2.0, 0.2);
    mask.name = 'mask';
    group.add(mask);
  }

  // Legs (Left & Right)
  const legGeo = new THREE.BoxGeometry(0.28, 0.9, 0.3);
  const pantsMat = new THREE.MeshStandardMaterial({
    color: pantsColor,
    roughness: 0.7,
  });

  const leftLeg = new THREE.Mesh(legGeo, pantsMat);
  leftLeg.position.set(-0.2, 0.45, 0);
  leftLeg.name = 'leftLeg';
  leftLeg.castShadow = true;
  group.add(leftLeg);

  const rightLeg = new THREE.Mesh(legGeo, pantsMat);
  rightLeg.position.set(0.2, 0.45, 0);
  rightLeg.name = 'rightLeg';
  rightLeg.castShadow = true;
  group.add(rightLeg);

  // Arms (Left & Right)
  const armGeo = new THREE.BoxGeometry(0.22, 0.75, 0.24);
  const armMat = new THREE.MeshStandardMaterial({
    color: charDef.shirtColor,
    roughness: 0.7,
  });

  const leftArm = new THREE.Mesh(armGeo, armMat);
  leftArm.position.set(-0.52, 1.35, 0.15);
  leftArm.rotation.x = -Math.PI / 4;
  leftArm.name = 'leftArm';
  leftArm.castShadow = true;
  group.add(leftArm);

  const rightArm = new THREE.Mesh(armGeo, armMat);
  rightArm.position.set(0.52, 1.35, 0.2);
  rightArm.rotation.x = -Math.PI / 3;
  rightArm.name = 'rightArm';
  rightArm.castShadow = true;
  group.add(rightArm);

  // Weapon Container attached to player hands
  const weaponAnchor = new THREE.Group();
  weaponAnchor.position.set(0.3, 1.15, 0.55);
  weaponAnchor.name = 'weaponAnchor';
  group.add(weaponAnchor);

  // Alok Aura Ring (hidden by default, revealed during skill)
  const auraGeo = new THREE.RingGeometry(2.4, 2.7, 32);
  const auraMat = new THREE.MeshBasicMaterial({
    color: 0x10b981,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0,
  });
  const auraMesh = new THREE.Mesh(auraGeo, auraMat);
  auraMesh.rotation.x = Math.PI / 2;
  auraMesh.position.y = 0.08;
  auraMesh.name = 'alokAura';
  group.add(auraMesh);

  // Chrono Shield Sphere (hidden by default)
  const chronoShieldGeo = new THREE.SphereGeometry(2.8, 24, 24);
  const chronoShieldMat = new THREE.MeshPhysicalMaterial({
    color: 0x06b6d4,
    transmission: 0.7,
    roughness: 0.1,
    transparent: true,
    opacity: 0,
    wireframe: false,
    emissive: 0x0891b2,
    emissiveIntensity: 0.3,
  });
  const chronoShield = new THREE.Mesh(chronoShieldGeo, chronoShieldMat);
  chronoShield.position.y = 1.3;
  chronoShield.name = 'chronoShield';
  group.add(chronoShield);

  // Wukong Bush Disguise (hidden by default)
  const bushGroup = new THREE.Group();
  bushGroup.name = 'wukongBush';
  bushGroup.visible = false;
  for (let i = 0; i < 5; i++) {
    const leafGeo = new THREE.DodecahedronGeometry(0.8 + Math.random() * 0.4);
    const leafMat = new THREE.MeshStandardMaterial({
      color: 0x4d7c0f,
      roughness: 0.9,
    });
    const leaf = new THREE.Mesh(leafGeo, leafMat);
    leaf.position.set(
      (Math.random() - 0.5) * 0.8,
      0.6 + Math.random() * 0.8,
      (Math.random() - 0.5) * 0.8
    );
    bushGroup.add(leaf);
  }
  group.add(bushGroup);

  return group;
}

// Procedural 3D Weapon Models
export function createWeaponMesh(weaponId: WeaponType): THREE.Group {
  const group = new THREE.Group();

  if (weaponId === 'mp40') {
    // MP40 Submachine Gun
    const bodyGeo = new THREE.BoxGeometry(0.1, 0.18, 0.8);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xca8a04, metalness: 0.8, roughness: 0.3 }); // Predator Cobra gold/yellow
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    group.add(body);

    const barrelGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.4);
    const barrelMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.9, roughness: 0.2 });
    const barrel = new THREE.Mesh(barrelGeo, barrelMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.04, 0.5);
    group.add(barrel);

    // Magazine
    const magGeo = new THREE.BoxGeometry(0.07, 0.35, 0.1);
    const magMat = new THREE.MeshStandardMaterial({ color: 0x09090b, metalness: 0.8, roughness: 0.4 });
    const mag = new THREE.Mesh(magGeo, magMat);
    mag.position.set(0, -0.22, 0.1);
    mag.rotation.x = 0.2;
    group.add(mag);

  } else if (weaponId === 'ak47') {
    // AK47 Blue Flame Draco
    const bodyGeo = new THREE.BoxGeometry(0.12, 0.2, 0.9);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, metalness: 0.7, roughness: 0.3, emissive: 0x1e40af, emissiveIntensity: 0.2 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    group.add(body);

    // Wooden / Dragon Grip
    const stockGeo = new THREE.BoxGeometry(0.1, 0.22, 0.35);
    const stockMat = new THREE.MeshStandardMaterial({ color: 0x172554, metalness: 0.5, roughness: 0.5 });
    const stock = new THREE.Mesh(stockGeo, stockMat);
    stock.position.set(0, -0.05, -0.55);
    group.add(stock);

    // Curved Banana Magazine
    const magGeo = new THREE.BoxGeometry(0.08, 0.38, 0.14);
    const magMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 });
    const mag = new THREE.Mesh(magGeo, magMat);
    mag.position.set(0, -0.24, 0.12);
    mag.rotation.x = -0.3;
    group.add(mag);

    // Long Barrel & Sight
    const barrelGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.55);
    const barrelMat = new THREE.MeshStandardMaterial({ color: 0x09090b, metalness: 0.9, roughness: 0.2 });
    const barrel = new THREE.Mesh(barrelGeo, barrelMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.05, 0.65);
    group.add(barrel);

  } else if (weaponId === 'm1887') {
    // M1887 Double-Barrel Shotgun
    const bodyGeo = new THREE.BoxGeometry(0.12, 0.22, 0.7);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.85, roughness: 0.25 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    group.add(body);

    // Dual Barrels
    for (const offset of [-0.035, 0.035]) {
      const barrelGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.5);
      const barrelMat = new THREE.MeshStandardMaterial({ color: 0x27272a, metalness: 0.95, roughness: 0.15 });
      const barrel = new THREE.Mesh(barrelGeo, barrelMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(offset, 0.04, 0.5);
      group.add(barrel);
    }

  } else if (weaponId === 'awm') {
    // AWM Sniper Rifle
    const bodyGeo = new THREE.BoxGeometry(0.12, 0.22, 1.1);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x047857, metalness: 0.6, roughness: 0.4 }); // Arctic green
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    group.add(body);

    // Sniper Scope (High Magnification)
    const scopeGeo = new THREE.CylinderGeometry(0.06, 0.07, 0.45);
    const scopeMat = new THREE.MeshStandardMaterial({ color: 0x09090b, metalness: 0.9, roughness: 0.2 });
    const scope = new THREE.Mesh(scopeGeo, scopeMat);
    scope.rotation.x = Math.PI / 2;
    scope.position.set(0, 0.18, 0.1);
    group.add(scope);

    // Very Long Sniper Barrel & Muzzle Brake
    const barrelGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.8);
    const barrelMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.9, roughness: 0.2 });
    const barrel = new THREE.Mesh(barrelGeo, barrelMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.04, 0.85);
    group.add(barrel);

  } else if (weaponId === 'gloowall') {
    // Gloo Wall Granule Projector device
    const canisterGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.35);
    const canisterMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x0891b2, emissiveIntensity: 0.5, metalness: 0.8 });
    const canister = new THREE.Mesh(canisterGeo, canisterMat);
    group.add(canister);

  } else {
    // Desert Eagle
    const deagleGeo = new THREE.BoxGeometry(0.1, 0.16, 0.42);
    const deagleMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.15 });
    const deagle = new THREE.Mesh(deagleGeo, deagleMat);
    group.add(deagle);
  }

  group.scale.set(0.8, 0.8, 0.8);
  return group;
}

// Gloo Wall 3D Object (Signature Free Fire Icy Bunker Wall)
export function createGlooWallMesh(): THREE.Group {
  const group = new THREE.Group();

  // Curved bunker wall arc geometry
  const wallArc = new THREE.CylinderGeometry(4.2, 4.2, 3.2, 24, 1, true, -Math.PI / 3.2, Math.PI / 1.6);
  const wallMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.35,
    roughness: 0.2,
    transmission: 0.3,
    transparent: true,
    opacity: 0.92,
    side: THREE.DoubleSide,
  });
  const wallMesh = new THREE.Mesh(wallArc, wallMat);
  wallMesh.position.y = 1.6;
  wallMesh.castShadow = true;
  wallMesh.receiveShadow = true;
  group.add(wallMesh);

  // Glowing energy frame border
  const borderGeo = new THREE.TorusGeometry(4.2, 0.08, 8, 32, Math.PI / 1.6);
  const borderMat = new THREE.MeshBasicMaterial({ color: 0x67e8f9 });
  const topBorder = new THREE.Mesh(borderGeo, borderMat);
  topBorder.rotation.x = Math.PI / 2;
  topBorder.rotation.z = -Math.PI / 3.2;
  topBorder.position.y = 3.2;
  group.add(topBorder);

  return group;
}

// Airdrop Crate with Parachute and Smoke Column
export function createAirdropMesh(): THREE.Group {
  const group = new THREE.Group();

  // Red and Yellow Military Supply Crate
  const crateGeo = new THREE.BoxGeometry(2.0, 2.0, 2.0);
  const crateMat = new THREE.MeshStandardMaterial({
    color: 0xdc2626,
    roughness: 0.4,
    metalness: 0.6,
  });
  const crate = new THREE.Mesh(crateGeo, crateMat);
  crate.position.y = 1.0;
  crate.castShadow = true;
  crate.receiveShadow = true;
  group.add(crate);

  // Yellow trim
  const trimGeo = new THREE.BoxGeometry(2.08, 0.3, 2.08);
  const trimMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.3 });
  const trim = new THREE.Mesh(trimGeo, trimMat);
  trim.position.y = 1.0;
  group.add(trim);

  // Iconic Yellow Airdrop Smoke Beacon Column (Shooting to the sky)
  const smokeGeo = new THREE.CylinderGeometry(0.35, 1.2, 45, 16);
  const smokeMat = new THREE.MeshBasicMaterial({
    color: 0xfacc15,
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide,
  });
  const smoke = new THREE.Mesh(smokeGeo, smokeMat);
  smoke.position.y = 23;
  group.add(smoke);

  return group;
}

// Free Fire Death Loot Box (Casket dropped on kill)
export function createDeathLootBoxMesh(): THREE.Group {
  const group = new THREE.Group();

  const boxGeo = new THREE.BoxGeometry(1.2, 0.7, 0.9);
  const boxMat = new THREE.MeshStandardMaterial({
    color: 0xb91c1c,
    metalness: 0.8,
    roughness: 0.2,
  });
  const box = new THREE.Mesh(boxGeo, boxMat);
  box.position.y = 0.35;
  box.castShadow = true;
  group.add(box);

  // Golden cross ornament
  const goldGeo = new THREE.BoxGeometry(1.24, 0.12, 0.94);
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.1 });
  const gold = new THREE.Mesh(goldGeo, goldMat);
  gold.position.y = 0.4;
  group.add(gold);

  // Vertical Loot Beam (cyan)
  const beamGeo = new THREE.CylinderGeometry(0.08, 0.08, 8, 8);
  const beamMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.7 });
  const beam = new THREE.Mesh(beamGeo, beamMat);
  beam.position.y = 4.35;
  group.add(beam);

  return group;
}

// Red Explosive Oil Barrel
export function createExplosiveBarrelMesh(): THREE.Group {
  const group = new THREE.Group();

  const barrelGeo = new THREE.CylinderGeometry(0.65, 0.65, 1.6, 16);
  const barrelMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    roughness: 0.4,
    metalness: 0.7,
  });
  const barrel = new THREE.Mesh(barrelGeo, barrelMat);
  barrel.position.y = 0.8;
  barrel.castShadow = true;
  barrel.receiveShadow = true;
  group.add(barrel);

  // Yellow hazard rings
  const ringGeo = new THREE.TorusGeometry(0.66, 0.04, 8, 24);
  const ringMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3 });
  for (const y of [0.4, 0.8, 1.2]) {
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = y;
    group.add(ring);
  }

  return group;
}

// Palm Tree
export function createPalmTreeMesh(): THREE.Group {
  const group = new THREE.Group();

  // Curved Trunk
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.3, 3, 0.2),
    new THREE.Vector3(0.8, 6.5, 0.5),
  ]);
  const trunkGeo = new THREE.TubeGeometry(curve, 12, 0.38, 8, false);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.castShadow = true;
  group.add(trunk);

  // Palm Fronds
  const topPoint = new THREE.Vector3(0.8, 6.5, 0.5);
  const frondMat = new THREE.MeshStandardMaterial({
    color: 0x15803d,
    roughness: 0.7,
    side: THREE.DoubleSide,
  });

  for (let i = 0; i < 7; i++) {
    const angle = (i * Math.PI * 2) / 7;
    const frondGeo = new THREE.ConeGeometry(0.9, 3.8, 4);
    const frond = new THREE.Mesh(frondGeo, frondMat);
    frond.position.copy(topPoint);
    frond.rotation.y = angle;
    frond.rotation.z = Math.PI / 3;
    frond.castShadow = true;
    group.add(frond);
  }

  return group;
}

// Target Practice Dummy for Training Ground mode
export function createTrainingDummyMesh(): THREE.Group {
  const group = new THREE.Group();

  // Metal Base Stand
  const baseGeo = new THREE.CylinderGeometry(0.8, 0.9, 0.2, 16);
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.9 });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 0.1;
  group.add(base);

  // Pole
  const poleGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.4, 8);
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x4b5563, metalness: 0.8 });
  const pole = new THREE.Mesh(poleGeo, poleMat);
  pole.position.y = 0.8;
  group.add(pole);

  // Torso Target with Bullseye
  const torsoGeo = new THREE.BoxGeometry(0.7, 0.9, 0.15);
  const torsoMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 });
  const torso = new THREE.Mesh(torsoGeo, torsoMat);
  torso.position.y = 1.5;
  torso.castShadow = true;
  group.add(torso);

  // Head Bullseye (Red Headshot Target)
  const headGeo = new THREE.SphereGeometry(0.24, 16, 16);
  const headMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.y = 2.15;
  head.castShadow = true;
  group.add(head);

  return group;
}

// Procedural Emote Keyframe Animation Engine
export function animateEmote(mesh: THREE.Group, emoteId: string, elapsed: number) {
  const torso = mesh.getObjectByName('torso');
  const head = mesh.getObjectByName('head');
  const leftArm = mesh.getObjectByName('leftArm');
  const rightArm = mesh.getObjectByName('rightArm');
  const leftLeg = mesh.getObjectByName('leftLeg');
  const rightLeg = mesh.getObjectByName('rightLeg');

  if (!leftArm || !rightArm) return;

  const t = elapsed;

  if (emoteId === 'lol') {
    // LOL Emote: Body bends forward laughing, right arm points, head bobs
    const laugh = Math.sin(t * 14) * 0.18;
    if (torso) torso.rotation.x = 0.3 + laugh;
    if (head) head.rotation.x = -0.2 + laugh * 0.5;

    // Right arm points forward
    rightArm.rotation.x = -Math.PI / 2.2;
    rightArm.rotation.z = -0.2;

    // Left arm on belly laughing
    leftArm.rotation.x = -0.7;
    leftArm.rotation.z = 0.6;

  } else if (emoteId === 'applause') {
    // Clapping standing ovation
    const clap = Math.sin(t * 18);
    rightArm.rotation.x = -Math.PI / 2.8;
    rightArm.rotation.z = -0.4 - clap * 0.25;

    leftArm.rotation.x = -Math.PI / 2.8;
    leftArm.rotation.z = 0.4 + clap * 0.25;

    if (head) head.rotation.y = Math.sin(t * 3) * 0.2;

  } else if (emoteId === 'tea') {
    // Tea Time: Right hand holds tea cup to mouth, elegant pose
    rightArm.rotation.x = -Math.PI / 1.8;
    rightArm.rotation.z = -0.5;
    leftArm.rotation.x = -0.2;
    leftArm.rotation.z = 0.5;
    if (head) head.rotation.x = 0.15;

  } else if (emoteId === 'threaten') {
    // Threaten: Right hand swipes across throat
    const swipe = (Math.sin(t * 4) + 1) * 0.5;
    rightArm.rotation.x = -Math.PI / 1.9;
    rightArm.rotation.y = (swipe - 0.5) * 1.2;
    rightArm.rotation.z = -0.8;
    leftArm.rotation.x = 0;

  } else if (emoteId === 'flag') {
    // Booyah Flag: Slam flag into ground
    const slamProgress = Math.min(1, t / 0.8);
    rightArm.rotation.x = -Math.PI / 1.2 + slamProgress * 0.8;
    rightArm.rotation.z = -0.3;
    if (torso) torso.rotation.x = slamProgress * 0.2;

  } else if (emoteId === 'pushup') {
    // One-arm pushup: Mesh drops to floor and pumps
    const pump = Math.abs(Math.sin(t * 6));
    mesh.position.y = 0.35 + pump * 0.25;
    if (torso) torso.rotation.x = 1.35;
    rightArm.rotation.x = -Math.PI / 3;
    leftArm.rotation.x = 0.2;

  } else if (emoteId === 'dance') {
    // Doggie dance bounce
    const bounce = Math.abs(Math.sin(t * 8)) * 0.3;
    mesh.position.y = 0.5 + bounce;
    const sway = Math.sin(t * 6) * 0.4;
    rightArm.rotation.z = -0.8 + sway;
    leftArm.rotation.z = 0.8 + sway;
    if (leftLeg && rightLeg) {
      leftLeg.rotation.x = Math.sin(t * 8) * 0.3;
      rightLeg.rotation.x = -Math.sin(t * 8) * 0.3;
    }
  }
}
