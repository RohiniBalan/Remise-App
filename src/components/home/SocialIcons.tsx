import React from "react";
import Svg, { Path, Rect, Circle } from "react-native-svg";

// Lucide removed all trademarked brand icons (Twitter/X, Instagram, Facebook,
// YouTube, etc.) in v1.0 for legal/trademark reasons — see
// https://lucide.dev/guide/react/migration
// These are small, generic, stroke-style stand-ins (not official logos) so
// the footer doesn't depend on a brand-icon package. Swap in your own SVGs
// or a package like react-native-vector-icons if you need the exact marks.

type IconProps = { size?: number; color?: string };

export function TwitterIcon({ size = 15, color = "#9ca3af" }: IconProps) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path
                d="M4 4l16 16M20 4L4 20"
                stroke={color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}

export function InstagramIcon({ size = 15, color = "#9ca3af" }: IconProps) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Rect x={3} y={3} width={18} height={18} rx={5} stroke={color} strokeWidth={2} />
            <Circle cx={12} cy={12} r={4} stroke={color} strokeWidth={2} />
            <Circle cx={17.5} cy={6.5} r={1} fill={color} />
        </Svg>
    );
}

export function FacebookIcon({ size = 15, color = "#9ca3af" }: IconProps) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path
                d="M15 4h-2a4 4 0 0 0-4 4v3H7v4h2v7h4v-7h2.5l.5-4H13V8a1 1 0 0 1 1-1h1V4z"
                stroke={color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}

export function YoutubeIcon({ size = 15, color = "#9ca3af" }: IconProps) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Rect x={2} y={5} width={20} height={14} rx={4} stroke={color} strokeWidth={2} />
            <Path d="M10 9l5 3-5 3V9z" fill={color} stroke={color} strokeWidth={1} strokeLinejoin="round" />
        </Svg>
    );
}