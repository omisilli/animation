"use client";

import { useEffect } from "react";
import { initAnimation } from "@plusguard/animation";
import "@plusguard/animation/index.css";

/* Mount once, high in the tree. Elements rendered later — on another
   route, after a fetch — are picked up on their own. */
export function Animation() {
    useEffect(() => initAnimation(), []);
    return null;
}

/* A staggered list, and a heading that replays every time it comes back. */
export function Example() {
    const items = ["Design", "Build", "Ship"];

    return (
        <>
            <Animation />

            <h2 data-pg-animation="fadeUp" data-pg-animation-repeat>
                How it works
            </h2>

            <ul>
                {items.map((item, i) => (
                    <li key={item} data-pg-animation="fadeUp" data-pg-animation-delay={i * 100}>
                        {item}
                    </li>
                ))}
            </ul>
        </>
    );
}
