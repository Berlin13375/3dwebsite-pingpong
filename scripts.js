let scene, camera, renderer, paddle1, paddle2, ball;
let score1 = 0, score2 = 0;
let ballVelocity = new THREE.Vector3(0.18, 0, 0);
const keys = {};
let player1Name = "Player 1", player2Name = "Player 2";

function startGame() {
    player1Name = document.getElementById('player1Input').value || "Player 1";
    player2Name = document.getElementById('player2Input').value || "Player 2";
    
    document.getElementById('player1Name').textContent = player1Name;
    document.getElementById('player2Name').textContent = player2Name;
    document.getElementById('startScreen').style.display = 'none';
    
    init();
    animate();
}

function init() {
    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    // Forest environment
    const textureLoader = new THREE.TextureLoader();
    const bgGeometry = new THREE.SphereGeometry(500, 60, 60);
    const bgMaterial = new THREE.MeshBasicMaterial({
        map: textureLoader.load('https://threejs.org/examples/textures/equirectangular/forest_stage_01_1k.jpg'),
        side: THREE.BackSide
    });
    const background = new THREE.Mesh(bgGeometry, bgMaterial);
    scene.add(background);

    // Magical particles
    const particles = new THREE.BufferGeometry();
    const particleCount = 1000;
    const posArray = new Float32Array(particleCount * 3);
    
    for(let i = 0; i < particleCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 100;
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMaterial = new THREE.PointsMaterial({
        size: 0.1,
        color: 0x88ff88,
        transparent: true,
        opacity: 0.7
    });
    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);

    // Paddles
    const paddleGeometry = new THREE.BoxGeometry(0.6, 2.5, 1.2);
    const paddle1Material = new THREE.MeshStandardMaterial({ 
        color: 0x00ffaa,
        metalness: 0.8,
        roughness: 0.2
    });
    const paddle2Material = new THREE.MeshStandardMaterial({ 
        color: 0xff5500,
        metalness: 0.8,
        roughness: 0.2
    });

    paddle1 = new THREE.Mesh(paddleGeometry, paddle1Material);
    paddle1.position.set(-8, 0, -5);
    paddle1.castShadow = true;
    scene.add(paddle1);

    paddle2 = new THREE.Mesh(paddleGeometry, paddle2Material);
    paddle2.position.set(8, 0, -5);
    paddle2.castShadow = true;
    scene.add(paddle2);

    // Energy ball
    const ballGeometry = new THREE.SphereGeometry(0.4, 32, 32);
    const ballMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0x00ffaa,
        emissiveIntensity: 1.5,
        metalness: 0.9,
        roughness: 0.1
    });
    ball = new THREE.Mesh(ballGeometry, ballMaterial);
    ball.position.set(0, 0, -5);
    ball.castShadow = true;
    
    const ballLight = new THREE.PointLight(0x00ffaa, 2, 15);
    ball.add(ballLight);
    scene.add(ball);

    // Lighting
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(0, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    // Fog
    scene.fog = new THREE.FogExp2(0x113322, 0.015);

    // Camera
    camera.position.set(0, 10, 15);
    camera.lookAt(0, 0, -5);

    // Event listeners
    window.addEventListener('keydown', e => keys[e.code] = true);
    window.addEventListener('keyup', e => keys[e.code] = false);
    window.addEventListener('resize', onWindowResize);
}

function updateGame() {
    // Paddle movement
    if (keys.KeyW) paddle1.position.y += 0.25;
    if (keys.KeyS) paddle1.position.y -= 0.25;
    if (keys.ArrowUp) paddle2.position.y += 0.25;
    if (keys.ArrowDown) paddle2.position.y -= 0.25;

    paddle1.position.y = THREE.MathUtils.clamp(paddle1.position.y, -4, 4);
    paddle2.position.y = THREE.MathUtils.clamp(paddle2.position.y, -4, 4);

    // Ball physics
    ball.position.add(ballVelocity);
    
    // Paddle collisions
    if (Math.abs(ball.position.x - paddle1.position.x) < 0.8 &&
        Math.abs(ball.position.y - paddle1.position.y) < 1.8) {
        ballVelocity.x = 0.18;
        ballVelocity.y = (ball.position.y - paddle1.position.y) * 0.2;
        ball.material.emissive.setHex(0x00ffaa);
    }

    if (Math.abs(ball.position.x - paddle2.position.x) < 0.8 &&
        Math.abs(ball.position.y - paddle2.position.y) < 1.8) {
        ballVelocity.x = -0.18;
        ballVelocity.y = (ball.position.y - paddle2.position.y) * 0.2;
        ball.material.emissive.setHex(0xff5500);
    }

    // Wall collisions
    if (Math.abs(ball.position.y) > 5) ballVelocity.y *= -1;

    // Scoring
    if (ball.position.x > 10) {
        score1++;
        document.getElementById('player1Score').textContent = score1;
        resetBall();
    }
    if (ball.position.x < -10) {
        score2++;
        document.getElementById('player2Score').textContent = score2;
        resetBall();
    }
}

function resetBall() {
    ball.position.set(0, 0, -5);
    ballVelocity.set(0.18 * (Math.random() > 0.5 ? 1 : -1), 0, 0);
    ball.material.emissive.setHex(0xffffff);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    updateGame();
    renderer.render(scene, camera);
}