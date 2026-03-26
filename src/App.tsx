import React from 'react';
import SnakeGame from './components/SnakeGame';
import MusicPlayer from './components/MusicPlayer';
import { Gamepad2 } from 'lucide-react';

export default function App() {
  return (
    <div className="fixed inset-0 bg-[#050505] text-white font-sans overflow-hidden flex flex-col selection:bg-pink-500/30">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-900/20 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 py-4 px-6 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-black/50 backdrop-blur-md border border-white/10 rounded-lg">
            <Gamepad2 size={24} className="text-cyan-400" />
          </div>
          <h1 className="text-xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">
            NEON<span className="text-white font-light">SNAKE</span>
          </h1>
        </div>
        <div className="text-[10px] font-mono text-gray-500 tracking-widest uppercase bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/5">
          v2.0.0 // Canvas Engine
        </div>
      </header>

      {/* Main Game Area - Scales to fit */}
      <main className="relative z-10 flex-1 w-full h-full flex items-center justify-center p-4 pt-20 pb-32 lg:pb-36">
        <SnakeGame />
      </main>

      {/* HUD Overlay - Music Player */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-4 lg:p-6 pointer-events-none flex justify-center">
        <div className="pointer-events-auto w-full max-w-2xl">
          <MusicPlayer />
        </div>
      </div>
    </div>
  );
}
