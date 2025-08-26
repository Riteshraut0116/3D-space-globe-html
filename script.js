import * as THREE from 'three';
import { createNoise2D } from "https://esm.sh/simplex-noise";
 import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

class Effect {
  constructor() {
    this.time = null;
    this.delta = 0;
    this.textures = {};
    this.nucleusPosition = null;

    // Configuration object for magic numbers
    this.config = {
      rotationSpeeds: {
        pointStars: -0.0007,
        cometZ: -0.01,
        cometY: 0.001,
        planet1: 0.001,
        planet2: 0.003,
        planet3: 0.0005,
      },
      nucleus: {
        noiseSpeed: 0.0004,
        noiseScale: 2,
      },
    };
  }

  //MARK: -init
  async init() {
    try {
      this.threeInit();
      this.texturePromise = this.textureLoader();
      this.createElements();
      this.createPointElement();

      await this.texturePromise;
      this.pointStars.material.map = this.textures.flare1;
      this.pointComet1.material.map = this.textures.flare3;
      this.planet1.material.map = this.textures.planet1;
      this.planet2.material.map = this.textures.planet2;
      this.planet3.material.map = this.textures.planet3;
      this.nucleus.material.map = this.textures.star;
      this.sphereBg.material.map = this.textures.sky;

      // Store a reference to the nucleus's position attribute for efficiency
      this.nucleusPosition = this.nucleus.geometry.attributes.position;

      // Uses ResizeObserver to handle responsive resizing
      const container = document.querySelector(".webgl");
      this.resizeObserver = new ResizeObserver(() => this.onResize());
      this.resizeObserver.observe(container);

      // Limit rendering to a certain frame interval
      this.limitFPS(1 / 60);
    } catch (error) {
      console.error("An error occurred during initialization:", error);
      const container = document.querySelector(".webgl");
      if (container) {
        container.innerHTML = `<div style="color: #ffaaaa; text-align: center; padding: 20px; font-family: sans-serif;">
          <h2>Error Loading 3D Scene</h2>
          <p>Could not load required textures. This is often due to a network or CORS issue.</p>
          <p>Please check the browser's developer console for more details.</p>
        </div>`;
      }
    }
  }

  //MARK: -threeInit
  // Sets up the core Three.js components: renderer, scene, camera, lighting, controls
  threeInit() {
    const container = document.querySelector(".webgl");

    this.renderer = new THREE.WebGLRenderer({
      powerPreference: "high-performance",
      alpha: true,
      antialias: true,
      stencil: false,
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.01,
      1000
    );
    this.camera.position.set(0, 0, 150);

    this.clock = new THREE.Clock();

    const directionalLight = new THREE.DirectionalLight("#fff", 3);
    directionalLight.position.set(0, 50, -20);
    this.scene.add(directionalLight);

    let ambientLight = new THREE.AmbientLight("#ffffff", 1);
    ambientLight.position.set(0, -20, -40);
    this.scene.add(ambientLight);
    
    // OrbitControls automatically rotates the camera around the scene
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 5;
   this.controls.maxDistance = 350;
    this.controls.minDistance = 150;
    this.controls.enablePan = false;
  }

  //MARK: -textureLoader
  // Loads all textures asynchronously
  textureLoader() {
    const textureLoader = new THREE.TextureLoader();
    // The 'anonymous' crossOrigin setting can cause issues if the image host (i.ibb.co)
    // does not provide the correct CORS headers. Unsetting it might resolve the
    // texture loading problem that leads to a blank screen.
    textureLoader.crossOrigin = undefined;
    const textureMap = {
      sky: "./textures/sky.jpg",
      star: "./textures/star.jpg",
      flare1: "./textures/flare1.png",
      flare2: "./textures/flare2.png",
      flare3: "./textures/flare3.png",
      planet1: "./textures/planet1.webp",
      planet2: "./textures/planet2.webp",
      planet3: "./textures/planet3.webp",
    };

    return Promise.all(
      Object.entries(textureMap).map(([key, path]) => {
        return new Promise((resolve, reject) => {
          textureLoader.load(
            path,
            (texture) => {
              texture.colorSpace = THREE.SRGBColorSpace;
              texture.anisotropy = 16;
              this.textures[key] = texture;
              resolve(true);
            },
            undefined,
            (error) => reject(`Error loading texture ${path}: ${error}`)
          );
        });
      })
    );
  }

  //MARK: -createElements
  // Builds the main nucleus and background spheres
  createElements() {
    /* Nucleus  */
    //MARK: ---Nucleus
    // The detail parameter (2nd arg) can impact performance.
    const nucleusRadius = 20;
    const nucleusDetail = 28;
    let icosahedronGeometry = new THREE.IcosahedronGeometry(nucleusRadius, nucleusDetail);

    // Convert geometry to store original positions for animating
    this.originalPositions = new Float32Array(
      icosahedronGeometry.attributes.position.array
    );
    let lambertMaterial = new THREE.MeshPhongMaterial({});
    this.nucleus = new THREE.Mesh(icosahedronGeometry, lambertMaterial);
    this.nucleus.position.set(0, 0, 0);
    this.scene.add(this.nucleus);

    // Noise generator initialization
    this.noise = createNoise2D();
    this.blobScale = this.config.nucleus.noiseScale; // Higher values amplify the displacement effect

    /* Sphere Background 1 */
    //MARK: ---sphere Background1
    let geometrySphereBg = new THREE.SphereGeometry(90, 50, 50);
    let materialSphereBg = new THREE.MeshBasicMaterial({
      side: THREE.BackSide,
    });
    this.sphereBg = new THREE.Mesh(geometrySphereBg, materialSphereBg);
    this.sphereBg.position.set(0, 0, 0);
    this.scene.add(this.sphereBg);
  }

  //MARK: -createPointElement
  // Generates various point-based particles (stars, comets, planets)
  createPointElement() {
    const self = this;

    // Distant small white stars
    this.pointStars = createPointParticles({
      size: 0.5,
      total: 200,
      transparent: true,
      max: 130,
      min: 130,
    });
    this.scene.add(this.pointStars);

    // Orange comet
    this.pointComet1 = createPointParticles({
      size: 12,
      total: 1,
      transparent: true,
      max: 25,
      min: 25,
    });
    this.scene.add(this.pointComet1);

    // Blue planet
    this.planet1 = createPointParticles({
      size: 9,
      total: 1,
      transparent: false,
      max: 60,
      min: 40,
    });
    // Red planet
    this.planet2 = createPointParticles({
      size: 12,
      total: 1,
      transparent: false,
      max: 60,
      min: 40,
    });
    // Moon-like planet
    this.planet3 = createPointParticles({
      size: 12,
      total: 1,
      transparent: false,
      max: 60,
      min: 40,
    });
    this.scene.add(this.planet1);
    this.scene.add(this.planet2);
    this.scene.add(this.planet3);

    // Helper function for creating point particles
    function createPointParticles({
      texture,
      size,
      total,
      transparent = true,
      max = 150,
      min = 70,
    }) {
      const positions = new Float32Array(total * 3);
      let point, idx;

      // Generate random positions on a sphere
      for (let i = 0; i < total; i++) {
        point = self.randomPointSphere(THREE.MathUtils.randInt(max, min));
        idx = i * 3;
        positions[idx] = point.x;
        positions[idx + 1] = point.y;
        positions[idx + 2] = point.z;
      }

      const pointGeometry = new THREE.BufferGeometry();
      pointGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
      );

      let blending = transparent
        ? THREE.AdditiveBlending
        : THREE.NormalBlending;
      const pointMaterial = new THREE.PointsMaterial({
        size: size,
        blending: blending,
        transparent: true,
        depthWrite: false,
      });

      return new THREE.Points(pointGeometry, pointMaterial);
    }
  }

