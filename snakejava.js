const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const grid = 40;

// Cobra inicia com cabeça e rabo (dois segmentos alinhados para a direita)
let snake = [
  { x: 160, y: 160 }, // cabeça
  { x: 120, y: 160 }  // rabo
];

let dx = grid;
let dy = 0;
let nextDx = dx;
let nextDy = dy;

let food = {
  x: Math.floor(Math.random() * 20) * grid,
  y: Math.floor(Math.random() * 20) * grid
};
let score = 0;
let lastTime = 0;

// Velocidade e boost/slow (com valores ajustáveis)
let speed = 150;              // velocidade normal
const minSpeed = 60;          // velocidade máxima (mais rápido)
const maxSpeed = 300;         // velocidade mínima (mais devagar)
const boostSpeed = 80;        // velocidade do boost
let boosted = false;          // flag para boost
let slowed = false;           // flag para slow

// Carregando imagens
const appleImg = new Image();
appleImg.src = "assets/apple.png";
const snakeHeadImg = new Image();
snakeHeadImg.src = "assets/snake_ahead.png";
const snakeBodyImg = new Image();
snakeBodyImg.src = "assets/snake_body.png";
const snakeTailImg = new Image();
snakeTailImg.src = "assets/snake_tail.png";
const grassImg = new Image();
grassImg.src = "assets/grama_tileset.png"; // ajuste o nome conforme seu arquivo

// Garantir que todas as imagens carregaram
let assetsLoaded = 0;
const totalAssets = 5;
function checkAllAssetsLoaded() {
  assetsLoaded++;
  if (assetsLoaded === totalAssets) {
    requestAnimationFrame(gameLoop);
  }
}
appleImg.onload = checkAllAssetsLoaded;
snakeHeadImg.onload = checkAllAssetsLoaded;
snakeBodyImg.onload = checkAllAssetsLoaded;
snakeTailImg.onload = checkAllAssetsLoaded;
grassImg.onload = checkAllAssetsLoaded;

// Função para desenhar imagens rotacionadas (sempre grid x grid)
function drawRotatedImage(image, x, y, angle) {
  ctx.save();
  ctx.translate(x + grid/2, y + grid/2);
  ctx.rotate(angle);
  ctx.drawImage(image, -grid/2, -grid/2, grid, grid);
  ctx.restore();
}

// Função auxiliar para calcular ângulo entre dois pontos (ajustada para sprites virados para cima)
function getAngle(a, b) {
  if (a.x < b.x) return Math.PI / 2;      // Direita
  if (a.x > b.x) return -Math.PI / 2;     // Esquerda
  if (a.y < b.y) return Math.PI;          // Baixo
  if (a.y > b.y) return 0;                // Cima
  return 0;
}

function gameLoop(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const delta = timestamp - lastTime;

  // Ajuste dinâmico de velocidade conforme boost/slow
  if (boosted) {
    speed = boostSpeed;
  } else if (slowed) {
    speed = maxSpeed;
  } else {
    speed = 150;
  }

  if (delta > speed) {
    lastTime = timestamp;

    // Atualiza a direção apenas aqui!
    dx = nextDx;
    dy = nextDy;

    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Fim de jogo: bateu na parede
    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
      alert('Fim de jogo! Sua pontuação foi: ' + score);
      document.location.reload();
      return;
    }

    // Fim de jogo: bateu no próprio corpo
    for (let i = 0; i < snake.length; i++) {
      if (snake[i].x === head.x && snake[i].y === head.y) {
        alert('Fim de jogo! Sua pontuação foi: ' + score);
        document.location.reload();
        return;
      }
    }

    snake.unshift(head);

    // Comeu a comida?
    if (head.x === food.x && head.y === food.y) {
      score++;
      food = {
        x: Math.floor(Math.random() * 20) * grid,
        y: Math.floor(Math.random() * 20) * grid
      };
      if (speed > minSpeed) {
        speed -= 1;
      }
    } else {
      snake.pop();
    }

    // Desenhar o fundo de grama (tiles maiores para valorizar o pixel art)
    const grassTileScale = 6;
    const grassTileSize = grid * grassTileScale;
    for (let x = 0; x < canvas.width; x += grassTileSize) {
      for (let y = 0; y < canvas.height; y += grassTileSize) {
        ctx.drawImage(grassImg, x, y, grassTileSize, grassTileSize);
      }
    }

    // Desenhar a maçã maior e centralizada
    const appleScale = 1.25;
    const appleSize = grid * appleScale;
    const appleOffset = (grid - appleSize) / 2;
    ctx.drawImage(
      appleImg,
      food.x + appleOffset,
      food.y + appleOffset,
      appleSize,
      appleSize
    );

    // Desenhar a cabeça (ajuste de ângulos para sprite virado para cima)
    let headAngle = 0;
    if (dx > 0) headAngle = Math.PI / 2;
    else if (dx < 0) headAngle = -Math.PI / 2;
    else if (dy > 0) headAngle = Math.PI;
    else if (dy < 0) headAngle = 0;
    drawRotatedImage(snakeHeadImg, snake[0].x, snake[0].y, headAngle);

    // Desenhar o corpo
    for (let i = 1; i < snake.length - 1; i++) {
      let prev = snake[i - 1];
      let curr = snake[i];
      let bodyAngle = getAngle(curr, prev);
      drawRotatedImage(snakeBodyImg, curr.x, curr.y, bodyAngle);
    }

    // Desenhar a cauda
    if (snake.length > 1) {
      let tail = snake[snake.length - 1];
      let beforeTail = snake[snake.length - 2];
      let tailAngle = getAngle(tail, beforeTail);
      drawRotatedImage(snakeTailImg, tail.x, tail.y, tailAngle);
    }
  }

  requestAnimationFrame(gameLoop);
}

// Controles do teclado (WASD + setas, boost e slow)
document.addEventListener('keydown', function(e) {
  const key = e.key.toLowerCase();

  // Boost: segurar a tecla na direção atual
  if ((e.key === 'ArrowRight' || key === 'd') && dx !== -grid) {
    nextDx = grid; nextDy = 0;
    boosted = (dx === grid && dy === 0);
    slowed = false;
  } else if ((e.key === 'ArrowLeft' || key === 'a') && dx !== grid) {
    nextDx = -grid; nextDy = 0;
    boosted = (dx === -grid && dy === 0);
    slowed = false;
  } else if ((e.key === 'ArrowUp' || key === 'w') && dy !== grid) {
    nextDx = 0; nextDy = -grid;
    boosted = (dx === 0 && dy === -grid);
    slowed = false;
  } else if ((e.key === 'ArrowDown' || key === 's') && dy !== -grid) {
    nextDx = 0; nextDy = grid;
    boosted = (dx === 0 && dy === grid);
    slowed = false;
  }

  // Slow: pressionar tecla perpendicular à direção atual
  if ((dx !== 0) && (key === 'arrowup' || key === 'w' || key === 'arrowdown' || key === 's')) {
    slowed = true; boosted = false;
  }
  if ((dy !== 0) && (key === 'arrowleft' || key === 'a' || key === 'arrowright' || key === 'd')) {
    slowed = true; boosted = false;
  }
});

document.addEventListener('keyup', function(e) {
  boosted = false;
  slowed = false;
});
