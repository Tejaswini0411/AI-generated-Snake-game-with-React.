import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Trophy, RotateCcw, Play } from 'lucide-react';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE; // 400
const INITIAL_SNAKE = [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const MOVE_INTERVAL = 100; // ms

type Point = { x: number; y: number };
type Particle = { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: string; size: number };

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const moveTimerRef = useRef<number>(0);

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const snakeRef = useRef<Point[]>(INITIAL_SNAKE);
  const dirRef = useRef<Point>(INITIAL_DIRECTION);
  const nextDirRef = useRef<Point>(INITIAL_DIRECTION);
  const foodRef = useRef<Point>({ x: 15, y: 5 });
  const particlesRef = useRef<Particle[]>([]);
  
  const stateRef = useRef({ gameOver: false, isPaused: false, score: 0 });
  useEffect(() => {
    stateRef.current = { gameOver, isPaused, score };
  }, [gameOver, isPaused, score]);

  const generateFood = useCallback(() => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // eslint-disable-next-line no-loop-func
      if (!snakeRef.current.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
        break;
      }
    }
    foodRef.current = newFood;
  }, []);

  const spawnParticles = (x: number, y: number, color: string) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 80 + 20;
      newParticles.push({
        x: x * CELL_SIZE + CELL_SIZE / 2,
        y: y * CELL_SIZE + CELL_SIZE / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: Math.random() * 0.6 + 0.2,
        color,
        size: Math.random() * 3 + 1
      });
    }
    particlesRef.current.push(...newParticles);
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 400);
  };

  const resetGame = () => {
    snakeRef.current = INITIAL_SNAKE;
    dirRef.current = INITIAL_DIRECTION;
    nextDirRef.current = INITIAL_DIRECTION;
    particlesRef.current = [];
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    generateFood();
  };

  const update = useCallback((time: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = time;
    const deltaTime = (time - lastTimeRef.current) / 1000;
    const deltaMs = time - lastTimeRef.current;
    lastTimeRef.current = time;

    const { gameOver: isOver, isPaused: paused, score: currentScore } = stateRef.current;

    particlesRef.current = particlesRef.current.filter(p => {
      p.x += p.vx * deltaTime;
      p.y += p.vy * deltaTime;
      p.life -= deltaTime / p.maxLife;
      return p.life > 0;
    });

    if (!isOver && !paused) {
      moveTimerRef.current += deltaMs;
      if (moveTimerRef.current >= MOVE_INTERVAL) {
        moveTimerRef.current = 0;
        
        dirRef.current = nextDirRef.current;
        const head = snakeRef.current[0];
        const newHead = {
          x: head.x + dirRef.current.x,
          y: head.y + dirRef.current.y,
        };

        if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
          setGameOver(true);
          triggerShake();
          spawnParticles(head.x, head.y, '#ec4899');
        } 
        else if (snakeRef.current.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true);
          triggerShake();
          spawnParticles(head.x, head.y, '#ec4899');
        } 
        else {
          const newSnake = [newHead, ...snakeRef.current];
          
          if (newHead.x === foodRef.current.x && newHead.y === foodRef.current.y) {
            const newScore = currentScore + 10;
            setScore(newScore);
            setHighScore(prev => Math.max(prev, newScore));
            spawnParticles(foodRef.current.x, foodRef.current.y, '#22d3ee');
            generateFood();
          } else {
            newSnake.pop();
          }
          snakeRef.current = newSnake;
        }
      }
    }

    draw();
    requestRef.current = requestAnimationFrame(update);
  }, [generateFood]);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    ctx.strokeStyle = 'rgba(6, 182, 212, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= CANVAS_SIZE; i += CELL_SIZE) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, CANVAS_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(CANVAS_SIZE, i);
      ctx.stroke();
    }

    const food = foodRef.current;
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ec4899';
    ctx.fillStyle = '#ec4899';
    ctx.beginPath();
    ctx.arc(food.x * CELL_SIZE + CELL_SIZE / 2, food.y * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    snakeRef.current.forEach((segment, index) => {
      const isHead = index === 0;
      ctx.fillStyle = isHead ? '#22d3ee' : '#0891b2';
      if (isHead) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#22d3ee';
      } else {
        ctx.shadowBlur = 0;
      }
      ctx.fillRect(segment.x * CELL_SIZE + 1, segment.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
    });
    ctx.shadowBlur = 0;

    particlesRef.current.forEach(p => {
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;
    ctx.shadowBlur = 0;
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [update]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === ' ') {
        if (stateRef.current.gameOver) resetGame();
        else setIsPaused(p => !p);
        return;
      }

      const { x, y } = dirRef.current;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (y !== 1) nextDirRef.current = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (y !== -1) nextDirRef.current = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (x !== 1) nextDirRef.current = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (x !== -1) nextDirRef.current = { x: 1, y: 0 };
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div 
        className={`relative w-full max-w-[800px] aspect-square bg-[#050505] border border-white/10 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.1)] ${isShaking ? 'animate-shake' : ''}`}
      >
        {/* HUD inside the game container */}
        <div className="absolute top-6 left-6 right-6 flex justify-between font-mono z-10 pointer-events-none">
          <div className="flex flex-col">
            <span className="text-cyan-500 text-xs tracking-[0.2em] uppercase">Score</span>
            <span className="text-3xl font-black text-white drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">{score.toString().padStart(4, '0')}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-purple-500 text-xs tracking-[0.2em] uppercase flex items-center gap-2">
              <Trophy size={14} /> High Score
            </span>
            <span className="text-3xl font-black text-white drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]">{highScore.toString().padStart(4, '0')}</span>
          </div>
        </div>

        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="w-full h-full object-contain"
        />

        {gameOver && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
            <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 mb-4 drop-shadow-[0_0_15px_rgba(236,72,153,0.8)] tracking-widest text-center">SYSTEM<br/>FAILURE</h2>
            <button
              onClick={resetGame}
              className="group relative px-8 py-4 bg-transparent overflow-hidden rounded-none border border-cyan-500 text-cyan-400 font-mono font-bold tracking-[0.2em] transition-all hover:text-black hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] mt-8 pointer-events-auto"
            >
              <div className="absolute inset-0 bg-cyan-500 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-out -z-10"></div>
              <span className="flex items-center gap-3"><RotateCcw size={20} /> REBOOT SEQUENCE</span>
            </button>
          </div>
        )}

        {isPaused && !gameOver && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-20">
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-[0.3em] mb-12 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">PAUSED</h2>
            <button
              onClick={() => setIsPaused(false)}
              className="group relative px-8 py-4 bg-transparent overflow-hidden rounded-none border border-white text-white font-mono font-bold tracking-[0.2em] transition-all hover:text-black hover:shadow-[0_0_30px_rgba(255,255,255,0.6)] pointer-events-auto"
            >
              <div className="absolute inset-0 bg-white translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-out -z-10"></div>
              <span className="flex items-center gap-3"><Play size={20} /> RESUME</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
