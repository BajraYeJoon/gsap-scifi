document.addEventListener('DOMContentLoaded', () => {
    const doorSound = document.getElementById('doorSound');
    const startButton = document.getElementById('startButton');
    const controlsGuide = document.querySelector(".controls-guide");
    const stationContainer = document.querySelector(".station-container");

    let currentRoom = "main-corridor";
    let cameraX = 0;
    let cameraY = 0;
    let cameraZ = 0;
    let cameraRotation = 0;
    let breathingOffset = 0;
    let mouseX = 0;
    let mouseY = 0;

    // Camera constraints
    const CAMERA_LIMITS = {
      x: { min: -400, max: 400 },
      y: { min: -200, max: 200 },
      z: { min: -300, max: 100 },
      rotation: { min: -45, max: 45 },
    };

    // Parallax settings
    const PARALLAX = {
      mouse: 0.1,
      movement: 0.05,
      breathing: 0.015,
    };

    const playDoorSound = () => {
      doorSound.currentTime = 0;
      doorSound.play();
      setTimeout(() => {
        doorSound.pause();
        doorSound.currentTime = 0;
      }, 2000);
    };

    // Smooth value changes
    const lerp = (start, end, factor) => start + (end - start) * factor;
    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

    // Update mouse position for parallax
    const updateMousePosition = (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    // Breathing and sway animation
    const updateBreathing = () => {
      const time = Date.now() * 0.001;
      breathingOffset = Math.sin(time) * 2;
      return {
        y: Math.sin(time * 0.5) * 3,
        z: Math.cos(time * 0.5) * 2,
        rotation: Math.sin(time * 0.3) * 0.5,
      };
    };

    // Camera movement with parallax and breathing
    const updateCamera = () => {
      const breathing = updateBreathing();

      // Apply constraints
      cameraX = clamp(cameraX, CAMERA_LIMITS.x.min, CAMERA_LIMITS.x.max);
      cameraY = clamp(cameraY, CAMERA_LIMITS.y.min, CAMERA_LIMITS.y.max);
      cameraZ = clamp(cameraZ, CAMERA_LIMITS.z.min, CAMERA_LIMITS.z.max);
      cameraRotation = clamp(
        cameraRotation,
        CAMERA_LIMITS.rotation.min,
        CAMERA_LIMITS.rotation.max
      );

      // Add parallax from mouse movement
      const parallaxX = mouseX * 50 * PARALLAX.mouse;
      const parallaxY = mouseY * 30 * PARALLAX.mouse;

      // Combine all movements
      const finalX = cameraX + parallaxX + breathing.z * PARALLAX.breathing;
      const finalY = cameraY + parallaxY + breathing.y * PARALLAX.breathing;
      const finalRotation = cameraRotation + breathing.rotation;

      // Apply camera transform with parallax and breathing
      stationContainer.style.transform = `
            perspective(1200px)
            translate3d(${finalX}px, ${finalY}px, ${cameraZ + breathing.z}px)
            rotateX(${-parallaxY}deg)
            rotateY(${finalRotation + parallaxX * 0.1}deg)
            scale(1.1)
        `;

      // Apply parallax to room elements
      document
        .querySelectorAll(".room-content, .control-panel, .window-panel")
        .forEach((element) => {
          const depth = element.dataset.depth || 0.1;
          element.style.transform = `
                translate3d(${-parallaxX * depth}px, ${-parallaxY * depth}px, 0)
            `;
        });
    };

    const startAnimation = () => {
      startButton.classList.add("hidden");

      const tl = gsap.timeline();

      tl.to({}, { duration: 0.5 })
        .call(() => {
          playDoorSound();
        })
        .to(
          ".door-left",
          {
            duration: 2,
            scaleX: 0,
            ease: "power2.inOut",
          },
          0.5
        )
        .to(
          ".door-right",
          {
            duration: 2,
            scaleX: 0,
            ease: "power2.inOut",
          },
          0.5
        )
        .call(() => {
          controlsGuide.classList.remove("hidden");
          document.getElementById(currentRoom).classList.add("active");
        });
    };

    const navigateToRoom = (roomId) => {
      if (roomId === currentRoom) return;

      playDoorSound();

      gsap.to(stationContainer, {
        duration: 1,
        ease: "power2.inOut",
        onStart: () => {
          // Fade out current room
          gsap.to(`#${currentRoom}`, {
            duration: 0.5,
            opacity: 0,
            scale: 0.95,
            ease: "power2.in",
          });
        },
        onComplete: () => {
          document.getElementById(currentRoom).classList.remove("active");
          currentRoom = roomId;
          const newRoom = document.getElementById(currentRoom);
          newRoom.classList.add("active");

          // Fade in new room
          gsap.from(newRoom, {
            duration: 0.5,
            opacity: 0,
            scale: 1.05,
            ease: "power2.out",
          });

          // Reset camera position smoothly
          gsap.to([cameraX, cameraY, cameraZ, cameraRotation], {
            duration: 0.8,
            value: 0,
            ease: "power2.out",
          });
        },
      });
    };

    // Keyboard controls with momentum and smoothing
    let moveSpeed = { x: 0, y: 0, z: 0, rotation: 0 };
    const FRICTION = 0.92;
    const MAX_SPEED = 12;

    const handleKeydown = (e) => {
      const MOVE_AMOUNT = 3;
      const ROTATION_AMOUNT = 2;

      switch (e.key) {
        case "ArrowLeft":
          if (e.shiftKey) {
            moveSpeed.rotation = Math.min(
              moveSpeed.rotation + ROTATION_AMOUNT,
              MAX_SPEED
            );
          } else {
            moveSpeed.x = Math.min(moveSpeed.x + MOVE_AMOUNT, MAX_SPEED);
          }
          break;
        case "ArrowRight":
          if (e.shiftKey) {
            moveSpeed.rotation = Math.max(
              moveSpeed.rotation - ROTATION_AMOUNT,
              -MAX_SPEED
            );
          } else {
            moveSpeed.x = Math.max(moveSpeed.x - MOVE_AMOUNT, -MAX_SPEED);
          }
          break;
        case "ArrowUp":
          if (e.shiftKey) {
            moveSpeed.z = Math.min(moveSpeed.z + MOVE_AMOUNT, MAX_SPEED);
          } else {
            moveSpeed.y = Math.min(moveSpeed.y + MOVE_AMOUNT, MAX_SPEED);
          }
          break;
        case "ArrowDown":
          if (e.shiftKey) {
            moveSpeed.z = Math.max(moveSpeed.z - MOVE_AMOUNT, -MAX_SPEED);
          } else {
            moveSpeed.y = Math.max(moveSpeed.y - MOVE_AMOUNT, -MAX_SPEED);
          }
          break;
        case "e":
        case "E":
          const markers = document.querySelectorAll(".door-marker");
          markers.forEach((marker) => {
            const rect = marker.getBoundingClientRect();
            const center = window.innerWidth / 2;
            if (
              Math.abs(rect.left - center) < 200 ||
              Math.abs(rect.right - center) < 200
            ) {
              navigateToRoom(marker.dataset.room);
            }
          });
          break;
      }
    };

    const handleKeyup = (e) => {
      switch (e.key) {
        case "ArrowLeft":
        case "ArrowRight":
          if (e.shiftKey) {
            moveSpeed.rotation = 0;
          } else {
            moveSpeed.x = 0;
          }
          break;
        case "ArrowUp":
        case "ArrowDown":
          if (e.shiftKey) {
            moveSpeed.z = 0;
          } else {
            moveSpeed.y = 0;
          }
          break;
      }
    };

    const animate = () => {
      // Apply movement with momentum
      cameraX += moveSpeed.x;
      cameraY += moveSpeed.y;
      cameraZ += moveSpeed.z;
      cameraRotation += moveSpeed.rotation;

      // Apply friction
      moveSpeed.x *= FRICTION;
      moveSpeed.y *= FRICTION;
      moveSpeed.z *= FRICTION;
      moveSpeed.rotation *= FRICTION;

      // Update camera
      updateCamera();
      requestAnimationFrame(animate);
    };

    // Event listeners
    startButton.addEventListener("click", startAnimation);
    document.addEventListener("keydown", handleKeydown);
    document.addEventListener("keyup", handleKeyup);
    document.addEventListener("mousemove", updateMousePosition);

    document.querySelectorAll(".door-marker").forEach((marker) => {
      marker.addEventListener("click", () => {
        navigateToRoom(marker.dataset.room);
      });
    });

    animate();

    // Status updates
    setInterval(() => {
      const now = new Date();
      const altitude = 408 + Math.sin(now.getTime() / 10000) * 2;
      document.querySelector(
        ".altitude-text"
      ).textContent = `ALTITUDE: ${altitude.toFixed(1)} KM`;
    }, 1000);

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            doorSound.pause();
        }
    });
}); 