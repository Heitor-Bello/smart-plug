"use client";

import { Zap } from "lucide-react";

export function LoginBrandPanel() {
  return (
    <div className="flex flex-col h-full bg-card rounded-2xl p-8 lg:p-12">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <Zap size={18} className="text-primary-foreground" />
        </div>
        <span className="text-primary font-bold text-xl">VoltMetric Pro</span>
      </div>
      <p className="text-muted-foreground text-sm mb-12">
        Inteligência Energética
      </p>

      {/* Pulse Visualization */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative w-64 h-64">
          {/* Outer border with gradient */}
          <div className="absolute inset-0 rounded-2xl border border-primary/30 bg-gradient-to-b from-primary/5 to-transparent" />

          {/* Inner glow */}
          <div className="absolute inset-4 rounded-xl border border-primary/20" />

          {/* Center pulse line */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              viewBox="0 0 200 100"
              className="w-48 h-24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0 50 L40 50 L50 50 L60 30 L70 70 L80 20 L90 80 L100 50 L110 50 L200 50"
                stroke="url(#pulseGradient)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-pulse"
              />
              <defs>
                <linearGradient
                  id="pulseGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#00D1FF" stopOpacity="0.3" />
                  <stop offset="50%" stopColor="#00D1FF" stopOpacity="1" />
                  <stop offset="100%" stopColor="#00D1FF" stopOpacity="0.3" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Glow effect */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-16 h-16 bg-primary/20 rounded-full blur-xl" />
          </div>

          {/* Corner decorations */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary/50 rounded-tl-lg" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary/50 rounded-tr-lg" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary/50 rounded-bl-lg" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary/50 rounded-br-lg" />
        </div>
      </div>

      {/* Quote Box */}
      <div className="mt-auto bg-secondary/50 rounded-xl p-6 border border-border">
        <p className="text-foreground font-medium mb-2">
          {'"Monitorando o pulso de cada quilowatt."'}
        </p>
        <p className="text-muted-foreground text-sm">
          {
            "Visualize, analise e otimize o consumo energético da sua instalação em tempo real com precisão industrial."
          }
        </p>
      </div>
    </div>
  );
}
