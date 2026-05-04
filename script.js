*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: radial-gradient(ellipse at 50% 35%, #1a0a2e 0%, #08050f 45%, #04030a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: monospace;
}

#root {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

#game-wrapper {
  position: relative;
  display: inline-block;
  line-height: 0;
}

/* Gold corner brackets — top-left and top-right via wrapper */
#game-wrapper::before,
#game-wrapper::after {
  content: '';
  position: absolute;
  width: 28px;
  height: 28px;
  z-index: 20;
  pointer-events: none;
}

#game-wrapper::before {
  top: -3px;
  left: -3px;
  border-top: 3px solid #c8952a;
  border-left: 3px solid #c8952a;
}

#game-wrapper::after {
  top: -3px;
  right: -3px;
  border-top: 3px solid #c8952a;
  border-right: 3px solid #c8952a;
}

/* Bottom corners via #game pseudo-elements */
#game::before,
#game::after {
  content: '';
  position: absolute;
  width: 28px;
  height: 28px;
  z-index: 20;
  pointer-events: none;
}

#game::before {
  bottom: -3px;
  left: -3px;
  border-bottom: 3px solid #c8952a;
  border-left: 3px solid #c8952a;
}

#game::after {
  bottom: -3px;
  right: -3px;
  border-bottom: 3px solid #c8952a;
  border-right: 3px solid #c8952a;
}

#game {
  position: relative;
  display: block;
  line-height: 0;
}

/* Canvas glow breathing animation */
#game canvas {
  display: block;
  animation: canvasGlow 4s ease-in-out infinite alternate;
}

@keyframes canvasGlow {
  0%   { box-shadow: 0 0 16px 3px rgba(200,149,42,0.15), 0 0 40px 10px rgba(100,30,160,0.08); }
  50%  { box-shadow: 0 0 28px 7px rgba(200,149,42,0.26), 0 0 65px 18px rgba(100,30,160,0.16); }
  100% { box-shadow: 0 0 16px 3px rgba(200,149,42,0.15), 0 0 40px 10px rgba(100,30,160,0.08); }
}

/* Subtle scanline overlay */
#game-wrapper::before {
  /* override above with scanlines + top-left corner combined */
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background:
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0,0,0,0.025) 2px,
      rgba(0,0,0,0.025) 4px
    );
  pointer-events: none;
  z-index: 15;
  /* keep corner bracket */
  border-top: 3px solid #c8952a;
  border-left: 3px solid #c8952a;
}

/* Touch/tap optimisations */
canvas {
  touch-action: none;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}
