import React from 'react';

/**
 * Ocean & Sakura Mesh Gradient Background
 * Intertwines Ocean Jade (#006994, Cyan, Soft Jade Green) with Sakura Pink & Soft Orchid (#FFB7C5, #E8B4B8)
 * like two flowing silk ribbons without muddying.
 */
export const MeshBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden select-none">
      {/* Base Canvas */}
      <div className="absolute inset-0 bg-[#F5F8FA]" />

      {/* Ribbon 1: Ocean Jade & Deep Azure Silk (Top Left to Bottom Right diagonal flow) */}
      <div
        className="absolute -top-[15%] -left-[10%] w-[80vw] h-[80vw] rounded-full mix-blend-multiply opacity-55 blur-[85px] transition-all duration-1000"
        style={{
          background: 'radial-gradient(circle at 35% 35%, #007799 0%, #009688 45%, #80CBC4 80%, transparent 100%)',
          animation: 'silkFloatOne 24s ease-in-out infinite alternate',
        }}
      />
      <div
        className="absolute top-[40%] -left-[15%] w-[65vw] h-[65vw] rounded-full mix-blend-multiply opacity-45 blur-[95px]"
        style={{
          background: 'radial-gradient(circle, #028090 0%, #00A896 50%, transparent 75%)',
          animation: 'silkFloatTwo 28s ease-in-out infinite alternate',
        }}
      />

      {/* Ribbon 2: Sakura Pink & Soft Orchid Silk (Top Right to Center/Bottom Left flow) */}
      <div
        className="absolute -top-[10%] -right-[12%] w-[75vw] h-[75vw] rounded-full mix-blend-multiply opacity-60 blur-[85px]"
        style={{
          background: 'radial-gradient(circle at 60% 30%, #FFA8B6 0%, #FFB7C5 40%, #F3C5D0 75%, transparent 100%)',
          animation: 'silkFloatTwo 22s ease-in-out infinite alternate-reverse',
        }}
      />
      <div
        className="absolute top-[50%] -right-[10%] w-[70vw] h-[70vw] rounded-full mix-blend-multiply opacity-50 blur-[90px]"
        style={{
          background: 'radial-gradient(circle at 50% 50%, #E8B4B8 0%, #FFCAD4 45%, #E0B0FF 80%, transparent 100%)',
          animation: 'silkFloatOne 30s ease-in-out infinite alternate-reverse',
        }}
      />

      {/* Center Silk Interweave (Deep Ocean Blue meets Soft Petal Orchid) */}
      <div
        className="absolute top-[25%] left-[25%] w-[55vw] h-[55vw] rounded-full mix-blend-screen opacity-40 blur-[110px]"
        style={{
          background: 'radial-gradient(circle, #B2EBF2 0%, #F8BBD0 55%, transparent 80%)',
        }}
      />

      {/* Bottom Subtle Ripple */}
      <div
        className="absolute -bottom-[15%] left-[15%] w-[70vw] h-[45vw] rounded-full mix-blend-multiply opacity-40 blur-[80px]"
        style={{
          background: 'radial-gradient(ellipse at center, #80DEEA 0%, #FCE4EC 60%, transparent 85%)',
        }}
      />

      {/* Subtle Analog Silk Grain Filter for poetic vintage feel */}
      <div
        className="absolute inset-0 opacity-[0.025] mix-blend-overlay"
        style={{
          backgroundImage: `radial-gradient(#1A365D 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      <style>{`
        @keyframes silkFloatOne {
          0% {
            transform: translate(0px, 0px) scale(1) rotate(0deg);
          }
          50% {
            transform: translate(6vw, 8vh) scale(1.08) rotate(12deg);
          }
          100% {
            transform: translate(-4vw, 14vh) scale(0.95) rotate(-8deg);
          }
        }
        @keyframes silkFloatTwo {
          0% {
            transform: translate(0px, 0px) scale(1) rotate(0deg);
          }
          50% {
            transform: translate(-8vw, -6vh) scale(1.1) rotate(-15deg);
          }
          100% {
            transform: translate(5vw, 10vh) scale(0.92) rotate(10deg);
          }
        }
      `}</style>
    </div>
  );
};
