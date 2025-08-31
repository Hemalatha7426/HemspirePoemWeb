/* ---------------------------------
   Hemspire Scripts
   - Theme toggle
   - Quote of the day
   - Fetch poems.json
   - Carousel (separate images from gallery)
   - Gallery grid + search + popup
   - Like / Share / Download
   - Reveal on scroll + petals + swipe
----------------------------------*/

// -------------------------------
// Quotes
// -------------------------------
const quotes = [
  "Every dawn writes hope across the sky.",
  "Poetry is the rhythm of the soul.",
  "Words are the painting of the voice.",
  "Even the stars listen to a poet’s heart.",
  "A poem is a story painted with feelings."
];
function showQuote(){
  const el = document.getElementById("quote");
  if(!el) return;
  const i = Math.floor(Math.random()*quotes.length);
  el.textContent = quotes[i];
}
// Hamburger toggle
const hamburger = document.getElementById("hamburger");
const navLinks = document.querySelector(".nav-links");

if (hamburger) {
  hamburger.addEventListener("click", () => {
    navLinks.classList.toggle("show");
  });
}

// -------------------------------
// Theme
// -------------------------------
const themeToggle = document.getElementById("themeToggle");
function setTheme(theme){
  if(theme==="dark"){
    document.body.classList.add("dark-mode");
    if(themeToggle) themeToggle.textContent = "☀️ Light Mode";
  } else {
    document.body.classList.remove("dark-mode");
    if(themeToggle) themeToggle.textContent = "🌙 Dark Mode";
  }
  localStorage.setItem("theme", theme);
}
document.addEventListener("DOMContentLoaded", ()=>{
  const saved = localStorage.getItem("theme") || "light";
  setTheme(saved);
});
if(themeToggle){
  themeToggle.addEventListener("click", ()=>{
    const current = document.body.classList.contains("dark-mode") ? "dark" : "light";
    setTheme(current==="dark" ? "light" : "dark");
  });
}


// -------------------------------
// Data (poems.json)
// -------------------------------
let carouselData = [];
let galleryData = [];
async function loadData(){
  try{
    const res = await fetch(getBase() + "poems.json");
    const data = await res.json();
    carouselData = data.carousel || [];
    galleryData  = data.gallery  || [];
  }catch(e){
    console.error("Failed to load poems.json", e);
  }
}

// Helper to resolve base path for pages/*
function getBase(){
  // If we are in /pages/, we need "../"
  const isInPages = /\/pages\//.test(location.pathname);
  return isInPages ? "../" : "";
}

// -------------------------------
// Carousel
// -------------------------------
let currentSlide = 0;
let autoTimer = null;

function renderCarousel(){
  const container = document.getElementById("carouselContainer");
  const dots = document.getElementById("carouselDots");
  if(!container) return;
  container.innerHTML = "";
  if(dots) dots.innerHTML = "";

  carouselData.forEach((item, i)=>{
    const slide = document.createElement("div");
    slide.className = "carousel-slide" + (i===0 ? " active" : "");
    slide.innerHTML = `
      <img src="${item.image}" alt="${item.id}" class="carousel-image">
      <div class="carousel-caption">${item.text}</div>
    `;
    container.appendChild(slide);

    if(dots){
      const dot = document.createElement("button");
      dot.setAttribute("aria-label", `Go to slide ${i+1}`);
      if(i===0) dot.classList.add("active");
      dot.addEventListener("click", ()=> goToSlide(i));
      dots.appendChild(dot);
    }
  });

  enableSwipe(container);
  startAutoPlay();
}

function updateDots(){
  const dots = document.querySelectorAll("#carouselDots button");
  dots.forEach((d, i)=> d.classList.toggle("active", i===currentSlide));
}

function goToSlide(n){
  const slides = document.querySelectorAll(".carousel-slide");
  if(!slides.length) return;
  slides[currentSlide].classList.remove("active");
  currentSlide = (n + slides.length) % slides.length;
  slides[currentSlide].classList.add("active");
  updateDots();
  restartAutoPlay();
}

function nextSlide(){ goToSlide(currentSlide + 1); }
function prevSlide(){ goToSlide(currentSlide - 1); }

function startAutoPlay(){
  stopAutoPlay();
  autoTimer = setInterval(()=> nextSlide(), 4500);
}
function stopAutoPlay(){ if(autoTimer) clearInterval(autoTimer); }
function restartAutoPlay(){ stopAutoPlay(); startAutoPlay(); }

function enableSwipe(el){
  if(!el) return;
  let x0=null;
  el.addEventListener("pointerdown", e=> x0 = e.clientX);
  el.addEventListener("pointerup", e=>{
    if(x0===null) return;
    const dx = e.clientX - x0;
    if(Math.abs(dx)>40){ dx>0 ? prevSlide() : nextSlide(); }
    x0=null;
  });
}

