"use client";

import React, { useEffect, useRef, useState } from "react";
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';
import AppLogo from "@/components/app-logo";

interface AuthAnimatedLayoutProps {
    title?: string;
    description?: string;
}

// Reusable tiny Pupil and EyeBall components (self-contained, lightweight)
function Pupil({ size = 12, maxDistance = 5, pupilColor = 'black', forceLookX, forceLookY }: any) {
    const [mouseX, setMouseX] = useState(0);
    const [mouseY, setMouseY] = useState(0);
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            setMouseX(e.clientX);
            setMouseY(e.clientY);
        };
        window.addEventListener('mousemove', onMove);
        return () => window.removeEventListener('mousemove', onMove);
    }, []);

    if (!ref.current && typeof window === 'undefined') return <div />;

    const getPos = () => {
        if (!ref.current) return { x: 0, y: 0 };
        if (forceLookX !== undefined && forceLookY !== undefined) return { x: forceLookX, y: forceLookY };
        const r = ref.current.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = mouseX - cx;
        const dy = mouseY - cy;
        const d = Math.min(Math.sqrt(dx * dx + dy * dy), maxDistance);
        const a = Math.atan2(dy, dx);
        return { x: Math.cos(a) * d, y: Math.sin(a) * d };
    };

    const pos = getPos();

    return (
        <div
            ref={ref}
            className="rounded-full"
            style={{
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor: pupilColor,
                transform: `translate(${pos.x}px, ${pos.y}px)`,
                transition: 'transform 0.12s ease-out',
            }}
        />
    );
}

function EyeBall({ size = 48, pupilSize = 16, maxDistance = 10, eyeColor = 'white', pupilColor = 'black', isBlinking = false, forceLookX, forceLookY }: any) {
    const [mouseX, setMouseX] = useState(0);
    const [mouseY, setMouseY] = useState(0);
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            setMouseX(e.clientX);
            setMouseY(e.clientY);
        };
        window.addEventListener('mousemove', onMove);
        return () => window.removeEventListener('mousemove', onMove);
    }, []);

    const getPos = () => {
        if (!ref.current) return { x: 0, y: 0 };
        if (forceLookX !== undefined && forceLookY !== undefined) return { x: forceLookX, y: forceLookY };
        const r = ref.current.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = mouseX - cx;
        const dy = mouseY - cy;
        const d = Math.min(Math.sqrt(dx * dx + dy * dy), maxDistance);
        const a = Math.atan2(dy, dx);
        return { x: Math.cos(a) * d, y: Math.sin(a) * d };
    };

    const pos = getPos();

    return (
        <div
            ref={ref}
            className="rounded-full flex items-center justify-center transition-all duration-150"
            style={{
                width: `${size}px`,
                height: isBlinking ? '2px' : `${size}px`,
                backgroundColor: eyeColor,
                overflow: 'hidden',
            }}
        >
            {!isBlinking && (
                <div
                    className="rounded-full"
                    style={{
                        width: `${pupilSize}px`,
                        height: `${pupilSize}px`,
                        backgroundColor: pupilColor,
                        transform: `translate(${pos.x}px, ${pos.y}px)`,
                        transition: 'transform 0.12s ease-out',
                    }}
                />
            )}
        </div>
    );
}

