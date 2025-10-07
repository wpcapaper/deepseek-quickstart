/**
 * 网页版贪吃蛇游戏主逻辑
 * @author Dify全栈研发专家
 * @date 2025-10-07 17:36:37
 */

// 游戏常量配置
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const GRID_SIZE = 20;
const INITIAL_SPEED = 200; // 初始移动间隔（毫秒）
const SPEED_CHANGE_RATE = 0.05; // 速度变化率（5%）
const MIN_SPEED = INITIAL_SPEED; // 最小速度保护

// 食物类型枚举
const FOOD_TYPES = {
    NORMAL: 'normal',
    GOLDEN: 'golden'
};

// 方向枚举
const DIRECTIONS = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 }
};

class SnakeGame {
    constructor() {
        // 获取画布和上下文
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = GAME_WIDTH;
        this.canvas.height = GAME_HEIGHT;

        // 初始化游戏状态
        this.resetGame();
        
        // 绑定键盘事件
        this.bindKeyboardEvents();
        
        // 游戏循环
        this.gameLoop = null;
    }

    /**
     * 重置游戏状态
     */
    resetGame() {
        // 蛇的初始位置（居中）
        this.snake = [
            { x: Math.floor(GAME_WIDTH / 2 / GRID_SIZE), y: Math.floor(GAME_HEIGHT / 2 / GRID_SIZE) },
            { x: Math.floor(GAME_WIDTH / 2 / GRID_SIZE) - 1, y: Math.floor(GAME_HEIGHT / 2 / GRID_SIZE) },
            { x: Math.floor(GAME_WIDTH / 2 / GRID_SIZE) - 2, y: Math.floor(GAME_HEIGHT / 2 / GRID_SIZE) }
        ];
        
        // 初始方向向右
        this.direction = DIRECTIONS.RIGHT;
        this.nextDirection = DIRECTIONS.RIGHT;
        
        // 初始速度
        this.speed = INITIAL_SPEED;
        
        // 得分
        this.score = 0;
        
        // 游戏是否进行中
        this.isRunning = false;
        
        // 生成第一个食物
        this.generateFood();
    }