// -------------------------------
// Gallery Grid
// -------------------------------
function loadPoemsGrid(limit = null){
  const grid = document.getElementById("poemGrid");
  if(!grid) return;

  const likedPoems = JSON.parse(localStorage.getItem("likedPoems")) || {};
  let list = galleryData.slice(); // gallery only

  if(limit) list = list.slice(0, 4);
  grid.innerHTML = "";

  list.forEach(poem=>{
    const card = document.createElement("div");
    card.className = "poem-card";
    const isLiked = !!likedPoems[poem.id];

    card.innerHTML = `
      <img src="${poem.image}" alt="${poem.id}" onclick="openPopup('${poem.image}', \`${poem.text.replace(/`/g,"\\`")}\`)">
      <p class="poem-text">${poem.text}</p>
      <div class="actions">
        <button class="like-btn ${isLiked ? "liked" : ""}" onclick="likePoem(this,'${poem.id}')">❤️ <span>${isLiked ? 1 : 0}</span></button>
        <button onclick="sharePoem(\`${poem.text.replace(/`/g,"\\`")}\`)">📤 Share</button>
        <button onclick="downloadPoem('${poem.image}')">⬇️ Download</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

// -------------------------------
// Like / Share / Download
// -------------------------------
function likePoem(btn, poemId){
  const span = btn.querySelector("span");
  let likedPoems = JSON.parse(localStorage.getItem("likedPoems")) || {};
  let count = parseInt(span.textContent);

  if(!btn.classList.contains("liked")){
    btn.classList.add("liked"); count++; likedPoems[poemId] = true;
  }else{
    btn.classList.remove("liked"); count = Math.max(0, count-1); delete likedPoems[poemId];
  }
  animateCounter(span, count);
  localStorage.setItem("likedPoems", JSON.stringify(likedPoems));
}
function animateCounter(element, target){
  let current = parseInt(element.textContent);
  const step = target>current ? 1 : -1;
  const interval = setInterval(()=>{
    current += step;
    element.textContent = current;
    if(current===target) clearInterval(interval);
  }, 40);
}

function sharePoem(text){
  if(navigator.share){
    navigator.share({ title:"Hemspire Poem", text, url: location.href });
  } else {
    alert("Sharing not supported on this browser.");
  }
}
function downloadPoem(url){
  const a = document.createElement("a");
  a.href = url; a.download = "poem.jpg";
  document.body.appendChild(a); a.click(); a.remove();
}

// -------------------------------
// Popup
// -------------------------------
function openPopup(image, text){
  const pop = document.getElementById("popup");
  if(!pop) return;
  document.getElementById("popupImage").src = image;
  document.getElementById("popupText").textContent = text;
  const dl = document.getElementById("popupDownloadBtn");
  const sh = document.getElementById("popupShareBtn");
  if(dl) dl.href = image;
  if(sh) sh.onclick = ()=> sharePoem(text);
  pop.classList.remove("hidden");
}
function closePopup(){
  const pop = document.getElementById("popup");
  if(pop) pop.classList.add("hidden");
}

// -------------------------------
// Search
// -------------------------------
function searchHomePoems(){
  const q = (document.getElementById("homeSearch")?.value || "").toLowerCase();
  const cards = document.querySelectorAll("#poemGrid .poem-card");
  cards.forEach(card=>{
    const text = card.querySelector(".poem-text").textContent.toLowerCase();
    card.style.display = text.includes(q) ? "block" : "none";
  });
}
function searchGalleryPoems(){
  const q = (document.getElementById("gallerySearch")?.value || "").toLowerCase();
  const cards = document.querySelectorAll("#poemGrid .poem-card");
  cards.forEach(card=>{
    const text = card.querySelector(".poem-text").textContent.toLowerCase();
    card.style.display = text.includes(q) ? "block" : "none";
  });
}

// -------------------------------
// Reveal on scroll
// -------------------------------
function initReveal(){
  const els = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){ e.target.classList.add("revealed"); io.unobserve(e.target); }
    });
  }, { threshold: .12 });
  els.forEach(el=> io.observe(el));
}

// -------------------------------
// Petals
// -------------------------------
function spawnPetal(){
  const p = document.createElement("span");
  p.className="petal";
  const left = Math.random()*100;
  const time = 8 + Math.random()*8; // seconds
  const drift = (Math.random()<.5? -1:1) * (30 + Math.random()*60);
  p.style.left = left + "vw";
  p.style.animationDuration = time + "s";
  p.style.setProperty("--dx", drift + "px");
  document.body.appendChild(p);
  setTimeout(()=> p.remove(), time*1000);
}
function startPetals(){
  for(let i=0;i<10;i++) setTimeout(spawnPetal, i*400);
  setInterval(spawnPetal, 1200);
}

// -------------------------------
// Contact form (demo validation only)


function initContactForm() {
  const form = document.getElementById("contactForm");
  const out = document.getElementById("formMessage");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    e.stopImmediatePropagation(); // ✅ makes sure it only fires once

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const msg = form.message.value.trim();

    if (!name || !email || !msg) {
      out.textContent = "⚠️ Please fill all fields.";
      out.style.color = "red";
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      out.textContent = "⚠️ Invalid email format.";
      out.style.color = "red";
      return;
    }

    try {
      const response = await fetch("https://hemspirepoems.onrender.com/pages/contact.html", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, msg })
      });

      const result = await response.json();
      if (result.success) {
        out.textContent = "✅ Message saved to VS Code project!";
        out.style.color = "green";
        form.reset();
      } else {
        out.textContent = "❌ Error saving message.";
        out.style.color = "red";
      }
    } catch (error) {
      out.textContent = "❌ Cannot connect to server.";
      out.style.color = "red";
    }
  });
}

document.addEventListener("DOMContentLoaded", initContactForm);



// -------------------------------
/* Init */
// -------------------------------
window.addEventListener("DOMContentLoaded", async ()=>{
  showQuote();
  initReveal();
  startPetals();
  initContactForm();
  await loadData();

  // If home (carousel exists)
  if(document.getElementById("carouselContainer")){
    renderCarousel();       // uses carouselData (separate images)
    loadPoemsGrid(6);       // show 6 featured from gallery
    // Keyboard support for carousel
    document.addEventListener("keydown", (e)=>{
      if(e.key==="ArrowRight") nextSlide();
      if(e.key==="ArrowLeft")  prevSlide();
    });
  }

  // If gallery page
  if(document.getElementById("gallerySearch")){
    loadPoemsGrid(null);    // show all gallery items
  }
});