export default function AuthAnimatedLayout({ children, title, description }: PropsWithChildren<AuthAnimatedLayoutProps>) {
    const { name, quote } = usePage().props as any;

    // small random blink state for two characters
    const [isPurpleBlinking, setIsPurpleBlinking] = useState(false);
    const [isBlackBlinking, setIsBlackBlinking] = useState(false);
    const [mouseX, setMouseX] = useState(0);
    const [mouseY, setMouseY] = useState(0);

    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            setMouseX(e.clientX);
            setMouseY(e.clientY);
        };
        window.addEventListener('mousemove', onMove);
        return () => window.removeEventListener('mousemove', onMove);
    }, []);

    useEffect(() => {
        const rnd = () => Math.random() * 4000 + 3000;
        let t1: any;
        let t2: any;
        const loop1 = () => {
            t1 = setTimeout(() => {
                setIsPurpleBlinking(true);
                setTimeout(() => setIsPurpleBlinking(false), 140);
                loop1();
            }, rnd());
        };
        const loop2 = () => {
            t2 = setTimeout(() => {
                setIsBlackBlinking(true);
                setTimeout(() => setIsBlackBlinking(false), 140);
                loop2();
            }, rnd());
        };
        loop1();
        loop2();
        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, []);

    // helper to compute subtle face/body transforms
    const calc = (ref: React.RefObject<HTMLDivElement | null>) => {
        if (!ref || !ref.current) return { faceX: 0, faceY: 0, bodySkew: 0 };
        const r = ref.current.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 3;
        const dx = mouseX - cx;
        const dy = mouseY - cy;
        return {
            faceX: Math.max(-15, Math.min(15, dx / 20)),
            faceY: Math.max(-10, Math.min(10, dy / 30)),
            bodySkew: Math.max(-6, Math.min(6, -dx / 120)),
        };
    };

    // refs for characters (used to compute transforms when DOM mounted)
    const purpleRef = useRef<HTMLDivElement | null>(null);
    const blackRef = useRef<HTMLDivElement | null>(null);
    const orangeRef = useRef<HTMLDivElement | null>(null);
    const yellowRef = useRef<HTMLDivElement | null>(null);

    const purplePos = calc(purpleRef);
    const blackPos = calc(blackRef);
    const orangePos = calc(orangeRef);
    const yellowPos = calc(yellowRef);

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left animated area */}
            <div className="relative hidden lg:flex flex-col justify-between bg-gradient-to-br from-primary/90 via-primary to-primary/80 p-12 text-primary-foreground overflow-hidden">
                <div className="relative z-20">
                    <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
                        {/* Keep brand name small/hidden on left to avoid duplicate logo placement */}
                        <span className="sr-only">{name ?? 'YourBrand'}</span>
                    </Link>
                </div>

                <div className="relative z-20 flex items-end justify-center h-[640px]">
                    <div className="relative" style={{ width: 560, height: 520 }}>
                        {/* Purple back (made taller) */}
                        <div
                            ref={purpleRef}
                            className="absolute bottom-0 transition-all duration-700 ease-in-out"
                            style={{
                                left: 70,
                                width: 180,
                                height: 520,
                                backgroundColor: '#6C3FF5',
                                borderRadius: '10px 10px 0 0',
                                zIndex: 1,
                                transform: `skewX(${purplePos.bodySkew || 0}deg)`,
                                transformOrigin: 'bottom center',
                            }}
                        >
                            <div
                                className="absolute flex gap-8 transition-all duration-700 ease-in-out"
                                style={{ left: 45 + (purplePos.faceX || 0), top: 40 + (purplePos.faceY || 0) }}
                            >
                                <EyeBall size={18} pupilSize={7} maxDistance={6} eyeColor="white" pupilColor="#2D2D2D" isBlinking={isPurpleBlinking} />
                                <EyeBall size={18} pupilSize={7} maxDistance={6} eyeColor="white" pupilColor="#2D2D2D" isBlinking={isPurpleBlinking} />
                            </div>
                        </div>

                        {/* Black mid (made taller) */}
                        <div
                            ref={blackRef}
                            className="absolute bottom-0 transition-all duration-700 ease-in-out"
                            style={{
                                left: 240,
                                width: 120,
                                height: 420,
                                backgroundColor: '#2D2D2D',
                                borderRadius: '8px 8px 0 0',
                                zIndex: 2,
                                transform: `skewX(${(blackPos.bodySkew || 0) * 1.2}deg)`,
                                transformOrigin: 'bottom center',
                            }}
                        >
                            <div className="absolute flex gap-6 transition-all duration-700 ease-in-out" style={{ left: 26 + (blackPos.faceX || 0), top: 32 + (blackPos.faceY || 0) }}>
                                <EyeBall size={18} pupilSize={7} maxDistance={5} eyeColor="white" pupilColor="#2D2D2D" isBlinking={isBlackBlinking} />
                                <EyeBall size={18} pupilSize={7} maxDistance={5} eyeColor="white" pupilColor="#2D2D2D" isBlinking={isBlackBlinking} />
                            </div>
                        </div>

                        {/* Orange front-left (made taller) */}
                        <div
                            ref={orangeRef}
                            className="absolute bottom-0 transition-all duration-700 ease-in-out"
                            style={{
                                left: 0,
                                width: 240,
                                height: 320,
                                zIndex: 3,
                                backgroundColor: '#FF9B6B',
                                borderRadius: '120px 120px 0 0',
                                transform: `skewX(${orangePos.bodySkew || 0}deg)`,
                                transformOrigin: 'bottom center',
                            }}
                        >
                            <div className="absolute flex gap-8 transition-all duration-200 ease-out" style={{ left: 82 + (orangePos.faceX || 0), top: 90 + (orangePos.faceY || 0) }}>
                                <Pupil size={12} maxDistance={6} pupilColor="#2D2D2D" />
                                <Pupil size={12} maxDistance={6} pupilColor="#2D2D2D" />
                            </div>
                        </div>

                        {/* Yellow front-right (made taller) */}
                        <div
                            ref={yellowRef}
                            className="absolute bottom-0 transition-all duration-700 ease-in-out"
                            style={{
                                left: 310,
                                width: 140,
                                height: 360,
                                backgroundColor: '#E8D754',
                                borderRadius: '70px 70px 0 0',
                                zIndex: 4,
                                transform: `skewX(${yellowPos.bodySkew || 0}deg)`,
                                transformOrigin: 'bottom center',
                            }}
                        >
                            <div className="absolute flex gap-6 transition-all duration-200 ease-out" style={{ left: 52 + (yellowPos.faceX || 0), top: 40 + (yellowPos.faceY || 0) }}>
                                <Pupil size={12} maxDistance={6} pupilColor="#2D2D2D" />
                                <Pupil size={12} maxDistance={6} pupilColor="#2D2D2D" />
                            </div>

                            <div className="absolute w-20 h-[4px] bg-[#2D2D2D] rounded-full transition-all duration-200 ease-out" style={{ left: 40 + (yellowPos.faceX || 0), top: 88 + (yellowPos.faceY || 0) }} />
                        </div>

                        {/* decorative subtle blobs */}
                        <div className="absolute top-8 left-24 size-36 rounded-full bg-primary-foreground/10 blur-3xl" />
                        <div className="absolute bottom-20 right-8 size-56 rounded-full bg-primary-foreground/5 blur-3xl" />
                    </div>
                </div>

                <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
            </div>

            {/* Right content */}
            <div className="flex items-center justify-center p-8 bg-background">
                <div className="w-full max-w-[420px]">
                    {/* Logo moved above the form */}
                    <div className="flex items-center justify-center mb-6">
                        <Link href="/">
                            <AppLogo />
                        </Link>
                    </div>

                    <div className="text-center mb-6">
                        <h1 className="text-3xl font-bold tracking-tight mb-2">{title ?? 'Welcome back!'}</h1>
                        <p className="text-muted-foreground text-sm">{description ?? 'Please enter your details'}</p>
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
}
