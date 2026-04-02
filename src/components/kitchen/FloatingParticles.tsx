import { useMemo } from "react";

interface Particle {
  id: number;
  left: string;
  size: number;
  duration: number;
  delay: number;
  color: string;
}

const colors = [
  "hsl(262, 83%, 58%)",
  "hsl(172, 66%, 50%)",
  "hsl(330, 81%, 60%)",
  "hsl(25, 95%, 55%)",
  "hsl(142, 70%, 49%)",
];

export function FloatingParticles({ count = 20 }: { count?: number }) {
  const particles = useMemo<Particle[]>(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 6 + 2,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * 10,
      color: colors[i % colors.length],
    })),
    [count]
  );

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            background: p.color,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            opacity: 0.15,
            filter: `blur(${p.size > 5 ? 1 : 0}px)`,
          }}
        />
      ))}
    </div>
  );
}