    /**
     * 绑定键盘事件
     */
    bindKeyboardEvents() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowUp':
                    if (this.direction !== DIRECTIONS.DOWN) {
                        this.nextDirection = DIRECTIONS.UP;
                    }
                    break;
                case 'ArrowDown':
                    if (this.direction !== DIRECTIONS.UP) {
                        this.nextDirection = DIRECTIONS.DOWN;
                    }
                    break;
                case 'ArrowLeft':
                    if (this.direction !== DIRECTIONS.RIGHT) {
                        this.nextDirection = DIRECTIONS.LEFT;
                    }
                    break;
                case 'ArrowRight':
                    if (this.direction !== DIRECTIONS.LEFT) {
                        this.nextDirection = DIRECTIONS.RIGHT;
                    }
                    break;
            }
        });
    }

    /**
     * 生成食物
     */
    generateFood() {
        // 20%概率生成金色食物
        const isGolden = Math.random() < 0.2;
        this.food = {
            type: isGolden ? FOOD_TYPES.GOLDEN : FOOD_TYPES.NORMAL,
            x: Math.floor(Math.random() * (GAME_WIDTH / GRID_SIZE)),
            y: Math.floor(Math.random() * (GAME_HEIGHT / GRID_SIZE))
        };

        // 确保食物不与蛇身重叠
        for (let segment of this.snake) {
            if (segment.x === this.food.x && segment.y === this.food.y) {
                return this.generateFood();
            }
        }
    }

    /**
     * 更新游戏状态
     */
    update() {
        // 更新方向
        this.direction = this.nextDirection;

        // 计算新的蛇头位置
        const head = { 
            x: this.snake[0].x + this.direction.x, 
            y: this.snake[0].y + this.direction.y 
        };

        // 检查碰撞边界
        if (
            head.x < 0 || 
            head.x >= GAME_WIDTH / GRID_SIZE || 
            head.y < 0 || 
            head.y >= GAME_HEIGHT / GRID_SIZE
        ) {
            this.gameOver();
            return;
        }

        // 检查撞到自己
        for (let i = 0; i < this.snake.length; i++) {
            if (this.snake[i].x === head.x && this.snake[i].y === head.y) {
                this.gameOver();
                return;
            }
        }

        // 将新头部添加到蛇身
        this.snake.unshift(head);

        // 检查是否吃到食物
        if (head.x === this.food.x && head.y === this.food.y) {
            // 根据食物类型更新得分和长度
            if (this.food.type === FOOD_TYPES.GOLDEN) {
                this.score += 25;
                // 金色食物增加2节长度（已经unshift了一个，再添加一个）
                this.snake.push({...this.snake[this.snake.length - 1]});
                // 速度降低5%
                this.speed = Math.min(this.speed * (1 + SPEED_CHANGE_RATE), MIN_SPEED);
            } else {
                this.score += 10;
                // 速度提升5%
                this.speed = this.speed * (1 - SPEED_CHANGE_RATE);
            }
            
            // 生成新食物
            this.generateFood();
        } else {
            // 没吃到食物，移除尾部
            this.snake.pop();
        }
    }

    /**
     * 绘制游戏画面
     */
    draw() {
        // 清空画布
        this.ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        
        // 绘制背景
        this.drawBackground();
        
        // 绘制蛇
        this.drawSnake();
        
        // 绘制食物
        this.drawFood();
        
        // 绘制得分
        this.drawScore();
    }

    /**
     * 绘制背景
     */
    drawBackground() {
        // 创建渐变背景
        const gradient = this.ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
        gradient.addColorStop(0, '#87CEEB'); // 天蓝色
        gradient.addColorStop(1, '#98FB98'); // 淡绿色
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        
        // 绘制网格线（可选，用于调试）
        /*
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        for (let x = 0; x <= GAME_WIDTH; x += GRID_SIZE) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, GAME_HEIGHT);
            this.ctx.stroke();
        }
        for (let y = 0; y <= GAME_HEIGHT; y += GRID_SIZE) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(GAME_WIDTH, y);
            this.ctx.stroke();
        }
        */
    }

    /**
     * 绘制蛇
     */
    drawSnake() {
        // 绘制蛇身
        for (let i = 0; i < this.snake.length; i++) {
            const segment = this.snake[i];
            
            // 蛇头颜色不同
            if (i === 0) {
                this.ctx.fillStyle = '#228B22'; // 深绿色
            } else {
                // 蛇身使用渐变色
                this.ctx.fillStyle = `rgb(34, ${139 + i * 2}, 34)`;
            }
            
            // 绘制圆角矩形
            this.ctx.beginPath();
            this.ctx.roundRect(
                segment.x * GRID_SIZE, 
                segment.y * GRID_SIZE, 
                GRID_SIZE, 
                GRID_SIZE, 
                5 // 圆角半径
            );
            this.ctx.fill();
            
            // 绘制蛇头的眼睛
            if (i === 0) {
                this.ctx.fillStyle = 'white';
                
                // 根据方向确定眼睛位置
                let eye1X, eye1Y, eye2X, eye2Y;
                const eyeOffset = 5;
                const eyeRadius = 2;
                
                if (this.direction === DIRECTIONS.RIGHT) {
                    eye1X = segment.x * GRID_SIZE + GRID_SIZE - eyeOffset;
                    eye1Y = segment.y * GRID_SIZE + eyeOffset;
                    eye2X = segment.x * GRID_SIZE + GRID_SIZE - eyeOffset;
                    eye2Y = segment.y * GRID_SIZE + GRID_SIZE - eyeOffset;
                } else if (this.direction === DIRECTIONS.LEFT) {
                    eye1X = segment.x * GRID_SIZE + eyeOffset;
                    eye1Y = segment.y * GRID_SIZE + eyeOffset;
                    eye2X = segment.x * GRID_SIZE + eyeOffset;
                    eye2Y = segment.y * GRID_SIZE + GRID_SIZE - eyeOffset;
                } else if (this.direction === DIRECTIONS.UP) {
                    eye1X = segment.x * GRID_SIZE + eyeOffset;
                    eye1Y = segment.y * GRID_SIZE + eyeOffset;
                    eye2X = segment.x * GRID_SIZE + GRID_SIZE - eyeOffset;
                    eye2Y = segment.y * GRID_SIZE + eyeOffset;
                } else { // DOWN
                    eye1X = segment.x * GRID_SIZE + eyeOffset;
                    eye1Y = segment.y * GRID_SIZE + GRID_SIZE - eyeOffset;
                    eye2X = segment.x * GRID_SIZE + GRID_SIZE - eyeOffset;
                    eye2Y = segment.y * GRID_SIZE + GRID_SIZE - eyeOffset;
                }
                
                // 绘制眼睛
                this.ctx.beginPath();
                this.ctx.arc(eye1X, eye1Y, eyeRadius, 0, Math.PI * 2);
                this.ctx.fill();
                
                this.ctx.beginPath();
                this.ctx.arc(eye2X, eye2Y, eyeRadius, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
    }

    /**
     * 绘制食物
     */
    drawFood() {
        const food = this.food;
        
        if (food.type === FOOD_TYPES.GOLDEN) {
            // 绘制金色闪烁食物
            const gradient = this.ctx.createRadialGradient(
                food.x * GRID_SIZE + GRID_SIZE/2,
                food.y * GRID_SIZE + GRID_SIZE/2,
                1,
                food.x * GRID_SIZE + GRID_SIZE/2,
                food.y * GRID_SIZE + GRID_SIZE/2,
                GRID_SIZE
            );
            gradient.addColorStop(0, '#FFD700'); // 金色中心
            gradient.addColorStop(1, '#FF8C00'); // 橙色边缘
            
            this.ctx.fillStyle = gradient;
            
            // 绘制星星形状
            this.drawStar(
                food.x * GRID_SIZE + GRID_SIZE/2,
                food.y * GRID_SIZE + GRID_SIZE/2,
                GRID_SIZE/2 - 2,
                GRID_SIZE/4,
                5
            );
        } else {
            // 绘制普通食物（苹果）
            this.ctx.fillStyle = '#FF0000';
            this.ctx.beginPath();
            this.ctx.arc(
                food.x * GRID_SIZE + GRID_SIZE/2,
                food.y * GRID_SIZE + GRID_SIZE/2,
                GRID_SIZE/2 - 2,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
            
            // 绘制苹果梗
            this.ctx.fillStyle = '#8B4513';
            this.ctx.fillRect(
                food.x * GRID_SIZE + GRID_SIZE/2 - 1,
                food.y * GRID_SIZE + 2,
                2,
                4
            );
        }
    }

    /**
     * 绘制星星形状
     */
    drawStar(cx, cy, outerRadius, innerRadius, points) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / points;
        
        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy - outerRadius);
        
        for (let i = 0; i < points; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            this.ctx.lineTo(x, y);
            rot += step;
            
            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            this.ctx.lineTo(x, y);
            rot += step;
        }
        
        this.ctx.lineTo(cx, cy - outerRadius);
        this.ctx.closePath();
        this.ctx.fill();
    }

    /**
     * 绘制得分
     */
    drawScore() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`得分: ${this.score}`, 10, 30);
    }

    /**
     * 游戏结束处理
     */
    gameOver() {
        this.isRunning = false;
        clearInterval(this.gameLoop);
        showGameOverScreen(this.score);
    }

    /**
     * 开始游戏
     */
    start() {
        if (this.isRunning) return;
        
        this.resetGame();
        this.isRunning = true;
        
        // 开始游戏循环
        let lastRender = 0;
        const gameStep = (timestamp) => {
            if (!this.isRunning) return;
            
            const elapsed = timestamp - lastRender;
            
            if (elapsed > this.speed) {
                this.update();
                this.draw();
                lastRender = timestamp;
            }
            
            requestAnimationFrame(gameStep);
        };
        
        requestAnimationFrame(gameStep);
    }
}

