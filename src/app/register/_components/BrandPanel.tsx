import { Zap } from "lucide-react";

export function BrandPanel() {
  return (
    <div className="relative flex flex-col justify-between h-full p-8 lg:p-12 overflow-hidden">
      {/* Logo and Title */}
      <div>
        <div className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <span className="text-xl font-bold text-primary">VoltMetric Pro</span>
        </div>

        <h1 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight">
          Energy Intelligence
          <br />
          Command Center
        </h1>
      </div>

      {/* Stats Chart */}
      <div className="flex-1 flex flex-col justify-center py-8">
        <div className="flex items-end gap-3 h-32 mb-6">
          <div className="w-8 bg-primary/80 rounded-t-sm h-[60%]" />
          <div className="w-8 bg-primary rounded-t-sm h-full" />
          <div className="w-8 bg-primary/60 rounded-t-sm h-[45%]" />
        </div>
        <div className="w-full h-px bg-muted mb-8" />

        <div className="flex gap-12">
          <div>
            <p className="text-xs text-muted-foreground tracking-wider uppercase mb-1">
              Efficiency Rate
            </p>
            <p className="text-2xl font-bold text-primary">98.4%</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground tracking-wider uppercase mb-1">
              Active Nodes
            </p>
            <p className="text-2xl font-bold text-foreground">1,204</p>
          </div>
        </div>
      </div>

      {/* Decorative Arc */}
      <div className="absolute -bottom-32 -left-32 w-96 h-96">
        <svg viewBox="0 0 400 400" className="w-full h-full">
          <circle
            cx="200"
            cy="200"
            r="180"
            fill="none"
            stroke="url(#arcGradient)"
            strokeWidth="2"
            strokeDasharray="400 1000"
            className="opacity-40"
          />
          <defs>
            <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00D1FF" />
              <stop offset="100%" stopColor="#00D1FF" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Footer */}
      <p className="text-sm text-muted-foreground relative z-10">
        &copy; 2024 VoltMetric Intelligence. All rights reserved.
      </p>
    </div>
  );
}
