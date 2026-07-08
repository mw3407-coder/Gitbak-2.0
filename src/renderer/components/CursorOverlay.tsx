import React, { useEffect, useRef, useState } from 'react';

interface CursorOverlayProps {
  isPointing?: boolean;
  targetX?: number;
  targetY?: number;
}

const CursorOverlay: React.FC<CursorOverlayProps> = ({ 
  isPointing = false,
  targetX,
  targetY 
}) => {
  const innerRef = useRef<HTMLDivElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const radarRef = useRef<HTMLDivElement>(null);

  const mousePos = useRef({ x: -100, y: -100 });
  const outerPos = useRef({ x: -100, y: -100 });
  const targetPos = useRef({ x: 0, y: 0 });
  const isStuck = useRef(false);
  const outerSpeed = useRef(0.15);
  const hasMouseMoved = useRef(false);

  const [pointing, setPointing] = useState(false);

  useEffect(() => {
    isStuck.current = isPointing;
    targetPos.current = { x: targetX ?? 0, y: targetY ?? 0 };
    setPointing(isPointing);
  }, [isPointing, targetX, targetY]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!hasMouseMoved.current) {
        hasMouseMoved.current = true;
        outerSpeed.current = 0.15;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    let animId: number;
    const animate = () => {
      const target = isStuck.current ? targetPos.current : mousePos.current;
      outerPos.current.x += (target.x - outerPos.current.x) * outerSpeed.current;
      outerPos.current.y += (target.y - outerPos.current.y) * outerSpeed.current;

      if (innerRef.current) {
        innerRef.current.style.transform = `translate(${mousePos.current.x - 4}px, ${mousePos.current.y - 4}px)`;
      }
      if (outerRef.current) {
        const size = isStuck.current ? 60 : 40;
        outerRef.current.style.width = `${size}px`;
        outerRef.current.style.height = `${size}px`;
        outerRef.current.style.borderColor = isStuck.current ? '#00ff88' : '#3b82f6';
        outerRef.current.style.opacity = isStuck.current ? '0.6' : '0.3';
        outerRef.current.style.transform = `translate(${outerPos.current.x - size / 2}px, ${outerPos.current.y - size / 2}px)`;
      }
      if (radarRef.current) {
        if (isStuck.current) {
          radarRef.current.style.display = 'block';
          radarRef.current.style.left = `${targetPos.current.x}px`;
          radarRef.current.style.top = `${targetPos.current.y}px`;
        } else {
          radarRef.current.style.display = 'none';
        }
      }
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="cursor-overlay" style={{ pointerEvents: 'none' }}>
      <div ref={innerRef} className="cursor-inner" style={{
        position: 'fixed', top: 0, left: 0, width: 8, height: 8,
        borderRadius: '50%', backgroundColor: pointing ? '#00ff88' : '#3b82f6',
        zIndex: 99999, pointerEvents: 'none', willChange: 'transform',
      }} />
      <div ref={outerRef} className="cursor-outer" style={{
        position: 'fixed', top: 0, left: 0, width: 40, height: 40,
        borderRadius: '50%', border: '2px solid #3b82f6', opacity: 0.3,
        zIndex: 99998, pointerEvents: 'none', willChange: 'transform',
        transition: 'width 0.3s ease, height 0.3s ease, border-color 0.3s ease, opacity 0.3s ease',
      }} />
      <div ref={radarRef} className="radar-ring" style={{
        position: 'fixed', top: 0, left: 0, width: 20, height: 20,
        borderRadius: '50%', border: '3px solid #00ff88',
        transform: 'translate(-50%, -50%)', zIndex: 99997,
        pointerEvents: 'none', display: 'none',
      }} />
      <style>{`
        @keyframes radar {
          0% { width: 20px; height: 20px; opacity: 0.9; }
          100% { width: 160px; height: 160px; opacity: 0; }
        }
        .radar-ring { animation: radar 2.5s ease-out infinite; }
      `}</style>
    </div>
  );
};

export default CursorOverlay;
