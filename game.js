const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const puanYazisi = document.getElementById("puanTablosu");

canvas.width = 360;
canvas.height = 640;

let puan = 0;
let gameActive = true;

// Görseller
const penguinImg = new Image();
penguinImg.src = "assets/penguin.png";

const backgroundImg = new Image();
backgroundImg.src = "assets/arka-plan.jpg";

const iceImg = new Image();
iceImg.src = "assets/buz.png";

const penguin = {
    x: 148,
    y: 540,
    w: 64,
    h: 64,
    frameX: 0,
    maxFrames: 6,
    fps: 0,
    stagger: 8,
};

let obstacles = [];
let timer = 0;
let moveDir = 0;

//
// KONTROLLER
//

window.onkeydown = (e) => {
    if (e.key === "ArrowLeft") moveDir = -1;
    if (e.key === "ArrowRight") moveDir = 1;
};

window.onkeyup = () => moveDir = 0;

canvas.ontouchstart = (e) => {
    e.preventDefault();
    const tx = e.touches[0].clientX;
    moveDir = tx < window.innerWidth / 2 ? -1 : 1;
};

canvas.ontouchend = () => moveDir = 0;

//
// UPDATE
//

function update() {
    if (!gameActive) return;

    // Yatay hareket
    penguin.x += moveDir * 8;

    // Sınır kontrol
    if (penguin.x < 0) penguin.x = 0;
    if (penguin.x > canvas.width - penguin.w)
        penguin.x = canvas.width - penguin.w;

    // Engel üretimi
    if (++timer > 55) {
        obstacles.push({
            x: Math.random() * (canvas.width - 40),
            y: -80,
            w: 40,
            h: 80,
        });
        timer = 0;
    }

    // Engelleri güncelle
    obstacles.forEach((o, i) => {
        o.y += 6 + puan / 20;

        if (o.y > canvas.height) {
            obstacles.splice(i, 1);
            puan++;
            puanYazisi.innerText = "PUAN: " + puan;
        }

        // Çarpışma (hitbox)
        if (
            penguin.x + 15 < o.x + o.w &&
            penguin.x + 49 > o.x &&
            penguin.y + 15 < o.y + o.h &&
            penguin.y + 60 > o.y
        ) {
            gameActive = false;
            alert("PUANIN: " + puan);
            location.reload();
        }
    });

    // Sprite animasyon
    penguin.fps++;
    if (penguin.fps % penguin.stagger === 0) {
        penguin.frameX = (penguin.frameX + 1) % penguin.maxFrames;
    }
}

//
// DRAW
//

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Arka plan
    if (backgroundImg.complete) {
        ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
    }

    // Engeller
    if (iceImg.complete) {
        obstacles.forEach(o => {
            ctx.drawImage(iceImg, o.x, o.y, o.w, o.h);
        });
    }

    // Penguen sprite
    if (penguinImg.complete) {
        const spriteWidth = penguinImg.width / penguin.maxFrames;

        ctx.drawImage(
            penguinImg,
            penguin.frameX * spriteWidth,
            0,
            spriteWidth,
            penguinImg.height,
            penguin.x,
            penguin.y,
            penguin.w,
            penguin.h
        );
    }
}

//
// LOOP
//

function gameLoop() {
    update();
    draw();
    if (gameActive) requestAnimationFrame(gameLoop);
}

//
// IMAGE LOAD GUARD
//

let imagesToLoad = [penguinImg, backgroundImg, iceImg];
let loadedCount = 0;

imagesToLoad.forEach(img => {
    if (img.complete) incrementCounter();
    else img.onload = incrementCounter;
});

function incrementCounter() {
    loadedCount++;
    if (loadedCount === imagesToLoad.length) {
        gameLoop();
    }
}
