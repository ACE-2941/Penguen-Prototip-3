const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const puanYazisi = document.getElementById("puanTablosu");

canvas.width = 360;
canvas.height = 640;

let puan = 0;
let gameActive = true;

// Görselleri Tanımlama
const penguinImg = new Image();
penguinImg.src = "assets/penguin.png";

const backgroundImg = new Image();
backgroundImg.src = "assets/arka-plan.jpg"; // Arka plan görselin

const iceImg = new Image();
iceImg.src = "assets/buz.png"; // Engel görselin

const penguin = {
    x: 148,
    y: 540,
    w: 64, h: 64,
    frameX: 0,
    frameY: 0,
    maxFrames: 6, // Görselindeki 6 kareye göre güncellendi
    fps: 0,
    stagger: 8,
    velocityY: 0,
    gravity: 0.8,
    isJumping: false
};

let obstacles = [];
let timer = 0;
let moveDir = 0;

window.onkeydown = (e) => {
    if (e.key === "ArrowLeft") moveDir = -1;
    if (e.key === "ArrowRight") moveDir = 1;
    if (e.key === " " || e.key === "ArrowUp") jump();
};
window.onkeyup = () => moveDir = 0;

canvas.ontouchstart = (e) => {
    const tx = e.touches[0].clientX;
    const ty = e.touches[0].clientY;
    if (ty < window.innerHeight / 2) jump();
    else moveDir = tx < window.innerWidth / 2 ? -1 : 1;
};
canvas.ontouchend = () => moveDir = 0;

function jump() {
    if (!penguin.isJumping) {
        penguin.velocityY = -16;
        penguin.isJumping = true;
        penguin.frameY = 0; // Animasyonun zıplama karesi varsa güncellenebilir
    }
}

function update() {
    if (!gameActive) return;

    penguin.x += moveDir * 8;
    penguin.y += penguin.velocityY;
    penguin.velocityY += penguin.gravity;

    if (penguin.y > 540) {
        penguin.y = 540;
        penguin.isJumping = false;
        penguin.velocityY = 0;
    }

    if (penguin.x < 0) penguin.x = 0;
    if (penguin.x > canvas.width - penguin.w) penguin.x = canvas.width - penguin.w;

    if (++timer > 55) {
        // Genişlik ve yükseklik oranını koruyarak buz görselini ekliyoruz
        obstacles.push({ 
            x: Math.random() * (canvas.width - 40), 
            y: -60, 
            w: 30, 
            h: 60 
        });
        timer = 0;
    }

    obstacles.forEach((o, i) => {
        o.y += 6 + (puan / 20);
        if (o.y > canvas.height) {
            obstacles.splice(i, 1);
            puan++;
            puanYazisi.innerText = "PUAN: " + puan;
        }
        
        // Çarpışma kutusunu (hitbox) görselle uyumlu hale getirmek için daralttık
        if (penguin.x + 20 < o.x + o.w && penguin.x + 44 > o.x && 
            penguin.y + 15 < o.y + o.h && penguin.y + 55 > o.y) {
            gameActive = false;
            alert("PUANIN: " + puan);
            location.reload();
        }
    });

    penguin.fps++;
    if (penguin.fps % penguin.stagger === 0) {
        penguin.frameX = (penguin.frameX + 1) % penguin.maxFrames;
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Arka Planı Çiz (Canvas'ı kaplayacak şekilde)
    if (backgroundImg.complete) {
        ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
    }

    // 2. Engelleri (Buz) Çiz
    if (iceImg.complete) {
        obstacles.forEach(o => {
            ctx.drawImage(iceImg, o.x, o.y, o.w, o.h);
        });
    }

    // 3. Pengueni Çiz
    if (penguinImg.complete) {
        // Sprite sheet'indeki kare sayısına göre genişliği 1/6 oranında ayarladık
        const spriteWidth = penguinImg.width / 6; 
        ctx.drawImage(
            penguinImg, 
            penguin.frameX * spriteWidth, 0, 
            spriteWidth, penguinImg.height, 
            penguin.x, penguin.y, 
            penguin.w, penguin.h
        );
    }
}

function gameLoop() {
    update();
    draw();
    if (gameActive) requestAnimationFrame(gameLoop);
}

// Tüm görsellerin yüklendiğinden emin olmak için
let loadedImages = 0;
const totalImages = 3;
function checkLoad() {
    loadedImages++;
    if (loadedImages === totalImages) gameLoop();
}

penguinImg.onload = checkLoad;
backgroundImg.onload = checkLoad;
iceImg.onload = checkLoad;
