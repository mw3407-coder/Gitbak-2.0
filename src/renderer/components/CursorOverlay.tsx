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
  const [clientX, setClientX] = useState(-100);
  const [clientY, setClientY] = useState(-100);
  const outerSpeed = useRef(0);
  const showCursor = useRef(false);


  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setClientX(e.clientX);
      setClientY(e.clientY);
      if (!showCursor.current) {
        showCursor.current = true;
        outerSpeed.current = 0.2;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);


  useEffect(() => {
    if (innerRef.current) {
      innerRef.current.style.transform = `translate(${clientX - 4}px, ${clientY - 4}px)`;
    }
  }, [clientX, clientY]);


  useEffect(() => {
    let animId: number;
    let currentX = clientX;
    let currentY = clientY;


    const animate = () => {
      if (outerRef.current) {
        if (isPointing && targetX !== undefined && targetY !== undefined) {
          currentX += (targetX - currentX) * outerSpeed.current;
          currentY += (targetY - currentY) * outerSpeed.current;
        } else {
          currentX += (clientX - currentX) * outerSpeed.current;
          currentY += (clientY - currentY) * outerSpeed.current;
        }
        const size = outerRef.current.offsetWidth;
        outerRef.current.style.transform = `translate(${currentX - size/2}px, ${currentY - size/2}px)`;
      }
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [clientX, clientY, isPointing, targetX, targetY]);


  return (
    <div className="cursor-overlay" style={{ pointerEvents: 'none' }}>
      <div ref={innerRef} className="cursor-inner" style={{
        position: 'fixed', top: 0, left: 0, width: 8, height: 8,
        borderRadius: '50%', backgroundColor: isPointing ? '#00ff88' : '#3b82f6',
        zIndex: 99999, pointerEvents: 'none',
      }} />
      <div ref={outerRef} className="cursor-outer" style={{
        position: 'fixed', top: 0, left: 0,
        width: isPointing ? 60 : 40, height: isPointing ? 60 : 40,
        borderRadius: '50%', border: `2px solid ${isPointing ? '#00ff88' : '#3b82f6'}`,
        opacity: isPointing ? 0.6 : 0.3,
        transition: 'width 0.3s, height 0.3s, border-color 0.3s, opacity 0.3s',
        zIndex: 99998, pointerEvents: 'none',
      }} />
      {isPointing && (
        <div className="radar-ring" style={{
          position: 'fixed', top: targetY || clientY, left: targetX || clientX,
          width: 20, height: 20, borderRadius: '50%',
          border: '3px solid #00ff88', transform: 'translate(-50%, -50%)',
          animation: 'radar 2.5s ease-out infinite',
          zIndex: 99997, pointerEvents: 'none',
        }} />
      )}
      <style>{`
        @keyframes radar {
          0% { width: 20px; height: 20px; opacity: 0.9; }
          100% { width: 160px; height: 160px; opacity: 0; }
        }
      `}</style>
    </div>
  );
};


export default CursorOverlay;