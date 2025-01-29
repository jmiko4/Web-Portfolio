// Scene setup
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.002); // Add some fog for depth
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);
// Add a directional light to simulate the sun
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
directionalLight.position.set(500, 0, 0); // Position the light (x, y, z)
directionalLight.castShadow = true; // Enable shadow casting
scene.add(directionalLight);
directionalLight.shadow.mapSize.width = 1024; // Adjust shadow map resolution
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 500;
const sunLight = new THREE.PointLight(0xffddaa, 4, 1000);
sunLight.position.set(400, 75, 0); // Position the light at the sun's position
scene.add(sunLight);

// Create stars
function createStars() {
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.2
    });

    const stars = [];
    for (let i = 0; i < 5000; i++) {
        const x = (Math.random() - 0.5) * 1000;
        const y = (Math.random() - 0.5) * 1000;
        const z = (Math.random() - 0.5) * 1000;
        stars.push(x, y, z);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(stars, 3));
    const starMesh = new THREE.Points(starGeometry, starMaterial);
    scene.add(starMesh);
}

createStars();



// Variables for the ship and model loader
let ship;
let shipModel;
const loader = new THREE.GLTFLoader();

// Load the ship model
loader.load(
    // Path to your model (make sure the path is correct)
    'models/rocket_ship_-_low_poly/scene.gltf',
    function (gltf) {
        ship = new THREE.Object3D();
        shipModel = gltf.scene;

        // Adjust scale, position, and rotation
        shipModel.scale.set(1, 1, 1);
        shipModel.position.set(0, 0, 0);
        shipModel.rotation.z = .78; // Adjust rotation
        shipModel.rotation.x = 1.15; // Adjust rotation

        ship.add(shipModel);
        scene.add(ship);

        // Camera setup
        ship.add(camera);
        camera.position.set(0, 1.5, -7.5);
        camera.lookAt(new THREE.Vector3(0, 0, 0));

        animate();
    },
    function (xhr) {
        // Called while loading is progressing
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function (error) {
        // Called when loading has errors
        console.error('An error happened', error);
    }
);




// Initialize the FontLoader
// Declare the font variable in a scope accessible to your functions
let font;

// Initialize the FontLoader
const fontLoader = new THREE.FontLoader();

// Load the font
fontLoader.load('https://threejs.org/examples/fonts/gentilis_regular.typeface.json', function (loadedFont) {
    font = loadedFont;

    // Create the initial text after the font is loaded
    createText('Welcome to Justin\'s \n    Portfolio Space', new THREE.Vector3(0, 10, 75),0,Math.PI,0);
    createText('     Fly around to\nexplore my portfolio', new THREE.Vector3(0, -20, 150),.3,Math.PI,0);
    createText('                I created this site\n     to showcase both my portfolio\n      and my programming abilities\n          turn around and explore          \nto discover my skills and experience', new THREE.Vector3(0, 10, -100),0,0,0);

    // Group Labels
    createText('Other Websites', new THREE.Vector3(75, -10, 75),0,Math.PI+.75,0);
    createText('Work Experience', new THREE.Vector3(0,25, 250),-0.3,Math.PI,0);
    createText('Acquired Skills', new THREE.Vector3(-75, -10, 75),0,Math.PI-.65,0);

    // Planet Labels
    createText('Software Engineer\n            Intern', new THREE.Vector3(50,0 ,320),0,Math.PI,0);
    createText('Quality Assurance\n   Engineer Intern', new THREE.Vector3(-50, 0, 275), 0, Math.PI, 0);
    createText('Wedding Photographer\n     & Videographer', new THREE.Vector3(45, 0, 475),0,Math.PI,0);
    createText('Web Developer', new THREE.Vector3(-50, 0, 415),0,Math.PI,0);
    createText('Miko.Photos', new THREE.Vector3(90, 0, 130),0,Math.PI+.65,0);
    createText('MidCityNursery.com', new THREE.Vector3(160, 0, 110),0,Math.PI+.65,0);


});

// Load the font and create text
function createText(textString, position, rotationX, rotationY, rotationZ) {

    // Ensure the font is loaded
    if (!font) {
        console.error('Font not loaded yet.');
        return;
    }

    // Create the TextGeometry
    const textGeometry = new THREE.TextGeometry(textString, {
        font: font,
        size: 4,
        height: .5,
        curveSegments: 12,
        bevelEnabled: false
    });

    // Center the text geometry
    textGeometry.computeBoundingBox();

    if (textGeometry.boundingBox) {
        const bbox = textGeometry.boundingBox;
        const xMid = -0.5 * (bbox.max.x - bbox.min.x);
        const yMid = -0.5 * (bbox.max.y - bbox.min.y);
        const zMid = -0.5 * (bbox.max.z - bbox.min.z);
        textGeometry.translate(xMid, yMid, zMid);
    }

    // Create a MeshStandardMaterial (or any material you prefer)
    const textMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff
    });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);

    // Position the textMesh at the specified position
    textMesh.position.copy(position);

    // Optionally, rotate the text if desired
    textMesh.rotation.y = rotationY; // Rotation around Y-axis
    textMesh.rotation.x = rotationX; // Rotation around X-axis
    textMesh.rotation.z = rotationZ; // Rotation around Z-axis

    scene.add(textMesh);
}






