import * as THREE from 'three';
import {
  createClockFaceTexture,
  createPalmTreeMesh,
  createExplosiveBarrelMesh,
} from './models';

export interface MapObstacle {
  x: number;
  z: number;
  radius: number;
  isCover?: boolean;
}

export interface MapBuilding {
  name: string;
  x: number;
  z: number;
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
}

export interface BermudaMapData {
  group: THREE.Group;
  colliders: { box: THREE.Box3; mesh: THREE.Object3D }[];
  lootSpawns: { x: number; y: number; z: number }[];
  playerSpawns: { x: number; y: number; z: number }[];
  explosiveBarrels: { x: number; y: number; z: number; mesh: THREE.Group; hp: number }[];
  landmarks: MapBuilding[];
}

export function buildBermudaMap(): BermudaMapData {
  const group = new THREE.Group();
  const colliders: { box: THREE.Box3; mesh: THREE.Object3D }[] = [];
  const lootSpawns: { x: number; y: number; z: number }[] = [];
  const playerSpawns: { x: number; y: number; z: number }[] = [];
  const explosiveBarrels: { x: number; y: number; z: number; mesh: THREE.Group; hp: number }[] = [];
  const landmarks: MapBuilding[] = [];

  // Ground Terrain (400m x 400m tropical Bermuda terrain)
  const terrainGeo = new THREE.PlaneGeometry(400, 400, 32, 32);
  terrainGeo.rotateX(-Math.PI / 2);

  // Procedural grass/dirt terrain texture
  const terrainCanvas = document.createElement('canvas');
  terrainCanvas.width = 512;
  terrainCanvas.height = 512;
  const ctx = terrainCanvas.getContext('2d')!;
  ctx.fillStyle = '#2d5a27'; // Bermuda lush green
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 400; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#3f6212' : '#1e3a17';
    ctx.beginPath();
    ctx.arc(Math.random() * 512, Math.random() * 512, 4 + Math.random() * 12, 0, Math.PI * 2);
    ctx.fill();
  }
  const terrainTexture = new THREE.CanvasTexture(terrainCanvas);
  terrainTexture.colorSpace = THREE.SRGBColorSpace;
  terrainTexture.wrapS = THREE.RepeatWrapping;
  terrainTexture.wrapT = THREE.RepeatWrapping;
  terrainTexture.repeat.set(24, 24);

  const terrainMat = new THREE.MeshStandardMaterial({
    map: terrainTexture,
    roughness: 0.9,
    metalness: 0.1,
  });
  const ground = new THREE.Mesh(terrainGeo, terrainMat);
  ground.receiveShadow = true;
  group.add(ground);

  // Helper for adding collider boxes
  function addCollider(mesh: THREE.Object3D) {
    const box = new THREE.Box3().setFromObject(mesh);
    colliders.push({ box, mesh });
  }

  // ==========================================
  // 1. CLOCK TOWER (Iconic Bermuda Landmark)
  // Location: (-60, 40)
  // ==========================================
  const clockTowerGroup = new THREE.Group();
  clockTowerGroup.position.set(-60, 0, 40);

  // Tower Base (Cobblestone)
  const ctBaseGeo = new THREE.BoxGeometry(10, 8, 10);
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.85 });
  const ctBase = new THREE.Mesh(ctBaseGeo, stoneMat);
  ctBase.position.y = 4;
  ctBase.castShadow = true;
  ctBase.receiveShadow = true;
  clockTowerGroup.add(ctBase);
  addCollider(ctBase);

  // Tower Shaft
  const ctShaftGeo = new THREE.BoxGeometry(6.5, 14, 6.5);
  const ctShaft = new THREE.Mesh(ctShaftGeo, stoneMat);
  ctShaft.position.y = 15;
  ctShaft.castShadow = true;
  ctShaft.receiveShadow = true;
  clockTowerGroup.add(ctShaft);
  addCollider(ctShaft);

  // Clock Room
  const ctRoomGeo = new THREE.BoxGeometry(8, 6, 8);
  const ctRoom = new THREE.Mesh(ctRoomGeo, stoneMat);
  ctRoom.position.y = 25;
  clockTowerGroup.add(ctRoom);

  // Clock Faces on all 4 sides
  const clockTex = createClockFaceTexture();
  const clockFaceMat = new THREE.MeshBasicMaterial({ map: clockTex });
  const clockFaceGeo = new THREE.PlaneGeometry(3.6, 3.6);

  const cfFront = new THREE.Mesh(clockFaceGeo, clockFaceMat);
  cfFront.position.set(0, 25, 4.02);
  clockTowerGroup.add(cfFront);

  const cfBack = new THREE.Mesh(clockFaceGeo, clockFaceMat);
  cfBack.position.set(0, 25, -4.02);
  cfBack.rotation.y = Math.PI;
  clockTowerGroup.add(cfBack);

  const cfLeft = new THREE.Mesh(clockFaceGeo, clockFaceMat);
  cfLeft.position.set(-4.02, 25, 0);
  cfLeft.rotation.y = -Math.PI / 2;
  clockTowerGroup.add(cfLeft);

  const cfRight = new THREE.Mesh(clockFaceGeo, clockFaceMat);
  cfRight.position.set(4.02, 25, 0);
  cfRight.rotation.y = Math.PI / 2;
  clockTowerGroup.add(cfRight);

  // Pointed Roof
  const roofGeo = new THREE.ConeGeometry(5.8, 6, 4);
  roofGeo.rotateY(Math.PI / 4);
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.5 });
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.y = 31;
  roof.castShadow = true;
  clockTowerGroup.add(roof);

  // Courtyard Stone Wall surrounding Clock Tower
  const courtWallGeo = new THREE.BoxGeometry(28, 1.8, 0.8);
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8 });
  const cw1 = new THREE.Mesh(courtWallGeo, wallMat);
  cw1.position.set(0, 0.9, 14);
  clockTowerGroup.add(cw1);
  addCollider(cw1);

  const cw2 = new THREE.Mesh(courtWallGeo, wallMat);
  cw2.position.set(0, 0.9, -14);
  clockTowerGroup.add(cw2);
  addCollider(cw2);

  group.add(clockTowerGroup);
  landmarks.push({
    name: 'Clock Tower',
    x: -60,
    z: 40,
    bounds: { minX: -76, maxX: -44, minZ: 24, maxZ: 56 },
  });

  lootSpawns.push(
    { x: -55, y: 0.5, z: 40 },
    { x: -65, y: 0.5, z: 42 },
    { x: -60, y: 0.5, z: 52 },
    { x: -60, y: 0.5, z: 28 }
  );

  // ==========================================
  // 2. FACTORY (Free Fire Signature Roof Brawls & Industrial Warehouse)
  // Location: (50, -50)
  // ==========================================
  const factoryGroup = new THREE.Group();
  factoryGroup.position.set(50, 0, -50);

  // Main Warehouse Box
  const factoryGeo = new THREE.BoxGeometry(26, 9, 18);
  const factoryMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.65,
    roughness: 0.45,
  });
  const factory = new THREE.Mesh(factoryGeo, factoryMat);
  factory.position.y = 4.5;
  factory.castShadow = true;
  factory.receiveShadow = true;
  factoryGroup.add(factory);
  addCollider(factory);

  // Rooftop Platform (famous Factory Roof)
  const roofPlatformGeo = new THREE.BoxGeometry(24, 0.5, 16);
  const roofPlatMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
  const roofPlatform = new THREE.Mesh(roofPlatformGeo, roofPlatMat);
  roofPlatform.position.y = 9.25;
  factoryGroup.add(roofPlatform);

  // Industrial Exhaust Chimneys
  for (let i = 0; i < 3; i++) {
    const pipeGeo = new THREE.CylinderGeometry(0.8, 0.8, 6, 12);
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8 });
    const pipe = new THREE.Mesh(pipeGeo, pipeMat);
    pipe.position.set(-6 + i * 6, 12, -4);
    pipe.castShadow = true;
    factoryGroup.add(pipe);
  }

  // Exterior Catwalk Stairs
  const stairGeo = new THREE.BoxGeometry(3, 4.5, 6);
  const stairMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7 });
  const stairs = new THREE.Mesh(stairGeo, stairMat);
  stairs.position.set(14.5, 2.25, 0);
  factoryGroup.add(stairs);
  addCollider(stairs);

  group.add(factoryGroup);
  landmarks.push({
    name: 'Factory',
    x: 50,
    z: -50,
    bounds: { minX: 35, maxX: 68, minZ: -62, maxZ: -38 },
  });

  lootSpawns.push(
    { x: 38, y: 0.5, z: -48 },
    { x: 62, y: 0.5, z: -52 },
    { x: 50, y: 0.5, z: -38 },
    { x: 50, y: 9.5, z: -50 } // Loot on Factory roof!
  );

  // Explosive barrels around Factory
  for (let i = 0; i < 3; i++) {
    const barrel = createExplosiveBarrelMesh();
    const bx = 38 + i * 5;
    const bz = -36;
    barrel.position.set(bx, 0, bz);
    group.add(barrel);
    explosiveBarrels.push({ x: bx, y: 0.8, z: bz, mesh: barrel, hp: 60 });
    addCollider(barrel);
  }

  // ==========================================
  // 3. POCHINOK (Rustic Village Houses)
  // Location: (-40, -60)
  // ==========================================
  const villageHouses = [
    { x: -50, z: -60, rot: 0 },
    { x: -30, z: -70, rot: Math.PI / 4 },
    { x: -35, z: -50, rot: -Math.PI / 6 },
    { x: -20, z: -62, rot: 0 },
  ];

  villageHouses.forEach((house, idx) => {
    const houseGroup = new THREE.Group();
    houseGroup.position.set(house.x, 0, house.z);
    houseGroup.rotation.y = house.rot;

    // Walls
    const wallGeo = new THREE.BoxGeometry(8, 4.2, 6);
    const houseMat = new THREE.MeshStandardMaterial({
      color: idx % 2 === 0 ? 0x92400e : 0xb45309, // amber/terracotta wood
      roughness: 0.8,
    });
    const houseMesh = new THREE.Mesh(wallGeo, houseMat);
    houseMesh.position.y = 2.1;
    houseMesh.castShadow = true;
    houseMesh.receiveShadow = true;
    houseGroup.add(houseMesh);
    addCollider(houseMesh);

    // Pitched Roof
    const hRoofGeo = new THREE.ConeGeometry(5.8, 2.6, 4);
    hRoofGeo.rotateY(Math.PI / 4);
    const hRoofMat = new THREE.MeshStandardMaterial({ color: 0x7f1d1d, roughness: 0.6 });
    const hRoof = new THREE.Mesh(hRoofGeo, hRoofMat);
    hRoof.position.y = 5.2;
    hRoof.castShadow = true;
    houseGroup.add(hRoof);

    group.add(houseGroup);

    lootSpawns.push(
      { x: house.x + 2, y: 0.5, z: house.z + 1 },
      { x: house.x - 2, y: 0.5, z: house.z - 1 }
    );
  });

  landmarks.push({
    name: 'Pochinok',
    x: -35,
    z: -60,
    bounds: { minX: -60, maxX: -10, minZ: -80, maxZ: -40 },
  });

  // ==========================================
  // 4. PEAK (High Ground Watchtower & Rocks)
  // Location: (0, 0) Center Plateau
  // ==========================================
  const peakGroup = new THREE.Group();
  peakGroup.position.set(0, 0, 0);

  // Peak Elevated Hill
  const hillGeo = new THREE.CylinderGeometry(25, 38, 4.5, 24);
  const hillMat = new THREE.MeshStandardMaterial({ color: 0x3f6212, roughness: 0.9 });
  const hill = new THREE.Mesh(hillGeo, hillMat);
  hill.position.y = 2.25;
  hill.receiveShadow = true;
  peakGroup.add(hill);

  // Military Watchtower at Peak
  const towerStiltsGeo = new THREE.BoxGeometry(0.35, 9, 0.35);
  const towerMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
  const stilts = [
    [-2, 4.5, -2],
    [2, 4.5, -2],
    [-2, 4.5, 2],
    [2, 4.5, 2],
  ];
  stilts.forEach(([sx, sy, sz]) => {
    const stilt = new THREE.Mesh(towerStiltsGeo, towerMat);
    stilt.position.set(sx, sy + 4.5, sz);
    peakGroup.add(stilt);
  });

  // Tower Top Box
  const cabinGeo = new THREE.BoxGeometry(5.2, 2.5, 5.2);
  const cabinMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.7 });
  const cabin = new THREE.Mesh(cabinGeo, cabinMat);
  cabin.position.set(0, 13, 0);
  cabin.castShadow = true;
  peakGroup.add(cabin);
  addCollider(cabin);

  group.add(peakGroup);
  landmarks.push({
    name: 'Peak',
    x: 0,
    z: 0,
    bounds: { minX: -25, maxX: 25, minZ: -25, maxZ: 25 },
  });

  lootSpawns.push(
    { x: 0, y: 5.0, z: 0 },
    { x: 5, y: 5.0, z: -4 },
    { x: -6, y: 5.0, z: 5 },
    { x: 0, y: 14.5, z: 0 } // High value sniper loot at watchtower top!
  );

  // ==========================================
  // 5. HANGAR & SHIPPING CONTAINERS
  // Location: (65, 55)
  // ==========================================
  const hangarGroup = new THREE.Group();
  hangarGroup.position.set(65, 0, 55);

  // Arched Hangar
  const hangarGeo = new THREE.CylinderGeometry(8, 8, 22, 16, 1, false, 0, Math.PI);
  hangarGeo.rotateZ(Math.PI / 2);
  const hangarMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    metalness: 0.7,
    roughness: 0.4,
    side: THREE.DoubleSide,
  });
  const hangar = new THREE.Mesh(hangarGeo, hangarMat);
  hangar.position.y = 0;
  hangar.castShadow = true;
  hangarGroup.add(hangar);
  addCollider(hangar);

  // Shipping Containers (Red, Blue, Green)
  const containerColors = [0xb91c1c, 0x1d4ed8, 0x047857];
  for (let i = 0; i < 4; i++) {
    const contGeo = new THREE.BoxGeometry(6, 2.8, 2.6);
    const contMat = new THREE.MeshStandardMaterial({
      color: containerColors[i % containerColors.length],
      metalness: 0.7,
      roughness: 0.4,
    });
    const cont = new THREE.Mesh(contGeo, contMat);
    cont.position.set(-10 + i * 5, 1.4, 14 + (i % 2) * 3);
    cont.rotation.y = (i * 0.2);
    cont.castShadow = true;
    hangarGroup.add(cont);
    addCollider(cont);
  }

  group.add(hangarGroup);
  landmarks.push({
    name: 'Hangar',
    x: 65,
    z: 55,
    bounds: { minX: 45, maxX: 85, minZ: 40, maxZ: 75 },
  });

  lootSpawns.push(
    { x: 65, y: 0.5, z: 55 },
    { x: 58, y: 0.5, z: 66 },
    { x: 72, y: 0.5, z: 46 }
  );

  // ==========================================
  // 6. SCATTERED COVER (Trees, Boulders, Sandbags)
  // ==========================================
  // Palm Trees (40+ across the map)
  for (let i = 0; i < 45; i++) {
    const angle = (i * Math.PI * 2) / 45 + Math.random() * 0.2;
    const dist = 30 + Math.random() * 120;
    const tx = Math.cos(angle) * dist;
    const tz = Math.sin(angle) * dist;

    // Skip if right inside landmark centers
    if (Math.hypot(tx - (-60), tz - 40) < 18) continue;
    if (Math.hypot(tx - 50, tz - (-50)) < 18) continue;
    if (Math.hypot(tx - 0, tz - 0) < 15) continue;

    const tree = createPalmTreeMesh();
    tree.position.set(tx, 0, tz);
    tree.rotation.y = Math.random() * Math.PI * 2;
    group.add(tree);

    // Tree trunk collider
    const trunkBoxGeo = new THREE.BoxGeometry(0.8, 6, 0.8);
    const trunkBox = new THREE.Mesh(trunkBoxGeo);
    trunkBox.position.set(tx, 3, tz);
    trunkBox.visible = false;
    group.add(trunkBox);
    addCollider(trunkBox);
  }

  // Boulders / Rocks for tactical combat cover
  for (let i = 0; i < 25; i++) {
    const rx = (Math.random() - 0.5) * 220;
    const rz = (Math.random() - 0.5) * 220;
    const scale = 1.2 + Math.random() * 1.6;

    const rockGeo = new THREE.DodecahedronGeometry(scale, 1);
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9 });
    const rock = new THREE.Mesh(rockGeo, rockMat);
    rock.position.set(rx, scale * 0.7, rz);
    rock.castShadow = true;
    rock.receiveShadow = true;
    group.add(rock);
    addCollider(rock);
  }

  // Pre-configured player & bot spawn points around the Bermuda perimeter
  for (let i = 0; i < 30; i++) {
    const ang = (i * Math.PI * 2) / 30;
    const r = 90 + Math.sin(i * 3) * 35;
    playerSpawns.push({
      x: Math.cos(ang) * r,
      y: 0.5,
      z: Math.sin(ang) * r,
    });
  }

  return {
    group,
    colliders,
    lootSpawns,
    playerSpawns,
    explosiveBarrels,
    landmarks,
  };
}
