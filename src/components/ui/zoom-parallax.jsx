// zoom-parallax.jsx
// Cinematic zoom-parallax gallery.
// Fixes applied:
//   - Replaced inline ternary class soup with a clean positionMap lookup
//   - sticky container given explicit h-screen (was collapsing in some browsers)
//   - Added will-change:transform on animated divs for GPU compositing hint
//   - z-index layering: background images < foreground images < children overlay
//   - Primary image (index 0) fills viewport edge-to-edge and acts as the base layer

import { useScroll, useTransform, motion } from "framer-motion";
import { useRef } from "react";

/* ─────────────── layout map for the satellite images (index 1–6) ───────── */

const OFFSETS = {
	1: { top: "-30vh", left: "5vw", width: "35vw", height: "30vh" },
	2: { top: "-10vh", left: "-25vw", width: "20vw", height: "45vh" },
	3: { top: "0vh", left: "27.5vw", width: "25vw", height: "25vh" },
	4: { top: "27.5vh", left: "5vw", width: "20vw", height: "25vh" },
	5: { top: "27.5vh", left: "-22.5vw", width: "30vw", height: "25vh" },
	6: { top: "22.5vh", left: "25vw", width: "15vw", height: "15vh" },
};

/* ──────────────────────────── ZoomParallax ─────────────────────────────── */

export function ZoomParallax({ images = [], children }) {
	const container = useRef(null);
	const { scrollYProgress } = useScroll({
		target: container,
		offset: ["start start", "end end"],
	});

	// Each satellite gets a progressively deeper zoom than the base layer
	const scaleFor = (idx) => {
		const maxScale = [10, 5, 6, 5, 6, 8, 9][idx % 7];
		return useTransform(scrollYProgress, [0, 1], [1, maxScale]); // eslint-disable-line react-hooks/rules-of-hooks
	};

	return (
		<div ref={container} className="relative h-[200vh] bg-[#050e12]">
			<div className="sticky top-0 left-0 h-screen w-full overflow-hidden">

				{/* ── base / full-bleed image (index 0) ── */}
				{images[0] && (
					<motion.div
						style={{ scale: scaleFor(0), willChange: "transform" }}
						className="absolute inset-0 z-0"
					>
						<img
							src={images[0].src}
							alt={images[0].alt ?? "Background"}
							className="h-full w-full object-cover"
						/>
					</motion.div>
				)}

				{/* ── satellite images (index 1–N) ── */}
				{images.slice(1).map(({ src, alt }, i) => {
					const idx = i + 1;                         // real position in the map
					const offset = OFFSETS[idx] ?? {};

					return (
						<motion.div
							key={idx}
							style={{ scale: scaleFor(idx), willChange: "transform" }}
							className="absolute inset-0 z-10 flex items-center justify-center"
						>
							<div
								className="relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl"
								style={{
									position: "absolute",
									top: offset.top ?? "0",
									left: offset.left ?? "0",
									width: offset.width ?? "25vw",
									height: offset.height ?? "25vh",
								}}
							>
								<img
									src={src ?? "/placeholder.svg"}
									alt={alt ?? `Emotion image ${idx}`}
									className="h-full w-full object-cover"
								/>
							</div>
						</motion.div>
					);
				})}

				{/* ── overlay children (e.g. text, UI) — always on top ── */}
				{children && (
					<div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center">
						{children}
					</div>
				)}
			</div>
		</div>
	);
}