// Array to store planet meshes
const planets = [];

// Function to load a planet
function loadPlanet(path, position, scale, infoContent) {
    loader.load(
        path,
        function (gltf) {
            const planet = gltf.scene;

            // Store infoContent in the planet userData
            planet.userData.infoContent = infoContent;

            // Adjust scale and position
            planet.scale.set(scale, scale, scale);
            planet.position.copy(position);

            // Optionally, adjust rotation
            // planet.rotation.y = Math.PI / 2; // adjust as needed

            scene.add(planet);

            // Store planet in array for later reference
            planets.push(planet);
        },
        undefined,
        function (error) {
            console.error('An error occurred while loading the planet:', error);
        }
    );
}
// Example positions behind the text (adjust as needed)
loadPlanet('models/Earth.glb', new THREE.Vector3(-50, 0, 300), 2, '<h2>Quality Assurance Engineer Intern,</h2><h1>The Church of Jesus Christ of Latter-Day Saints</h1><p>Information about Planet One.</p>');
loadPlanet('models/Neptune2.glb', new THREE.Vector3(50, -30, 345), 1, '<h2>Planet Four</h2><p>Information about Planet Four.</p>');
loadPlanet('models/Mars.glb', new THREE.Vector3(45, 0, 500), 150, '<h2>Planet Four</h2><p>Information about Planet Four.</p>');
loadPlanet('models/Saturn.glb', new THREE.Vector3(-50, 0, 450), 15, '<h2>Planet Four</h2><p>Information about Planet Four.</p>');


loadPlanet('models/Jupiter.glb', new THREE.Vector3(105, -20, 150), .2,'<h2>Planet Two</h2><p>Information about Planet Two.</p>');
loadPlanet('models/Venus.glb', new THREE.Vector3(180, -20, 130), .2, '<h2>Planet Three</h2><p>Information about Planet Three.</p>');

loadPlanet('models/Moon.glb', new THREE.Vector3(-100, -10, 100), .3, '<h2>Planet Four</h2><p>Information about Planet Four.</p>');

loadPlanet('models/WSS.glb', new THREE.Vector3(0, 0, -200), 5,'<h2>Planet Five</h2><p>Information about Planet Five.</p>');

loadPlanet('models/Sun.glb', new THREE.Vector3(500, 0, 0), 1, '<h2>The Sun</h2><p>The sun is a deadly lazer</p>');



// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});



// Variable to store if the player is near a planet
let nearbyPlanet = null;

function checkPlanetProximity() {
    if (!ship) return; // Ensure ship is loaded
    nearbyPlanet = null; // Reset the nearby planet

    // The distance threshold for interaction
    const interactionDistance = 75; // Adjust as necessary

    // Check each planet
    planets.forEach(planet => {
        if (!planet) return; // Ensure planet is loaded

        if (!planet.position || !ship.position) return; // Additional safety check

        const distance = planet.position.distanceTo(ship.position);
        if (distance < interactionDistance) {
            nearbyPlanet = planet;

            // Visual feedback (e.g., highlight the planet)
            setPlanetHighlight(planet, true);
        } else {
            setPlanetHighlight(planet, false);
        }
    });
}

function setPlanetHighlight(planet, highlight) {
    planet.traverse(child => {
        if (child.isMesh) {
            child.material.emissive = new THREE.Color(highlight ? 0x333333 : 0x000000);
        }
    });
}

function interactWithPlanet(planet) {
    // For demonstration, we'll open an alert or navigate to another page
    // You can customize this to display information or load content dynamically

    // Example: Navigate to another page
    // window.location.href = 'planet_info.html';

    // Example: Display information in an overlay
    displayPlanetInfo(planet);
    
}

