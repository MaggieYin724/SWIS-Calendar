const shell = document.querySelector('#museum-3d-shell');

if (shell) {
  bootMuseum();
}

async function bootMuseum() {
  const loading = document.querySelector('#museum-loading');
  const fallback = document.querySelector('#museum-webgl-fallback');

  try {
    const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js');
    buildMuseum(THREE);
    requestAnimationFrame(() => loading.classList.add('is-ready'));
  } catch (error) {
    loading.hidden = true;
    fallback.hidden = false;
    console.error('The 3D museum could not start.', error);
  }
}

function buildMuseum(THREE) {
  const canvas = document.querySelector('#museum-3d-canvas');
  const startScreen = document.querySelector('#museum-start');
  const enterButton = document.querySelector('#museum-enter');
  const hud = document.querySelector('#museum-hud');
  const reticle = document.querySelector('#museum-reticle');
  const locationLabel = document.querySelector('#museum-position');
  const foundLabel = document.querySelector('#museum-found');
  const prompt = document.querySelector('#artwork-prompt');
  const promptTitle = document.querySelector('#prompt-title');
  const interactButton = document.querySelector('#museum-interact');
  const panel = document.querySelector('#artwork-panel');
  const panelClose = document.querySelector('#artwork-close');
  const panelIndex = document.querySelector('#artwork-index');
  const panelTitle = document.querySelector('#artwork-title');
  const panelDescription = document.querySelector('#artwork-description');
  const panelPreview = document.querySelector('#artwork-panel-preview');
  const panelImage = document.querySelector('#artwork-panel-image');
  const panelElements = document.querySelector('#artwork-elements');
  const mobileControls = document.querySelector('#museum-mobile-controls');
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;

  const exhibits = [
    { name: 'China', local: '中国', colour: '#a9473d', accent: '#e4b05a', description: 'A community-guided exhibition connecting language, festivals, literature and visual symbols. Final selections will be checked for cultural accuracy.' },
    { name: 'Indonesia', local: 'Indonesia', colour: '#9b5944', accent: '#f2cf8a', description: 'Stories, regional traditions and community-selected imagery will show cultural variety beyond a single national symbol.' },
    { name: 'India', local: 'भारत', colour: '#a95d2e', accent: '#ecc06b', description: 'A layered exhibition combining language, celebration, pattern and community voice while recognising India’s cultural diversity.' },
    { name: 'Japan', local: '日本', colour: '#7a5e62', accent: '#edc7c2', description: 'Language, visual culture, literature and contemporary community perspectives will meet in one carefully reviewed gallery.' },
    { name: 'Italy', local: 'Italia', colour: '#53715d', accent: '#e5c797', description: 'The final exhibition will connect art, architecture, literature and personal cultural associations contributed by the community.' },
    { name: 'New Zealand', local: 'Aotearoa', colour: '#2f6370', accent: '#9ec6bd', description: 'This space will be developed with particular attention to Māori representation, consultation and appropriate attribution.' },
    { name: 'Canada', local: 'Canada', colour: '#9a443e', accent: '#f0d3ba', description: 'A plural view of place and identity, built from community memories and researched cultural references.' },
    { name: 'United States', local: 'United States', colour: '#3d5572', accent: '#d7c7a4', description: 'Regional and cultural diversity will be foregrounded instead of presenting one simplified national narrative.' },
    { name: 'United Kingdom', local: 'United Kingdom', colour: '#4c5274', accent: '#d6b5a0', description: 'Literature, architecture, language and community memories will form the basis of this cultural exhibition.' },
    { name: 'Greece', local: 'Ελλάδα', colour: '#3f7286', accent: '#e1cf91', description: 'Mythology, visual heritage and contemporary identity will be connected through research and community interpretation.' },
    { name: 'Australia', local: 'Australia', colour: '#85634a', accent: '#e0bb72', image: 'assets/australia-artwork.png', ratio: 910 / 1144, description: 'The supplied collage brings wildlife, geography, landmarks and coastal imagery into one layered visual narrative. Individual elements can become navigation points in the final exhibition page.', elements: 'Kangaroo, koala, emu, cockatoo, shells, eucalyptus, Uluru, Sydney Opera House, Harbour Bridge, coastline and state abbreviations.' },
    { name: 'Spain', local: 'España', colour: '#a34732', accent: '#efc85f', description: 'Regional diversity, language, art and community-selected stories will shape this exhibition rather than a single stereotype.' }
  ];

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1c292a);
  scene.fog = new THREE.Fog(0x1c292a, 24, 50);

  const camera = new THREE.PerspectiveCamera(66, 1, 0.08, 90);
  camera.position.set(0, 1.68, 14.5);
  camera.rotation.order = 'YXZ';

  const gallery = new THREE.Group();
  scene.add(gallery);

  const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xe9dfcf, roughness: 0.86, metalness: 0.02 });
  const ceilingMaterial = new THREE.MeshBasicMaterial({ color: 0xf8f5ee });
  const goldMaterial = new THREE.MeshStandardMaterial({ color: 0xc99a48, roughness: 0.36, metalness: 0.45 });
  const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x5c4739, roughness: 0.84 });

  function addBox(width, height, depth, x, y, z, material, castShadow = false) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
    mesh.position.set(x, y, z);
    mesh.castShadow = castShadow;
    mesh.receiveShadow = true;
    gallery.add(mesh);
    return mesh;
  }

  addBox(28, 0.24, 36, 0, -0.12, 0, floorMaterial);
  addBox(28, 0.2, 36, 0, 5.5, 0, ceilingMaterial);
  addBox(28, 5.6, 0.34, 0, 2.7, -18, wallMaterial);
  addBox(28, 5.6, 0.34, 0, 2.7, 18, wallMaterial);
  addBox(0.34, 5.6, 36, -14, 2.7, 0, wallMaterial);
  addBox(0.34, 5.6, 36, 14, 2.7, 0, wallMaterial);

  for (let z = -15; z <= 15; z += 6) {
    addBox(27.6, 0.12, 0.18, 0, 5.34, z, ceilingMaterial);
  }
  for (let z = -15; z <= 15; z += 3) {
    const line = addBox(27.4, 0.015, 0.025, 0, 0.015, z, goldMaterial);
    line.receiveShadow = false;
  }
  for (let x = -12; x <= 12; x += 3) {
    const line = addBox(0.025, 0.015, 35.5, x, 0.016, 0, goldMaterial);
    line.receiveShadow = false;
  }

  const hemi = new THREE.HemisphereLight(0xfff1d5, 0x26383a, 2.1);
  scene.add(hemi);
  const entranceLight = new THREE.PointLight(0xf2be6f, 28, 24, 2);
  entranceLight.position.set(0, 4.4, 14);
  entranceLight.castShadow = true;
  scene.add(entranceLight);

  [-12, -6, 0, 6, 12].forEach((z) => {
    const light = new THREE.PointLight(0xffe6bb, 18, 11, 2);
    light.position.set(0, 4.8, z);
    scene.add(light);
    const fixture = new THREE.Mesh(new THREE.CylinderGeometry(.32, .32, .11, 24), goldMaterial);
    fixture.rotation.x = Math.PI / 2;
    fixture.position.set(0, 5.22, z);
    gallery.add(fixture);
  });

  function createArtworkTexture(exhibit, index) {
    const artCanvas = document.createElement('canvas');
    artCanvas.height = exhibit.image ? 900 : 620;
    artCanvas.width = exhibit.image ? Math.round(900 * exhibit.ratio) : 900;
    const context = artCanvas.getContext('2d');
    context.fillStyle = exhibit.colour;
    context.fillRect(0, 0, artCanvas.width, artCanvas.height);

    const texture = new THREE.CanvasTexture(artCanvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    if (exhibit.image) {
      context.fillStyle = 'rgba(255,255,255,.82)';
      context.textAlign = 'center';
      context.font = '42px Georgia';
      context.fillText(`Loading ${exhibit.name} artwork…`, artCanvas.width / 2, artCanvas.height / 2);
      const suppliedArtwork = new Image();
      suppliedArtwork.addEventListener('load', () => {
        context.clearRect(0, 0, artCanvas.width, artCanvas.height);
        context.drawImage(suppliedArtwork, 0, 0, artCanvas.width, artCanvas.height);
        texture.needsUpdate = true;
      });
      suppliedArtwork.src = exhibit.image;
      return texture;
    }

    const gradient = context.createLinearGradient(0, 0, artCanvas.width, artCanvas.height);
    gradient.addColorStop(0, 'rgba(255,255,255,.2)');
    gradient.addColorStop(.5, 'rgba(255,255,255,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,.22)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, artCanvas.width, artCanvas.height);

    context.strokeStyle = exhibit.accent;
    context.lineWidth = 8;
    for (let ring = 0; ring < 4; ring += 1) {
      context.beginPath();
      context.arc(160 + index * 17, 175 + ring * 48, 115 + ring * 38, 0, Math.PI * 1.62);
      context.stroke();
    }
    context.globalAlpha = .72;
    context.fillStyle = exhibit.accent;
    context.beginPath();
    context.moveTo(560, 110);
    context.lineTo(790, 260);
    context.lineTo(640, 510);
    context.lineTo(455, 355);
    context.closePath();
    context.fill();
    context.globalAlpha = 1;

    context.fillStyle = '#fff9ed';
    context.font = '32px Arial';
    context.letterSpacing = '5px';
    context.fillText(String(index + 1).padStart(2, '0'), 52, 70);
    context.font = '72px Georgia';
    context.fillText(exhibit.local, 52, 535);
    context.font = '22px Arial';
    context.fillText('LIVING CULTURE · COMMUNITY EXHIBITION', 55, 580);

    return texture;
  }

  const artworkMeshes = [];
  const artworkFrames = [];
  const zPositions = [-13.5, -8.2, -2.9, 2.9, 8.2, 13.5];

  exhibits.forEach((exhibit, index) => {
    const group = new THREE.Group();
    const isLeft = index < 6;
    const z = zPositions[index % 6];
    group.position.set(isLeft ? -13.72 : 13.72, 3.05, z);
    group.rotation.y = isLeft ? Math.PI / 2 : -Math.PI / 2;

    const artHeight = exhibit.image ? (exhibit.ratio > 1.5 ? 2 : 3.45) : 2.66;
    const artWidth = exhibit.image ? artHeight * exhibit.ratio : 3.82;
    const frame = new THREE.Mesh(new THREE.BoxGeometry(artWidth + .46, artHeight + .46, .16), goldMaterial.clone());
    frame.castShadow = true;
    frame.userData.baseScale = 1;
    group.add(frame);

    const matte = new THREE.Mesh(new THREE.PlaneGeometry(artWidth + .24, artHeight + .24), new THREE.MeshBasicMaterial({ color: 0xf8efd8 }));
    matte.position.z = .09;
    group.add(matte);

    const art = new THREE.Mesh(new THREE.PlaneGeometry(artWidth, artHeight), new THREE.MeshBasicMaterial({ map: createArtworkTexture(exhibit, index), toneMapped: false }));
    art.position.z = .105;
    art.userData = { exhibit, index, frame };
    group.add(art);
    artworkMeshes.push(art);
    artworkFrames.push(frame);
    gallery.add(group);

    const spotlight = new THREE.SpotLight(0xffdfaa, 35, 10, Math.PI / 5, .55, 1.5);
    spotlight.position.set(isLeft ? -9.8 : 9.8, 4.8, z);
    spotlight.target.position.copy(group.position);
    scene.add(spotlight, spotlight.target);
  });

  function createSignTexture() {
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 1100;
    signCanvas.height = 300;
    const context = signCanvas.getContext('2d');
    context.fillStyle = '#263d40';
    context.fillRect(0, 0, 1100, 300);
    context.strokeStyle = '#c99a48';
    context.lineWidth = 8;
    context.strokeRect(18, 18, 1064, 264);
    context.fillStyle = '#f7ead2';
    context.textAlign = 'center';
    context.font = '86px Georgia';
    context.fillText('LIVING CULTURE MUSEUM', 550, 142);
    context.fillStyle = '#d7b56e';
    context.font = '28px Arial';
    context.fillText('COMMUNITY VOICES · SHARED STORIES', 550, 218);
    const texture = new THREE.CanvasTexture(signCanvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  const museumSign = new THREE.Mesh(new THREE.PlaneGeometry(10.5, 2.85), new THREE.MeshBasicMaterial({ map: createSignTexture(), toneMapped: false }));
  museumSign.position.set(0, 3.15, -17.79);
  gallery.add(museumSign);

  function addPlaque(parent, title, subtitle) {
    const plaqueCanvas = document.createElement('canvas');
    plaqueCanvas.width = 700;
    plaqueCanvas.height = 260;
    const context = plaqueCanvas.getContext('2d');
    context.fillStyle = '#f3ead9';
    context.fillRect(0, 0, 700, 260);
    context.strokeStyle = '#c99a48';
    context.lineWidth = 12;
    context.strokeRect(10, 10, 680, 240);
    context.fillStyle = '#6d342d';
    context.textAlign = 'center';
    context.font = '50px Georgia';
    context.fillText(title, 350, 105);
    context.fillStyle = '#685b4e';
    context.font = '25px Arial';
    context.fillText(subtitle, 350, 165);
    const texture = new THREE.CanvasTexture(plaqueCanvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const plaque = new THREE.Mesh(new THREE.PlaneGeometry(1.7, .63), new THREE.MeshBasicMaterial({ map: texture, toneMapped: false }));
    plaque.position.set(0, .16, 1.131);
    parent.add(plaque);
  }

  function addStoryVessel(x, z) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    gallery.add(group);
    const pedestal = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.05, 2.3), new THREE.MeshStandardMaterial({ color: 0xd9c9b0, roughness: .72 }));
    pedestal.position.y = .52;
    pedestal.castShadow = true;
    pedestal.receiveShadow = true;
    group.add(pedestal);
    addPlaque(group, 'STORY VESSEL', 'Shared objects · shared memory');

    const profile = [
      new THREE.Vector2(.22, 0), new THREE.Vector2(.68, .12), new THREE.Vector2(.86, .58),
      new THREE.Vector2(.78, 1.16), new THREE.Vector2(.52, 1.62), new THREE.Vector2(.48, 1.84),
      new THREE.Vector2(.65, 1.93), new THREE.Vector2(.64, 2.06), new THREE.Vector2(.4, 2.12)
    ];
    const vessel = new THREE.Mesh(
      new THREE.LatheGeometry(profile, 64),
      new THREE.MeshStandardMaterial({ color: 0xa4473b, roughness: .3, metalness: .08 })
    );
    vessel.position.y = 1.08;
    vessel.castShadow = true;
    group.add(vessel);

    [1.46, 1.86, 2.32].forEach((height, index) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(index === 2 ? .51 : .76, .035, 12, 64),
        goldMaterial
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = height;
      ring.castShadow = true;
      group.add(ring);
    });
    return { object: vessel, rotationRate: .08 };
  }

  function addCommunityBook(x, z) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.rotation.y = -.22;
    gallery.add(group);
    const pedestal = new THREE.Mesh(new THREE.BoxGeometry(2.7, 1.05, 2.4), new THREE.MeshStandardMaterial({ color: 0xd9c9b0, roughness: .72 }));
    pedestal.position.y = .52;
    pedestal.castShadow = true;
    pedestal.receiveShadow = true;
    group.add(pedestal);
    addPlaque(group, 'STORIES WE CARRY', 'Languages · memories · community');

    const coverMaterial = new THREE.MeshStandardMaterial({ color: 0x7b302a, roughness: .48 });
    const pageMaterial = new THREE.MeshStandardMaterial({ color: 0xf5ead5, roughness: .92 });
    const leftCover = new THREE.Mesh(new THREE.BoxGeometry(1.32, .09, 1.78), coverMaterial);
    const rightCover = leftCover.clone();
    leftCover.position.set(-.63, 1.28, 0);
    rightCover.position.set(.63, 1.28, 0);
    leftCover.rotation.z = -.13;
    rightCover.rotation.z = .13;
    group.add(leftCover, rightCover);

    const leftPage = new THREE.Mesh(new THREE.BoxGeometry(1.24, .055, 1.65), pageMaterial);
    const rightPage = leftPage.clone();
    leftPage.position.set(-.59, 1.38, 0);
    rightPage.position.set(.59, 1.38, 0);
    leftPage.rotation.z = -.13;
    rightPage.rotation.z = .13;
    leftPage.castShadow = true;
    rightPage.castShadow = true;
    group.add(leftPage, rightPage);

    [-.34, 0, .34].forEach((offset, index) => {
      const lineMaterial = new THREE.MeshStandardMaterial({ color: index === 1 ? 0xc99a48 : 0x9a3e33, roughness: .6 });
      const leftLine = new THREE.Mesh(new THREE.BoxGeometry(.78, .02, .035), lineMaterial);
      const rightLine = leftLine.clone();
      leftLine.position.set(-.61, 1.425, offset);
      rightLine.position.set(.61, 1.425, offset);
      leftLine.rotation.z = -.13;
      rightLine.rotation.z = .13;
      group.add(leftLine, rightLine);
    });
    return { object: group, rotationRate: 0 };
  }

  const culturalObjects = [
    addStoryVessel(-3.3, -5.5),
    addCommunityBook(3.3, 4.6)
  ];

  const raycaster = new THREE.Raycaster();
  const keys = new Set();
  const discovered = new Set();
  const clock = new THREE.Clock();
  let started = false;
  let currentArtwork = null;
  let yaw = 0;
  let pitch = 0;
  let draggingView = false;
  let pointerX = 0;
  let pointerY = 0;
  let sectionVisible = true;

  function updateCameraRotation() {
    camera.rotation.set(pitch, yaw, 0, 'YXZ');
  }

  function setStarted() {
    started = true;
    startScreen.hidden = true;
    hud.classList.add('is-active');
    reticle.classList.add('is-active');
    if (coarsePointer || window.innerWidth <= 900) {
      mobileControls.classList.add('is-active');
    } else if (canvas.requestPointerLock) {
      canvas.requestPointerLock();
    }
  }

  function openArtwork() {
    if (!currentArtwork) return;
    const { exhibit, index } = currentArtwork.userData;
    discovered.add(index);
    foundLabel.textContent = String(discovered.size);
    panelIndex.textContent = `${String(index + 1).padStart(2, '0')} / 12`;
    panelTitle.textContent = `${exhibit.name} · ${exhibit.local}`;
    panelDescription.textContent = exhibit.description;
    panelElements.textContent = exhibit.elements || 'Colour, pattern, place, language and community-selected cultural references.';
    panelPreview.hidden = !exhibit.image;
    if (exhibit.image) {
      panelImage.src = exhibit.image;
      panelImage.alt = `${exhibit.name} cultural artwork supplied for the project`;
    } else {
      panelImage.removeAttribute('src');
      panelImage.alt = '';
    }
    panel.hidden = false;
    if (document.pointerLockElement === canvas) document.exitPointerLock();
  }

  function closeArtwork() {
    panel.hidden = true;
    if (!coarsePointer && started && canvas.requestPointerLock) canvas.requestPointerLock();
  }

  enterButton.addEventListener('click', setStarted);
  interactButton.addEventListener('click', openArtwork);
  panelClose.addEventListener('click', closeArtwork);

  canvas.addEventListener('click', () => {
    if (started && !coarsePointer && panel.hidden && document.pointerLockElement !== canvas && canvas.requestPointerLock) {
      canvas.requestPointerLock();
    }
  });

  document.addEventListener('mousemove', (event) => {
    if (!started || !panel.hidden) return;
    if (document.pointerLockElement === canvas) {
      yaw -= event.movementX * .0018;
      pitch -= event.movementY * .0016;
      pitch = Math.max(-1.2, Math.min(1.2, pitch));
      updateCameraRotation();
    }
  });

  canvas.addEventListener('pointerdown', (event) => {
    if (!started || !panel.hidden || document.pointerLockElement === canvas) return;
    draggingView = true;
    pointerX = event.clientX;
    pointerY = event.clientY;
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove', (event) => {
    if (!draggingView || document.pointerLockElement === canvas) return;
    const dx = event.clientX - pointerX;
    const dy = event.clientY - pointerY;
    pointerX = event.clientX;
    pointerY = event.clientY;
    yaw -= dx * .006;
    pitch -= dy * .005;
    pitch = Math.max(-1.15, Math.min(1.15, pitch));
    updateCameraRotation();
  });
  const stopViewDrag = () => { draggingView = false; };
  canvas.addEventListener('pointerup', stopViewDrag);
  canvas.addEventListener('pointercancel', stopViewDrag);

  document.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (started && ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) event.preventDefault();
    keys.add(key);
    if ((key === 'e' || key === 'enter') && panel.hidden) openArtwork();
  });
  document.addEventListener('keyup', (event) => keys.delete(event.key.toLowerCase()));
  window.addEventListener('blur', () => keys.clear());

  mobileControls.querySelectorAll('button').forEach((button) => {
    const move = button.dataset.move;
    const keyboardKey = { forward: 'w', back: 's', left: 'a', right: 'd' }[move];
    button.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      keys.add(keyboardKey);
      button.setPointerCapture(event.pointerId);
    });
    const stop = () => keys.delete(keyboardKey);
    button.addEventListener('pointerup', stop);
    button.addEventListener('pointercancel', stop);
    button.addEventListener('pointerleave', stop);
  });

  document.addEventListener('pointerlockchange', () => {
    if (!started || coarsePointer) return;
    locationLabel.textContent = document.pointerLockElement === canvas ? getLocationName() : 'Paused · click the scene to look';
  });

  function getLocationName() {
    if (camera.position.z > 10) return 'Entrance Hall';
    if (camera.position.z > 2) return 'Stories Gallery';
    if (camera.position.z > -7) return 'Community Gallery';
    return 'Heritage Gallery';
  }

  function updateMovement(delta) {
    if (!started || !panel.hidden) return;
    const speed = (keys.has('shift') ? 6.2 : 4.2) * delta;
    let forward = 0;
    let sideways = 0;
    if (keys.has('w') || keys.has('arrowup')) forward += 1;
    if (keys.has('s') || keys.has('arrowdown')) forward -= 1;
    if (keys.has('d') || keys.has('arrowright')) sideways += 1;
    if (keys.has('a') || keys.has('arrowleft')) sideways -= 1;
    if (!forward && !sideways) return;

    const length = Math.hypot(forward, sideways) || 1;
    forward /= length;
    sideways /= length;
    const dx = (Math.sin(yaw) * forward + Math.cos(yaw) * sideways) * speed;
    const dz = (-Math.cos(yaw) * forward + Math.sin(yaw) * sideways) * speed;
    camera.position.x = Math.max(-12.35, Math.min(12.35, camera.position.x + dx));
    camera.position.z = Math.max(-16.4, Math.min(16.4, camera.position.z + dz));
    locationLabel.textContent = getLocationName();
  }

  function updateArtworkFocus() {
    if (!started || !panel.hidden) return;
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const hits = raycaster.intersectObjects(artworkMeshes, false);
    const next = hits.length && hits[0].distance < 6.5 ? hits[0].object : null;
    if (next === currentArtwork) return;

    artworkFrames.forEach((frame) => {
      frame.material.emissive.setHex(0x000000);
      frame.scale.setScalar(1);
    });
    currentArtwork = next;
    const near = Boolean(currentArtwork);
    reticle.classList.toggle('is-near', near);
    prompt.hidden = !near;
    interactButton.hidden = !near;
    if (near) {
      currentArtwork.userData.frame.material.emissive.setHex(0x5f3814);
      currentArtwork.userData.frame.scale.setScalar(1.015);
      promptTitle.textContent = currentArtwork.userData.exhibit.name;
    }
  }

  function resize() {
    const width = shell.clientWidth;
    const height = shell.clientHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(shell);
  resize();

  const visibilityObserver = new IntersectionObserver(([entry]) => {
    sectionVisible = entry.isIntersecting;
  }, { rootMargin: '200px' });
  visibilityObserver.observe(shell);

  function animate() {
    const delta = Math.min(clock.getDelta(), .05);
    if (sectionVisible) {
      updateMovement(delta);
      updateArtworkFocus();
      culturalObjects.forEach(({ object, rotationRate }) => {
        object.rotation.y += delta * rotationRate;
      });
      renderer.render(scene, camera);
    }
    requestAnimationFrame(animate);
  }

  animate();
}
