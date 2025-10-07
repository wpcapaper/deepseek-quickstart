// snake-game.js
/**
 * @author Dify全栈研发专家
 * @date 2025-10-07 16:38:18
 */
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// 游戏配置常量
const GRID_SIZE = 20; // 每格像素大小
const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;
const MIN_SPEED = 100; // 最低移动间隔(毫秒)
const MAX_SPEED = 500; // 最高移动间隔(毫秒)
const INITIAL_SPEED = 300; // 初始移动间隔(毫秒)

// 游戏状态变量
let snake = [];
let direction = 'right';
let nextDirection = 'right';
let food = {};
let score = 3;
let moveInterval = INITIAL_SPEED;
let gameLoop;

function initGame() {
    // 初始化蛇的位置（水平排列）
    snake = [
        {x: 5 * GRID_SIZE, y: 10 * GRID_SIZE},
        {x: 4 * GRID_SIZE, y: 10 * GRID_SIZE},
        {x: 3 * GRID_SIZE, y: 10 * GRID_SIZE}
    ];
    
    direction = 'right';
    nextDirection = 'right';
    score = 3;
    moveInterval = INITIAL_SPEED;
    updateStatusBar();
    
    generateFood();
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(update, moveInterval);
}

function generateFood() {
    // 随机生成食物类型(20%金食, 80%红食)
    const isGolden = Math.random() < 0.2;
    
    // 寻找一个不在蛇身上的空位放置食物
    let newFood;
    let overlapping;
    do {
        overlapping = false;
        newFood = {
            x: Math.floor(Math.random() * (CANVAS_WIDTH / GRID_SIZE)) * GRID_SIZE,
            y: Math.floor(Math.random() * (CANVAS_HEIGHT / GRID_SIZE)) * GRID_SIZE,
            isGolden: isGolden
        };
        
        for (let segment of snake) {
            if (segment.x === newFood.x && segment.y === newFood.y) {
                overlapping = true;
                break;
            }
        }
    } while (overlapping);
    
    food = newFood;
}

function draw() {
    // 清除画布
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // 绘制蛇身（绿色方块）
    ctx.fillStyle = '#4CAF50';
    for (let segment of snake) {
        ctx.fillRect(segment.x, segment.y, GRID_SIZE, GRID_SIZE);
    }
    
    // 绘制食物
    if (food.isGolden) {
        // 绘制金色食物，并加入闪烁效果
        const opacity = 0.7 + 0.3 * Math.abs(Math.sin(Date.now() / 200));
        ctx.fillStyle = `rgba(255, 215, 0, ${opacity})`;
    } else {
        ctx.fillStyle = '#F44336'; // 红色普通食物
    }
    ctx.beginPath();
    ctx.arc(
        food.x + GRID_SIZE / 2,
        food.y + GRID_SIZE / 2,
        GRID_SIZE / 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

function update() {
    direction = nextDirection;
    
    // 计算新的头部位置
    const head = {...snake[0]};
    switch(direction) {
        case 'up': head.y -= GRID_SIZE; break;
        case 'down': head.y += GRID_SIZE; break;
        case 'left': head.x -= GRID_SIZE; break;
        case 'right': head.x += GRID_SIZE; break;
    }
    
    // 检查碰撞边界
    if (
        head.x < 0 ||
        head.x >= CANVAS_WIDTH ||
        head.y < 0 ||
        head.y >= CANVAS_HEIGHT
    ) {
        endGame();
        return;
    }
    
    // 检查咬到自己
    for (let i = 0; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            endGame();
            return;
        }
    }
    
    // 将新头部添加进蛇数组开头
    snake.unshift(head);
    
    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        // 吃到食物的处理逻辑
        if (food.isGolden) {
            // 金色食物：长度+2，速度降低最多至MAX_SPEED
            score += 2;
            // 添加两个身体节点（注意此时尾部尚未移除）
            snake.push({...snake[snake.length - 1]});
            snake.push({...snake[snake.length - 1]});
            
            moveInterval = Math.min(moveInterval + 50, MAX_SPEED);
        } else {
            // 普通食物：长度+1，速度提升最少至MIN_SPEED
            score++;
            moveInterval = Math.max(moveInterval - 20, MIN_SPEED);
        }
        
        updateStatusBar();
        adjustGameSpeed(); // 更新定时器
        
        generateFood(); // 生成下一个食物
    } else {
        // 如果没吃到食物，则移除尾部保持长度不变
        snake.pop();
    }
    
    draw();
}

function updateStatusBar() {
    document.getElementById('score').textContent = score;
    document.getElementById('speed').textContent = `${moveInterval}ms`;
}

function adjustGameSpeed() {
    clearInterval(gameLoop);
    gameLoop = setInterval(update, moveInterval);
}

function endGame() {
    clearInterval(gameLoop);
    document.getElementById('final-score').textContent = score;
    document.getElementById('game-over-modal').style.display = 'flex';
}

function restartGame() {
    document.getElementById('game-over-modal').style.display = 'none';
    initGame();
}

// 键盘控制监听
document.addEventListener('keydown', e => {
    switch(e.key) {
        case 'ArrowUp':
            if (direction !== 'down') nextDirection = 'up';
            break;
        case 'ArrowDown':
            if (direction !== 'up') nextDirection = 'down';
            break;
        case 'ArrowLeft':
            if (direction !== 'right') nextDirection = 'left';
            break;
        case 'ArrowRight':
            if (direction !== 'left') nextDirection = 'right';
            break;
    }
});

// 页面加载完成后初始化游戏
window.onload = () => {
    initGame();
    draw();
};