  //MARK: -randomPointSphere
  // Generates random coordinates on a sphere using the provided radius
  randomPointSphere(radius) {
    // These variables are only used here, so they are defined locally.
    const theta = 2 * Math.PI * Math.random();
    const phi = Math.acos(2 * Math.random() - 1);
    const dx = 0 + radius * Math.sin(phi) * Math.cos(theta);
    const dy = 0 + radius * Math.sin(phi) * Math.sin(theta);
    const dz = 0 + radius * Math.cos(phi);
    
    return new THREE.Vector3(dx, dy, dz);
  }

  //MARK: -onResize
  // Keeps camera and renderer in sync with the window size
  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  //MARK: -limitFPS
  // Caps the rendering loop to a specified frame interval
  limitFPS(interval) {
    this.rafAnimate = requestAnimationFrame(this.limitFPS.bind(this, interval));
    this.delta += this.clock.getDelta();

    if (this.delta > interval) {
      this.loop();
      this.delta = this.delta % interval;
    }
  }

  //MARK: -updateNucleus
  // Expands and displaces the nucleus based on noise after a delay
  updateNucleus() {
    for (let i = 0; i < this.nucleusPosition.count; i++) {
      const xNucleus = this.originalPositions[i * 3];
      const yNucleus = this.originalPositions[i * 3 + 1];
      const zNucleus = this.originalPositions[i * 3 + 2];

      // Normalize the position
      const lengthNucleus = Math.sqrt(
        xNucleus * xNucleus + yNucleus * yNucleus + zNucleus * zNucleus
      );
      const nxNucleus = xNucleus / lengthNucleus;
      const nyNucleus = yNucleus / lengthNucleus;
      const nzNucleus = zNucleus / lengthNucleus;

      // Displace vertices using Perlin-like noise
      const distanceNucleus =
        20 +
        this.noise(
          nxNucleus + this.time * this.config.nucleus.noiseSpeed,
          nyNucleus + this.time * this.config.nucleus.noiseSpeed
        ) *
          this.blobScale;

      // Apply the updated coordinates
      this.nucleusPosition.array[i * 3] = nxNucleus * distanceNucleus;
      this.nucleusPosition.array[i * 3 + 1] = nyNucleus * distanceNucleus;
      this.nucleusPosition.array[i * 3 + 2] = nzNucleus * distanceNucleus;
    }
    this.nucleusPosition.needsUpdate = true;
    this.nucleus.geometry.computeVertexNormals();
  }

  //MARK: -updateRotations
  // Subtle rotation updates for backgrounds, stars, comets, and planets
  updateRotations() {
    const { rotationSpeeds } = this.config;
    // Star fields / comets
    this.pointStars.rotation.y += rotationSpeeds.pointStars;
    this.pointComet1.rotation.z += rotationSpeeds.cometZ;
    this.pointComet1.rotation.y += rotationSpeeds.cometY;

    // Planets
    this.planet1.rotation.y += rotationSpeeds.planet1;
    this.planet2.rotation.z += rotationSpeeds.planet2;
    this.planet3.rotation.x += rotationSpeeds.planet3;
  }

  //MARK: -loop
  // Core animation loop called at each frame or limited interval
  loop() {
    this.time = Date.now();

    this.updateNucleus();
    this.updateRotations();

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}

const effect = new Effect();
effect.init();