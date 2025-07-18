// Scene setup
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.002); // Add some fog for depth
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    antialias: true
});

//Pi
const pi = Math.PI;

// Physics constants
const ACCELERATION = 0.006; // How quickly we speed up
const MAX_VELOCITY = 4.0; // Maximum speed
const DRAG = 0.99; // Drag coefficient (1 = no drag, 0.99 = slight drag)
const ROTATION_DRAG = 0.95; // Drag for rotation
const BOOST_MULTIPLIER = 2; // How much faster boost makes you go

// Movement variables
let velocity = new THREE.Vector3(0, 0, 0); // Current velocity
let rotationalVelocity = new THREE.Vector3(0, 0, 0); // Current rotational velocity
const moveSpeed = 2;
const rotationSpeed = 0.0005;
let keypressed = {};
// Mouse movement
let yaw = pi;
let pitch = 0;

// Variable to store if the player is near a planet
let nearbyPlanet = null;

// Pointer lock setup
const overlay = document.getElementById('overlay');
const infoDiv = document.getElementById('info');

// Array to store planet meshes
const planets = [];
// Array to store collision data for planets
const planetColliders = [];

// Declare the font variable in a scope accessible to your functions
let font;

// Initialize the FontLoader
const fontLoader = new THREE.FontLoader();

// Variables for the ship and model loader
let ship;
let shipModel;
const loader = new THREE.GLTFLoader();

// Audio setup
let backgroundMusic;
let isMuted = false;
const audioListener = new THREE.AudioListener();
setupBackgroundMusic()
setupAudioControls()



renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});


camera.add(audioListener);
// Create a function to load and setup music
function setupBackgroundMusic() {
    backgroundMusic = new THREE.Audio(audioListener);
    const audioLoader = new THREE.AudioLoader();

    audioLoader.load('Ressurections.mp3', function (buffer) {
        backgroundMusic.setBuffer(buffer);
        backgroundMusic.setLoop(true);
        backgroundMusic.setVolume(0.5);
        // Don't autoplay - wait for user interaction
    });
}

// Add music controls
function setupAudioControls() {
    // Create a floating music control panel
    const audioControl = document.createElement('div');
    audioControl.id = 'audioControl';
    audioControl.innerHTML = `
        <div class="audio-panel">
            <button id="toggleMusic"><i class="fas fa-volume-mute"></i></button>
            <input type="range" id="volumeSlider" min="0" max="100" value="50">
        </div>
    `;
    document.body.appendChild(audioControl);

    // Style the control panel
    const style = document.createElement('style');
    style.textContent = `
        .audio-panel {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.7);
            padding: 10px;
            border-radius: 5px;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 1000;
        }
        #toggleMusic {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            padding: 5px;
        }
        #volumeSlider {
            width: 100px;
        }
    `;
    document.head.appendChild(style);

    // Add event listeners
    document.getElementById('toggleMusic').onclick = toggleMusic;
    document.getElementById('volumeSlider').oninput = adjustVolume;
}

function toggleMusic() {
    if (!backgroundMusic.isPlaying) {
        backgroundMusic.play();
        document.getElementById('toggleMusic').innerHTML = '<i class="fas fa-volume-up"></i>';
    } else {
        backgroundMusic.pause();
        document.getElementById('toggleMusic').innerHTML = '<i class="fas fa-volume-mute"></i>';
    }
}

function adjustVolume(e) {
    const volume = e.target.value / 100;
    backgroundMusic.setVolume(volume);
}




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


