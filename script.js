document.addEventListener("DOMContentLoaded", () => {
  const noBtn = document.getElementById("noBtn");
  const yesBtn = document.getElementById("yesBtn");
  const mainCard = document.getElementById("mainCard");
  const successMessage = document.getElementById("successMessage");

  // Shared AudioContext — unlocked on first user interaction
  let audioCtx;
  function getAudioCtx() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return audioCtx;
  }

  // Unlock audio on any early interaction
  document.addEventListener("click", () => getAudioCtx(), { once: true });
  document.addEventListener("touchstart", () => getAudioCtx(), { once: true });
  document.addEventListener("mousemove", () => getAudioCtx(), { once: true });

  let noDodgeCount = 0;
  const noMessages = [
    "No 😢",
    "Are you sure? 🥺",
    "Really?! 😭",
    "Think again! 💔",
    "Please? 🥹",
    "Don't do this 😿",
    "I'll cry... 😢",
    "Pretty please? 🙏",
    "Last chance! 💘",
  ];

  // Function to move the 'No' button to a random position within the viewport
  function moveButton() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    const btnWidth = noBtn.offsetWidth;
    const btnHeight = noBtn.offsetHeight;

    // Move the button to body level so it won't be hidden with the card
    if (noBtn.parentElement !== document.body) {
      document.body.appendChild(noBtn);
    }

    // Add padding so the button never touches the edge
    const padding = 20;

    // Calculate safe range so the button stays fully inside the viewport
    const minX = padding;
    const minY = padding;
    const maxX = windowWidth - btnWidth - padding;
    const maxY = windowHeight - btnHeight - padding;

    // Ensure valid range
    const safeMaxX = Math.max(minX, maxX);
    const safeMaxY = Math.max(minY, maxY);

    // Generate random position clamped within safe bounds
    const randomX = Math.floor(Math.random() * (safeMaxX - minX)) + minX;
    const randomY = Math.floor(Math.random() * (safeMaxY - minY)) + minY;

    // Use fixed positioning so it's always relative to the viewport
    noBtn.style.position = "fixed";
    noBtn.style.left = `${randomX}px`;
    noBtn.style.top = `${randomY}px`;
    noBtn.style.zIndex = "9999";
    noBtn.style.display = "block";

    // Update text and grow the Yes button each dodge
    noDodgeCount++;
    noBtn.textContent =
      noMessages[Math.min(noDodgeCount, noMessages.length - 1)];

    // Make the Yes button grow slightly with each dodge
    const scale = 1 + Math.min(noDodgeCount * 0.06, 0.5);
    yesBtn.style.transform = `scale(${scale})`;

    // Play a small dodge sound
    playDodgeSound();
  }

  // Event listener for hover (Desktop)
  noBtn.addEventListener("mouseover", moveButton);

  // Event listener for touch (Mobile) - prevents clicking
  noBtn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    moveButton();
  });

  // --- Success State Logic (Includes EmailJS) ---
  yesBtn.addEventListener("click", () => {
    // 1. Reset UI
    yesBtn.style.transform = "scale(1)";
    noBtn.style.display = "none";

    // 2. Hide the question with fade
    mainCard.style.transition = "opacity 0.4s ease, transform 0.4s ease";
    mainCard.style.opacity = "0";
    mainCard.style.transform = "scale(0.9)";

    // 3. SEND EMAIL (Silent Background Process)
    // Using the keys you provided
    const serviceID = "service_on9e6j9";
    const templateID = "template_6iic7wr";

    const templateParams = {
      to_name: "Hui Xin", // I grabbed this name from your HTML title!
      message: "Hui Xin accepted your Valentine's invitation! ❤️",
    };

    // Send the email
    emailjs
      .send(serviceID, templateID, templateParams)
      .then(() => {
        console.log("Email sent successfully!");
      })
      .catch((err) => {
        console.error("Failed to send email:", err);
      });

    // 4. Trigger Animations & Sound
    setTimeout(() => {
      mainCard.classList.add("hidden");
      successMessage.classList.remove("hidden");

      // Play celebration sound effect
      playSuccessSound();

      // Trigger Confetti Celebration
      triggerConfetti();
    }, 400);
  });

  // ---- Sound Effects (Synthesized Audio) ----

  function playDodgeSound() {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;

    // Playful "nope!" two-tone boop
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(800, now);
    osc1.frequency.exponentialRampToValueAtTime(400, now + 0.1);
    gain1.gain.setValueAtTime(0.25, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.12);

    // Second pop right after
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(500, now + 0.08);
    osc2.frequency.exponentialRampToValueAtTime(250, now + 0.18);
    gain2.gain.setValueAtTime(0.2, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.18);
  }

  function playSuccessSound() {
    const ctx = getAudioCtx();
    const duration = 4;
    const now = ctx.currentTime;

    // Master compressor for a polished mix
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -24;
    compressor.knee.value = 30;
    compressor.ratio.value = 12;
    compressor.connect(ctx.destination);

    // --- Layer 1: Rich crowd noise (warm filtered noise) ---
    for (let i = 0; i < 10; i++) {
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const data = buffer.getChannelData(ch);
        for (let j = 0; j < bufferSize; j++) {
          data[j] = Math.random() * 2 - 1;
        }
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = "bandpass";
      bandpass.frequency.value = 600 + Math.random() * 2400;
      bandpass.Q.value = 0.4 + Math.random() * 0.6;

      const highpass = ctx.createBiquadFilter();
      highpass.type = "highpass";
      highpass.frequency.value = 200;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.045, now + 0.15);
      gain.gain.setValueAtTime(0.045, now + 0.5);
      gain.gain.linearRampToValueAtTime(0.035, now + 1.5);
      gain.gain.linearRampToValueAtTime(0.02, now + 3.0);
      gain.gain.linearRampToValueAtTime(0.0, now + duration);

      noise.connect(bandpass);
      bandpass.connect(highpass);
      highpass.connect(gain);
      gain.connect(compressor);
      noise.start(now);
      noise.stop(now + duration);
    }

    // --- Layer 2: Cheering "wooo" voices (multiple rising tones) ---
    const cheerVoices = [
      { freq: 350, delay: 0 },
      { freq: 420, delay: 0.05 },
      { freq: 500, delay: 0.1 },
      { freq: 580, delay: 0.15 },
      { freq: 650, delay: 0.08 },
      { freq: 380, delay: 0.2 },
      { freq: 470, delay: 0.12 },
      { freq: 550, delay: 0.18 },
      { freq: 300, delay: 0.25 },
      { freq: 620, delay: 0.22 },
    ];

    cheerVoices.forEach(({ freq, delay }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = "sawtooth";
      const t = now + delay;
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.linearRampToValueAtTime(freq * 1.6, t + 0.35);
      osc.frequency.setValueAtTime(freq * 1.4, t + 0.5);
      osc.frequency.linearRampToValueAtTime(freq * 1.8, t + 0.8);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.2, t + 1.2);

      filter.type = "bandpass";
      filter.frequency.value = freq * 1.3;
      filter.Q.value = 3;

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.02, t + 0.08);
      gain.gain.setValueAtTime(0.02, t + 0.4);
      gain.gain.linearRampToValueAtTime(0.012, t + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.3);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(compressor);
      osc.start(t);
      osc.stop(t + 1.3);
    });

    // --- Layer 2b: Second wave of cheers ---
    cheerVoices.slice(0, 6).forEach(({ freq, delay }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      osc.type = "sawtooth";
      const t = now + 0.8 + delay;
      const f = freq * 1.1;
      osc.frequency.setValueAtTime(f, t);
      osc.frequency.linearRampToValueAtTime(f * 1.5, t + 0.3);
      osc.frequency.exponentialRampToValueAtTime(f * 1.1, t + 0.9);

      filter.type = "bandpass";
      filter.frequency.value = f * 1.2;
      filter.Q.value = 2.5;

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.015, t + 0.06);
      gain.gain.linearRampToValueAtTime(0.008, t + 0.5);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.0);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(compressor);
      osc.start(t);
      osc.stop(t + 1.0);
    });

    // --- Layer 3: Triumphant fanfare melody ---
    const melody = [
      { freq: 523.25, time: 0, dur: 0.4 }, // C5
      { freq: 659.25, time: 0.15, dur: 0.4 }, // E5
      { freq: 783.99, time: 0.3, dur: 0.5 }, // G5
      { freq: 1046.5, time: 0.5, dur: 0.7 }, // C6 (held longer)
      { freq: 783.99, time: 0.9, dur: 0.3 }, // G5
      { freq: 1046.5, time: 1.1, dur: 0.9 }, // C6 (grand finish)
    ];

    melody.forEach(({ freq, time, dur }) => {
      // Main tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      const t = now + time;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.12, t + 0.04);
      gain.gain.setValueAtTime(0.1, t + dur * 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.connect(gain);
      gain.connect(compressor);
      osc.start(t);
      osc.stop(t + dur);

      // Harmony (fifth above, softer)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.value = freq * 1.5;
      gain2.gain.setValueAtTime(0, t);
      gain2.gain.linearRampToValueAtTime(0.04, t + 0.04);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.8);
      osc2.connect(gain2);
      gain2.connect(compressor);
      osc2.start(t);
      osc2.stop(t + dur);
    });

    // --- Layer 4: Sparkle/shimmer top layer ---
    for (let i = 0; i < 12; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      const sparkleFreq = 2000 + Math.random() * 4000;
      osc.frequency.value = sparkleFreq;
      const t = now + Math.random() * 2.5;
      const sparkDur = 0.08 + Math.random() * 0.12;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.03 + Math.random() * 0.02, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + sparkDur);
      osc.connect(gain);
      gain.connect(compressor);
      osc.start(t);
      osc.stop(t + sparkDur);
    }
  }

  // ---- Enhanced Confetti ----
  function triggerConfetti() {
    const duration = 4 * 1000;
    const end = Date.now() + duration;
    const colors = [
      "#ff69b4",
      "#ff1493",
      "#ec4899",
      "#f472b6",
      "#fda4af",
      "#fecdd3",
      "#fff1f2",
      "#ffd700",
    ];

    // Initial big burst
    confetti({
      particleCount: 100,
      spread: 100,
      origin: { y: 0.6 },
      colors: colors,
      startVelocity: 45,
    });

    // Continuous side streams
    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });

      // Random center bursts
      if (Math.random() < 0.05) {
        confetti({
          particleCount: 30,
          spread: 80,
          origin: { x: Math.random(), y: Math.random() * 0.6 },
          colors: colors,
          startVelocity: 30,
        });
      }

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();

    // Final big burst
    setTimeout(() => {
      confetti({
        particleCount: 150,
        spread: 120,
        origin: { y: 0.5 },
        colors: colors,
        startVelocity: 50,
      });
    }, duration - 500);
  }
});