// 扩展CanvasRenderingContext2D以支持圆角矩形
if (CanvasRenderingContext2D) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
        if (width < 2 * radius) radius = width / 2;
        if (height < 2 * radius) radius = height / 2;
        
        this.beginPath();
        this.moveTo(x + radius, y);
        this.arcTo(x + width, y, x + width, y + height, radius);
        this.arcTo(x + width, y + height, x, y + height, radius);
        this.arcTo(x, y + height, x, y, radius);
        this.arcTo(x, y, x + width, y, radius);
        this.closePath();
        return this;
    };
}

// UI控制函数
function showMenu() {
    document.getElementById('menuScreen').style.display = 'flex';
    document.getElementById('gameOverScreen').style.display = 'none';
    document.getElementById('gameCanvas').style.display = 'none';
}

function showGame() {
    document.getElementById('menuScreen').style.display = 'none';
    document.getElementById('gameOverScreen').style.display = 'none';
    document.getElementById('gameCanvas').style.display = 'block';
    
    // 开始游戏
    window.game.start();
}

function showGameOverScreen(score) {
    document.getElementById('menuScreen').style.display = 'none';
    document.getElementById('gameOverScreen').style.display = 'flex';
    document.getElementById('gameCanvas').style.display = 'block';
    document.getElementById('finalScore').textContent = score;
}

// 初始化游戏
window.onload = function() {
    window.game = new SnakeGame();
    showMenu();
    
    // 绑定按钮事件
    document.getElementById('startButton').addEventListener('click', showGame);
    document.getElementById('restartButton').addEventListener('click', showGame);
};