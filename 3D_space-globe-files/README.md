**# 🌌 Interactive 3D Space Globe**

This project is an immersive and interactive 3D space scene created with **Three.js**. It features a dynamic, pulsating central star (nucleus) surrounded by orbiting planets, a comet, and a field of distant stars. Users can explore the scene by rotating, panning, and zooming.

---

## ✨ Features

*   **Interactive 3D Scene:** Built from the ground up using `three.js` for a rich WebGL experience.
*   **Dynamic Star Nucleus:** The central star animates with a mesmerizing noise displacement effect, making it feel alive.
*   **Celestial Bodies:** The scene is populated with multiple planets, a streaking comet, and a vast field of stars, all with their own textures and rotation.
*   **User Interaction:** Implements `OrbitControls` to allow users to freely rotate, pan, and zoom to explore the environment.
*   **Responsive Canvas:** The 3D scene automatically resizes to fit the browser window, ensuring a great experience on any screen size.
*   **Optimized Rendering:** The animation loop is capped at 60 FPS to ensure smooth performance without over-utilizing system resources.

---

## 🔭 Scene Preview

The main view of the project is the 3D space globe itself. It loads directly to the animation, allowing for immediate interaction.

!Space Globe Preview

> 💡 Tip: Click and drag to rotate the scene. Use your mouse wheel to zoom in and out.

---

## 🌐 Live Demo

Explore the live version of the space globe here:

- 🔗 Click here to view the live site

> 💡 Best viewed on modern browsers like Chrome, Firefox, or Edge.

---

## 📂 Repository Structure

space-globe-2/
└── dist/                      # 📁 Root folder containing all runnable files
    ├── textures/              # 📁 Folder containing all image assets
    │   ├── flare1.png         # ✨ Texture for distant stars
    │   ├── flare3.png         # ✨ Texture for the comet
    │   ├── planet1.webp       # 🪐 Texture for the blue planet
    │   ├── planet2.webp       # 🪐 Texture for the red planet
    │   ├── planet3.webp       # 🪐 Texture for the moon-like planet
    │   ├── sky.jpg            # 🌌 Texture for the inner sky sphere
    │   ├── sky1.jpg           # 🌌 Background image for the HTML body
    │   └── star.jpg           # 🌟 Texture for the central nucleus
    │
    ├── index.html             # 🏠 Main HTML file that loads the scene
    ├── script.js              # 💻 Core JavaScript file with all the Three.js logic
    └── style.css              # 🎨 Main stylesheet for the page

---

## 🚀 How to Run

1. Download or clone this repository to your local machine.
2. Navigate to the `dist` folder.
3. Open the `index.html` file in a modern web browser (like Chrome, Firefox, or Edge).
4. Explore the scene by clicking, dragging, and scrolling!

---

## 💻 Technologies Used

* HTML5
* CSS3
* JavaScript (ES6 Modules)
* Three.js
