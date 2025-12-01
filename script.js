function openHamburger(hamburger) {
  hamburger.classList.toggle("hamburger-open");
}


const home = document.getElementById("home");
const layers = [];
const count = 100; // number of glowing spots

for (let i = 0; i < count; i++) {
  const x = Math.random() * 100;
  const y = Math.random() * 100;

  const size = Math.random() * 0.5; // glow size
  const hue = 220 + Math.random() * 40; // bluish glow
  const color = `hsla(${hue}, 100%, 80%, 1)`;

  layers.push(
    `radial-gradient(circle at ${x}% ${y}%, ${color} 0%, transparent ${size}%)`
  );
}


layers.push(`radial-gradient(ellipse at center, hsl(240, 20%, 20%) 60%, hsl(0, 0%, 0%) 100%)`)


home.style.backgroundImage = layers.join(",");