import React from 'react';

const SphereAnimation: React.FC = () => {
  // We generate the styles dynamically to handle the math for the 21 rings
  // adapting the original 'vmin' units to pixels relative to a 100px sphere.
  // Original: 50vmin sphere. We want approx 100px.
  // Ratio: 1vmin ~= 2px in our relative scale.
  // Step was 2.5vmin -> 5px.
  
  const rings = Array.from({ length: 21 }, (_, i) => i);
  
  const generateRingStyles = () => {
    let styles = "";
    const totalRings = 21;
    const centerIndex = 10; // The 11th item (index 10) is the center (0 transform)
    const stepPx = 6; // Distance between rings
    const startTranslate = 58; // approx 24.5vmin scaled

    rings.forEach((i) => {
      // Calculate translateZ based on distance from center
      // The sequence in original CSS goes from 24.5vmin down to -24.5vmin
      // We map index 0 -> 24.5 equivalent, index 20 -> -24.5 equivalent
      
      const distanceFactor = 10 - i; // 10, 9, ... 0 ... -10
      // Original logic was slightly irregular at the ends, but linear mostly.
      // We will use a calculated curve to create a perfect sphere shape.
      
      // However, to stick EXACTLY to the user's code logic:
      // index 0: 24.5vmin
      // index 1: 22.5vmin (diff 2.0)
      // index 2: 20vmin (diff 2.5)
      // index 3: 17.5vmin (diff 2.5) ...
      
      // Let's implement the specific manual overrides from the original CSS
      // scaled to pixels (multiplying vmin values by ~2.4 to fit 120px container)
      
      let transZ = 0;
      let size = 100; // percent
      
      // Mapping roughly to the provided CSS logic
      if (i === 0) { transZ = 58; size = 23; }
      else if (i === 1) { transZ = 54; size = 43; }
      else if (i === 2) { transZ = 48; size = 60; }
      else if (i === 3) { transZ = 42; size = 71; }
      else if (i === 4) { transZ = 36; size = 80; }
      else if (i === 5) { transZ = 30; size = 86; }
      else if (i === 6) { transZ = 24; size = 91; }
      else if (i === 7) { transZ = 18; size = 95; }
      else if (i === 8) { transZ = 12; size = 97; }
      else if (i === 9) { transZ = 6; size = 99; }
      else if (i === 10) { transZ = 0; size = 100; }
      else if (i === 11) { transZ = -6; size = 99; }
      else if (i === 12) { transZ = -12; size = 97; }
      else if (i === 13) { transZ = -18; size = 95; }
      else if (i === 14) { transZ = -24; size = 91; }
      else if (i === 15) { transZ = -30; size = 86; }
      else if (i === 16) { transZ = -36; size = 80; }
      else if (i === 17) { transZ = -42; size = 71; }
      else if (i === 18) { transZ = -48; size = 60; }
      else if (i === 19) { transZ = -54; size = 43; }
      else if (i === 20) { transZ = -58; size = 23; }

      const delay = (2 / 40) * -(i + 1); // --dl calculation approx

      styles += `
        .sphere div:nth-child(${i + 1}) {
          transform: rotateX(90deg) translateZ(${transZ}px);
          width: ${size}%;
          height: ${size}%;
          animation-delay: ${delay}s;
        }
      `;
    });
    return styles;
  };

  return (
    <div className="sphere-wrapper">
      <div className="sphere">
        {rings.map((i) => (
          <div key={i}></div>
        ))}
      </div>
      <style>{`
        .sphere-wrapper {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          perspective: 600px;
          background: transparent;
        }

        .sphere {
          width: 120px;
          height: 120px;
          position: relative;
          transform-style: preserve-3d;
          animation: spin 5s linear 0s infinite;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sphere:hover {
          animation-play-state: paused;
        }

        @keyframes spin {
          0% { transform: rotateX(-210deg) rotateY(0deg) rotatez(185deg); }
          100% { transform: rotateX(-210deg) rotateY(360deg) rotatez(185deg); }
        }

        .sphere div {
          position: absolute;
          border: 1px solid #000; /* Black Lines */
          border-radius: 100%;
          /* Removed internal box-shadow for cleaner line look, or kept minimal */
          box-shadow: 0 0 1px 0px rgba(0,0,0,0.1); 
          animation: shine 2s linear infinite;
          background: transparent;
        }

        @keyframes shine {
          50%, 100% {
             border-color: rgba(0,0,0,0); /* Fade to transparent */
          }
        }

        /* Specific ring styles generated above */
        ${generateRingStyles()}
      `}</style>
    </div>
  );
};

export default SphereAnimation;