function displayPlanetInfo(planet) {
    const overlay = document.getElementById('planetInfoOverlay');
    const content = document.getElementById('planetInfoContent');
    

    // Pause the pointer lock to allow interaction with the overlay
    document.exitPointerLock();

    // Populate the content based on the planet
    content.innerHTML = `
        <button id="closeOverlayButton" class="close-button"><i class="fas fa-times"></i></button>
        ${planet.userData.infoContent}
    `;
    const closeButton = document.getElementById('closeOverlayButton');
    // Show the overlay
    overlay.style.display = 'flex';
    overlay.classList.add('active');

    // Add an event listener to close the overlay
    closeButton.onclick = function() {
        overlay.style.display = 'none';

        // Request pointer lock again
        document.body.requestPointerLock();
    };
}





// Movement controls
const moveSpeed = 2;
const rotationSpeed = 0.0005;
let keypressed = {};

document.addEventListener('keydown', (e) => {
    keypressed[e.key.toLowerCase()] = true;
});

document.addEventListener('keyup', (e) => {
    keypressed[e.key.toLowerCase()] = false;
});

function handleKeys() {
    const delta = moveSpeed * 0.1;

    // Forward and backward
    if (keypressed['w']) {
        ship.translateZ(delta);
        if (shipModel) {
            shipModel.rotation.y += .004;
        }
    }
    if (keypressed['s']) {
        ship.translateZ(-delta);
        if (shipModel) {
            shipModel.rotation.y += .002;
        }
    }

    // Left and right strafing
    if (keypressed['a']) {
        ship.translateX(delta);
        if (shipModel) {
            shipModel.rotation.y += .002;
        }
    }
    if (keypressed['d']) {
        ship.translateX(-delta);
        if (shipModel) {
            shipModel.rotation.y += .002;
        }
    }

    // Up and down
    if (keypressed[' ']) { // Space key
        ship.translateY(delta);
    }
    if (keypressed['shift']) { // Shift key
        ship.translateY(-delta);
    }

    //Reset to original position
    if (keypressed['r']) {
        ship.position.set(0, 0, 0);
        ship.rotation.set(0, 0, 0);
        yaw = 0;
        pitch = 0;
    }
    //Interact with planet
    if (keypressed['e'] && nearbyPlanet) {
        interactWithPlanet(nearbyPlanet);
    }
}

// Mouse movement
let yaw = 0;
let pitch = 0;

// Pointer lock setup
const overlay = document.getElementById('overlay');
overlay.addEventListener('click', function () {
    overlay.style.display = 'none'; // Hide overlay
    document.body.requestPointerLock();
});

function onPointerLockChange() {
    const overlay = document.getElementById('overlay');
    const planetInfoOverlay = document.getElementById('planetInfoOverlay');

    if (document.pointerLockElement === document.body) {
        if (planetInfoOverlay.style.display === 'none') {
            // Only add mousemove listener if planet info overlay is not displayed
            document.addEventListener('mousemove', onMouseMove, false);
        }
    } else {
        document.removeEventListener('mousemove', onMouseMove, false);
        if (overlay.style.display === 'none' && planetInfoOverlay.style.display === 'none') {
            overlay.style.display = ''; // Show start overlay if not in planet info
        }
    }
}

function onPointerLockError() {
    overlay.style.display = ''; // Show overlay
    alert('Pointer Lock failed');
}

document.addEventListener('pointerlockchange', onPointerLockChange, false);
document.addEventListener('pointerlockerror', onPointerLockError, false);

function onMouseMove(event) {
    if (!ship) return;

    const movementX = event.movementX || 0;
    const movementY = event.movementY || 0;

    yaw -= movementX * rotationSpeed;
    pitch += movementY * rotationSpeed;

    const PI_2 = Math.PI / 2;
    pitch = Math.max(-PI_2, Math.min(PI_2, pitch));

    // Create quaternions for pitch and yaw
    const quaternionPitch = new THREE.Quaternion();
    const quaternionYaw = new THREE.Quaternion();

    // Set up quaternion rotations around the X and Y axes
    quaternionPitch.setFromAxisAngle(new THREE.Vector3(1, 0, 0), pitch);
    quaternionYaw.setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw);

    // Combine the pitch and yaw rotations
    ship.quaternion.copy(quaternionYaw).multiply(quaternionPitch);
}

function animate() {
    requestAnimationFrame(animate);
    if (!ship) return;
    handleKeys();
    checkPlanetProximity();
    renderer.render(scene, camera);
    if (shipModel) {
        shipModel.rotation.y += .001;
    }
}

animate();