// Load the ship model
loader.load(
    // Path to your model (make sure the path is correct)
    'models/rocket_ship_-_low_poly/scene.gltf',
    function (gltf) {
        ship = new THREE.Object3D();
        shipModel = gltf.scene;

        ship.rotation.y = pi; // Adjust rotation

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


// Load the font
fontLoader.load('fonts/Font.json', function (loadedFont) {
    font = loadedFont;

    // Create the initial text after the font is loaded
    createText('Welcome to Justin\'s \n  Portfolio Space', new THREE.Vector3(0, 40, -100), .3, 0, 0);
    createText('      Turn around and explore          \nto discover my skills and experience', new THREE.Vector3(0, -10, -100), -.3, 0, 0);

    // Group Labels
    createText('Acquired Skills', new THREE.Vector3(-75, -10, 75), 0, pi - .65, 0);
    createText('Education', new THREE.Vector3(-100, -13, 30), 0, pi - .85, 0);


    // Planet Labels
    createText('Data Engineer', new THREE.Vector3(-50, -13, 275), 0, pi, 0);
    createText('Software Engineer\n            Intern', new THREE.Vector3(50, -13, 305), 0, pi, 0);
    createText('Quality Assurance\n   Engineer Intern', new THREE.Vector3(-60, -13, 440), 0, pi, 0);
    createText('Web Developer', new THREE.Vector3(55, -13, 525), 0, pi, 0);
    createText('Miko.Photos', new THREE.Vector3(70, -13, 100), 0, pi + .65, 0);
    createText('MidCityNursery.com', new THREE.Vector3(110, -13, 60), 0, pi + .65, 0);

    //Directions
    createText('↑ Other Websites ↑', new THREE.Vector3(70, -50, 55), pi / 2 - .4, pi + .4, .7);
    createText('       Work    \n↑   Experience   ↑', new THREE.Vector3(0, -30, 150), pi / 2 - .7, pi, 0);
    createText('Collide with a planet\nor press E to interact', new THREE.Vector3(0, 45, 150), -0.3, pi, 0);
    createText('↑ Qualifications ↑', new THREE.Vector3(-70, -50, 55), pi / 2 - .4, pi - .4, -.7);


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


// Function to load a planet
function loadPlanet(path, position, scale, colliderScale, colliderOffset, infoContent) {
    loader.load(
        path,
        function (gltf) {
            const planet = gltf.scene;

            // Store infoContent in the planet userData
            planet.userData.infoContent = infoContent;

            // Adjust scale and position
            planet.scale.set(scale, scale, scale);
            planet.position.copy(position);

            // Create a collision sphere
            const boundingSphere = new THREE.Sphere(
                planet.position.clone().add(new THREE.Vector3(0, colliderOffset, 0)), // Add an offset for some planets
                colliderScale * 20 // Adjust this multiplier to match your planet's visible size
            );

            // Store collision data
            planetColliders.push({
                planet: planet,
                sphere: boundingSphere
            });

            // Optionally, adjust rotation
            // planet.rotation.y = pi / 2; // adjust as needed

            scene.add(planet);

            // Store planet in array for later reference
            planets.push(planet);

            // Visualize the collision sphere (for debugging)
            // const sphereGeometry = new THREE.SphereGeometry(boundingSphere.radius, 32, 32);
            // const sphereMaterial = new THREE.MeshBasicMaterial({ 
            //     color: 0xff0000, 
            //     wireframe: true,
            //     transparent: true,
            //     opacity: 0.3 
            // });
            // const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
            // sphereMesh.position.copy(boundingSphere.center);
            // scene.add(sphereMesh);
        },
        undefined,
        function (error) {
            console.error('An error occurred while loading the planet:', error);
        }
    );
}
// Example positions behind the text (adjust as needed)
loadPlanet('models/Earth.glb', new THREE.Vector3(-50, 0, 300), 2, .9, 0, '<h2>Data Engineer</h2><h3>PowerSchool (Contracted via Vespa Group LLC)</h3><h4>April 2025 - August 2025</h4><ul> <li>Validated data across 435 migrated databases over 4 months, ensuring accuracy and integrity post-migration during a state-wide data migration project.</li> <li>Queried SQL Server databases to verify data and investigate issues.</li> <li>Identified, troubleshot, and remediated migration errors to maintain data consistency.</li> </ul>');
loadPlanet('models/Neptune2.glb', new THREE.Vector3(50, -30, 345), 1, 1.7, 30, '<h2>Software Engineer Intern</h2><h3>The Church of Jesus Christ of Latter-Day Saints </h3><h4>August 2023 - April 2024</h4><ul> <li>Maintained and developed components for <a href="https://www.churchofjesuschrist.org/comeuntochrist" target="_blank">ComeUntoChrist.org</a>, a worldwide website with over 50,000 monthly visitors  </li> <li>Worked in a team environment with experienced developers and managers.  </li> <li>Utilized JavaScript, Node JS, HTML, CSS to deliver refined results to our page visitors.</li> </ul>');
loadPlanet('models/Mars.glb', new THREE.Vector3(55, 0, 550), 150, 1, 0, '<h2>Web Developer</h2><h3>Mid City Nursery Inc.</h3><h4>April 2022 - September 2022</h4> <ul> <li>Redesigned and coded the <a href="https://www.midcitynursery.com/" target="_blank">Mid City Nursery website</a> to add new functionality and improve customer experience.   </li> <li>Worked closely with the company owner to satisfy his expectations.    </li> <li>Utilized HTML, CSS, JavaScript, and jQuery to add features and design the website. </li> </ul>');
loadPlanet('models/Saturn.glb', new THREE.Vector3(-60, 0, 475), 15, 1, 0, '<h2>Quality Assurance Engineer Intern</h2><h3>The Church of Jesus Christ of Latter-Day Saints </h3><h4>April 2023 - August 2023</h4><ul> <li>Tested components for <a href="https://www.churchofjesuschrist.org/comeuntochrist" target="_blank">ComeUntoChrist.org</a>, a worldwide website with over 50,000 monthly visitors. </li> <li>Worked in a team environment with experienced developers and managers. </li> <li>Utilized industry leading manual, automated, and performance testing methods including Cypress Automated Testing with YAML pipeline integration.</li> </ul>');

loadPlanet('models/Jupiter.glb', new THREE.Vector3(90, -20, 130), .2, 1.1, 20, '<h2><a href="https://miko.photos/" target="_blank">Miko.Photos</a></h2><a href="https://miko.photos/" target="_blank"><img src="miko-photos.png" class="planetImg"></a><ul><li>My photography portfolio</li><li>Designed and programmed by me</li><li>Photos and videos also taken by me</li></ul>');
loadPlanet('models/Venus.glb', new THREE.Vector3(135, -20, 80), .2, 1.1, 20, '<h2><a href="https://www.midcitynursery.com" target="_blank">MidCityNursery.com</a></h2><a href="https://midcitynursery.com/" target="_blank"><img src="midcitynursery.png" class="planetImg"></a><ul><li>Website I redesigned and programmed for local plant nursery Mid City Nursery Inc.</li><li>Worked closely with the company owner to satisfy his expectations.</li><li>Here is the website <a href="https://web.archive.org/web/20210227004213/https://www.midcitynursery.com/index.htm" target="_blank">before the redesign</a>, and <a href="https://www.midcitynursery.com" target="_blank">here it is after</a></li></ul>');

loadPlanet('models/Moon.glb', new THREE.Vector3(-90, -10, 100), .3, .6, 11, '<h2>Key Skills</h2><ul><li>Experienced in Java, HTML, CSS, Python, C#, JavaScript, C, C++, Cypress, TensorFlow, YAML, SQL</li><li>Fluent in Spanish</li><li>Proficient in Adobe Lightroom, Premiere Pro</li></ul>');
loadPlanet('models/Jupiter2.glb', new THREE.Vector3(-130, -10, 50), .4, 1, 12, '<h2>Bachelor\'s of Science</h2><h3>Software Engineering</h3><ul><li>Graduated from BYU-Idaho December 2024</li><li>Maintained a 4.0 GPA</li><li>Received an embedded systems and a computer programming certificate</li></ul>');

loadPlanet('models/WSS.glb', new THREE.Vector3(0, 0, -200), 5, 1, 0, '<h2>My cats</h2><h4>Stinky and Lil\' Lady</h4><img  src="images/cats.jpg" alt="Please Hire Me (image of my cats)" style="width: 100%; height: auto;">');

loadPlanet('models/Sun.glb', new THREE.Vector3(500, 0, 0), 1, 3, 80, '<h2>Why space?</h2><p>Space is cool</p>');


// Load the asteroid belt but don't add it to the planets array
loader.load(
    'models/Asteroids.glb',
    function (gltf) {
        const asteroidBelt = gltf.scene;

        // Adjust scale and position
        asteroidBelt.scale.set(50, 50, 50);
        asteroidBelt.position.set(-250, 0, -20);

        // Optionally, adjust rotation
        asteroidBelt.rotation.y = pi / 2; // adjust as needed

        scene.add(asteroidBelt);
    },
    undefined,
    function (error) {
        console.error('An error occurred while loading the asteroid belt:', error);
    }
);

function rotatePlanets() {
    planets.forEach(planet => {
        if (planet) {
            planet.rotation.y += 0.0005; // Adjust the rotation speed as needed
        }
    });
}

// Add collision detection function
function checkPlanetCollisions() {
    if (!ship) return;

    // Create a small sphere for the ship
    const shipRadius = 2; // Adjust based on your ship's size
    const shipSphere = new THREE.Sphere(ship.position.clone(), shipRadius);

    for (let collider of planetColliders) {
        // Check if ship's sphere intersects with planet's sphere
        const distance = shipSphere.center.distanceTo(collider.sphere.center);
        const minDistance = shipSphere.radius + collider.sphere.radius;

        if (distance < minDistance) {
            // Collision detected!
            handlePlanetCollision(collider.sphere);
            console.log('Collision detected with planet:', collider.planet.userData.infoContent);
        }
    }
}

// Add collision response function
function handlePlanetCollision(planetSphere) {
    // Calculate the collision normal
    const normal = new THREE.Vector3()
        .subVectors(ship.position, planetSphere.center)
        .normalize();

    // Reflect velocity off the surface (bounce)
    velocity.reflect(normal);

    // Reduce velocity for energy loss
    velocity.multiplyScalar(0.5); // Adjust this value to control "bounciness"

    // Push the ship out of the planet to prevent getting stuck
    const overlap = planetSphere.radius + 2 - ship.position.distanceTo(planetSphere.center);
    if (overlap > 0) {
        ship.position.add(normal.multiplyScalar(overlap + 0.1));
    }
    interactWithPlanet(nearbyPlanet);
}

function checkPlanetProximity() {
    if (!ship) return; // Ensure ship is loaded
    if (planets.length === 0) return;

    nearbyPlanet = null; // Reset the nearby planet
    let isNearPlanet = false;

    // The distance threshold for interaction
    const interactionDistance = 55; // Adjust as necessary

    // Check each planet
    planets.forEach(planet => {
        if (!planet) return; // Ensure planet is loaded

        if (!planet.position || !ship.position) return; // Additional safety check

        const distance = planet.position.distanceTo(ship.position);
        if (distance < interactionDistance) {
            nearbyPlanet = planet;
            isNearPlanet = true;
            // Visual feedback (e.g., highlight the planet)
            setPlanetHighlight(planet, true);
        } else {
            setPlanetHighlight(planet, false);
        }
    });

    // Show or hide the interaction prompt
    const interactionPrompt = document.getElementById('interactionPrompt');
    if (isNearPlanet) {
        if (!interactionPrompt.classList.contains('show')) {
            interactionPrompt.classList.remove('hide');
            interactionPrompt.classList.add('show');
        }
    } else {
        if (interactionPrompt.classList.contains('show')) {
            interactionPrompt.classList.remove('show');
            interactionPrompt.classList.add('hide');
        }
    }
}

function setPlanetHighlight(planet, highlight) {
    planet.traverse(child => {
        if (child.isMesh) {
            child.material.emissive = new THREE.Color(highlight ? 0x333333 : 0x000000);
        }
    });
}

function interactWithPlanet(planet) {
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
    closeButton.onclick = function () {
        overlay.style.display = 'none';

        // Request pointer lock again
        document.body.requestPointerLock();
    };
}


// Event listeners
document.addEventListener('keydown', (e) => {
    keypressed[e.key.toLowerCase()] = true;
});

document.addEventListener('keyup', (e) => {
    keypressed[e.key.toLowerCase()] = false;
});

function handleKeys() {
    if (!ship) return;

    // Calculate acceleration based on ship's orientation
    const forward = new THREE.Vector3(0, 0, -1);
    const right = new THREE.Vector3(1, 0, 0);
    forward.applyQuaternion(ship.quaternion);
    right.applyQuaternion(ship.quaternion);

    // Apply acceleration based on input
    if ((keypressed['w'] || keypressed['arrowup']) && !keypressed[' ']) {
        velocity.add(forward.multiplyScalar(-ACCELERATION));
        if (shipModel) {
            shipModel.rotation.y += .004;
        }
    }
    if (keypressed['s'] || keypressed['arrowdown']) {
        velocity.add(forward.multiplyScalar(ACCELERATION));
        if (shipModel) {
            shipModel.rotation.y += .002;
        }
    }
    if (keypressed['a'] || keypressed['arrowleft']) {
        velocity.add(right.multiplyScalar(ACCELERATION / 2));
        if (shipModel) {
            shipModel.rotation.y += .002;
        }
    }
    if (keypressed['d'] || keypressed['arrowright']) {
        velocity.add(right.multiplyScalar(-ACCELERATION / 2));
        if (shipModel) {
            shipModel.rotation.y += .002;
        }
    }

    // Boost
    if (keypressed[' '] && keypressed['w']) {
        velocity.add(forward.multiplyScalar(-ACCELERATION * BOOST_MULTIPLIER));
        if (shipModel) {
            shipModel.rotation.y += .01;
        }
    }

    // Reset position and velocity
    if (keypressed['r']) {
        ship.position.set(0, 0, 0);
        ship.rotation.set(0, 0, 0);
        velocity.set(0, 0, 0);
        rotationalVelocity.set(0, 0, 0);
        yaw = 0;
        pitch = 0;
    }

    // Interact with planet
    if (keypressed['e'] && nearbyPlanet) {
        interactWithPlanet(nearbyPlanet);
    }

    // Apply drag
    velocity.multiplyScalar(DRAG);
    rotationalVelocity.multiplyScalar(ROTATION_DRAG);

    // Limit maximum velocity
    if (velocity.length() > MAX_VELOCITY) {
        velocity.normalize().multiplyScalar(MAX_VELOCITY);
    }

    // Apply velocity to position
    ship.position.add(velocity);

    // Check for collisions after movement
    checkPlanetCollisions();
}


// Add the center class initially
infoDiv.classList.add('center');
// Function to handle start click
overlay.addEventListener('click', function () {
    // Hide the overlay
    overlay.style.display = 'none';

    // Request pointer lock
    document.body.requestPointerLock();


    // First fade out
    setTimeout(() => {
        infoDiv.classList.add('fade-out');

        // After fade out completes, change position and fade back in
        setTimeout(() => {
            // Remove center class and add corner class
            infoDiv.classList.remove('center');
            infoDiv.classList.add('corner');

            // Remove fade out and trigger fade in
            setTimeout(() => {
                infoDiv.classList.remove('fade-out');
            }, 50); // Small delay to ensure position change is complete
        }, 500); // Match this with the transition duration (0.5s = 500ms)
    }, 3000); // Initial delay before starting the transition
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


// Mouse movement function
function onMouseMove(event) {
    if (!ship) return;

    const movementX = event.movementX || 0;
    const movementY = event.movementY || 0;

    yaw -= movementX * rotationSpeed;
    pitch += movementY * rotationSpeed;

    const PI_2 = pi / 2;
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
    rotatePlanets();

}

animate();