import React, { useEffect, useRef } from 'react';
import { cn } from '../utils/cn';

const AnimatedBackground = ({ className }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);
        const mouse = { x: width / 2, y: height / 2 };
        const TILE_SIZE = 40;
        const STROKE_COLOR = 'rgba(255, 255, 255, 0.6)';
        const FILL_COLOR_PRIMARY = '#1E40AF';
        const FILL_COLOR_SECONDARY = '#F97316';

        const drawGrid = () => {
            ctx.clearRect(0, 0, width, height);

            for (let x = 0; x < width; x += TILE_SIZE) {
                for (let y = 0; y < height; y += TILE_SIZE) {
                    const dist = Math.hypot(x + TILE_SIZE / 2 - mouse.x, y + TILE_SIZE / 2 - mouse.y);
                    const opacity = Math.max(0, 1 - dist / 300);

                    if (opacity > 0.1) {
                        const colorLerp = (c1, c2, t) => {
                            const r1 = parseInt(c1.slice(1, 3), 16);
                            const g1 = parseInt(c1.slice(3, 5), 16);
                            const b1 = parseInt(c1.slice(5, 7), 16);
                            const r2 = parseInt(c2.slice(1, 3), 16);
                            const g2 = parseInt(c2.slice(3, 5), 16);
                            const b2 = parseInt(c2.slice(5, 7), 16);
                            const r = Math.round(r1 + (r2 - r1) * t);
                            const g = Math.round(g1 + (g2 - g1) * t);
                            const b = Math.round(b1 + (b2 - b1) * t);
                            return `rgba(${r}, ${g}, ${b}, ${opacity * 0.5})`;
                        };

                        ctx.fillStyle = colorLerp(FILL_COLOR_PRIMARY, FILL_COLOR_SECONDARY, opacity);
                        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                    }

                    ctx.strokeStyle = STROKE_COLOR;
                    ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
                }
            }
        };

        const animate = () => {
            drawGrid();
            requestAnimationFrame(animate);
        };

        const handleMouseMove = (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        animate();

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className={cn(
                'fixed inset-0 -z-10 pointer-events-none',
                className
            )}
        />
    );
};

export default AnimatedBackground;
