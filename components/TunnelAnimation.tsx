import React from 'react';

const TunnelAnimation: React.FC = () => {
  // Generate the CSS for the loop of walls dynamically
  const generateWallStyles = () => {
    let styles = "";
    const walls = 6;
    let surfaceIndex = 0;

    for (let i = 1; i <= walls; i++) {
      const index = i - 3;
      surfaceIndex++; // first child

      // Styles for the wall and its specific children indices
      styles += `
        .ta-wall:nth-of-type(${i}) {
          transform: translateZ(calc(var(--wall-gap) * ${index - 1}));
          --index: ${i};
        }
        .ta-wall:nth-of-type(${i}) .ta-surface:nth-child(1),
        .ta-wall:nth-of-type(${i}) .ta-top {
          --index: ${surfaceIndex};
        }
        .ta-wall:nth-of-type(${i}) .ta-surface:nth-child(2) {
          --index: ${surfaceIndex + 1};
        }
      `;
      surfaceIndex++; // second child
    }
    return styles;
  };

  return (
    <div className="ta-wrapper">
      <div className="ta-container">
        {[...Array(6)].map((_, i) => (
            <div className="ta-wall" key={i}>
                <div className="ta-surface"></div>
                <div className="ta-surface"></div>
                <div className="ta-left"></div>
                <div className="ta-top"></div>
            </div>
        ))}
        <div className="ta-ball-container">
            <div className="ta-ball"></div>
        </div>
      </div>
      
      <style>{`
        /* @property is supported in modern browsers (Chrome/Edge/Safari/FF) */
        @property --angle {
          syntax: "<angle>";
          inherits: true;
          initial-value: 0deg;
        }

        @property --circle-diameter {
          syntax: "<length>";
          inherits: true;
          initial-value: 0;
        }

        .ta-wrapper {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .ta-container {
          /* 
             Converted vmin to px based on a 200px reference size 
             and scaled down via transform to fit parent 
          */
          --base-size: 200px; 
          
          /* Strict Black Lines Palette */
          --c1: #000000;
          --c2: #000000;
          --c3: #000000;
          --c4: #000000;
          
          --animation-duration: 2.8s;
          
          /* Scaled values (relative to 200px base) */
          --border-width: 2px;   /* Defined solid border width */
          --wall-gap: 40px;      /* 10vmin -> 20% of 200 */
          --hole-radius: 88px;   /* 22vmin -> 44% of 200 */
          
          --glow: none; 
          --hole-pos-y: 20%;
          --offset-per-surface: calc(360deg / 24);

          position: relative;
          width: var(--base-size);
          aspect-ratio: 1/1.2;
          --angle: 30deg;
          animation: ta-angle var(--animation-duration) linear infinite;
          transform-style: preserve-3d;
          
          /* Isometric transform applied ONLY here */
          /* translateY(-30px) pulls the whole 3D object up to prevent overlapping text below */
          transform: rotateX(-45deg) rotateY(45deg) scale(0.65) translateY(-30px); 
        }

        .ta-wall {
          position: absolute;
          inset: 0;
        }

        .ta-surface {
          position: absolute;
          inset: 0;
          --angle-offset: calc(var(--index) * var(--offset-per-surface));
          
          /* Trig functions support required */
          --circle-diameter: calc(
            var(--hole-radius) * cos(calc(var(--angle) + var(--angle-offset)))
          );
          
          -webkit-mask: radial-gradient(
            circle at 50% var(--hole-pos-y),
            transparent var(--circle-diameter),
            black var(--circle-diameter)
          );
          mask: radial-gradient(
            circle at 50% var(--hole-pos-y),
            transparent var(--circle-diameter),
            black var(--circle-diameter)
          );
          
          -webkit-mask-repeat: no-repeat;
          mask-repeat: no-repeat;
          -webkit-mask-size: 100% 100%;
          mask-size: 100% 100%;
          -webkit-mask-position: 0 0;
          mask-position: 0 0;
          
          background: radial-gradient(
              circle at 50% var(--hole-pos-y),
              var(--c4) calc(var(--circle-diameter) + var(--border-width)),
              var(--c4) calc(var(--circle-diameter) + var(--border-width)),
              transparent var(--circle-diameter)
            ),
            linear-gradient(#EAEAEA, #EAEAEA), /* Matches Footer Background */
            linear-gradient(
              45deg,
              var(--c1),
              var(--c3),
              var(--c2),
              var(--c1),
              var(--c4),
              var(--c3),
              var(--c2)
            );
          background-repeat: no-repeat;
          background-size: 100% 100%,
            calc(100% - var(--border-width) * 2) calc(100% - var(--border-width) * 2),
            100%, 100%;
          background-position: 0 0, var(--border-width) var(--border-width), 0 0;
        }

        .ta-surface:nth-child(2) {
          --circle-diameter: calc(
            var(--hole-radius) * cos(calc(var(--angle) + var(--angle-offset)))
          );
          transform: translate(16px, 22.8px); /* scaled vmin offsets */
        }

        .ta-left {
          position: absolute;
          transform: skewY(55deg) translateY(11.6px); /* 2.9vmin */
          inset: 0;
          width: 18px; /* 4.5vmin */
          background: linear-gradient(#EAEAEA, #EAEAEA) no-repeat,
            linear-gradient(to top, var(--c1), var(--c3), var(--c2), var(--c1))
              no-repeat;
          background-size: calc(100% - var(--border-width) * 2)
              calc(100% - var(--border-width) * 2),
            100%, 100%;
          background-position: var(--border-width) var(--border-width), 0 0;
        }

        .ta-top {
          position: absolute;
          transform: skewX(36deg) translateX(8px); /* 2vmin */
          inset: 0;
          height: 24px; /* 6vmin */
          background: linear-gradient(#EAEAEA, #EAEAEA) no-repeat,
            linear-gradient(to right, var(--c1), var(--c3), var(--c2), var(--c1))
              no-repeat;
          background-size: calc(100% - var(--border-width) * 2)
              calc(100% - var(--border-width) * 2),
            100%, 100%;
          background-position: var(--border-width) var(--border-width), 0 0;
          --angle-offset: calc(var(--index) * var(--offset-per-surface));
          --circle-diameter: calc(
            var(--hole-radius) * cos(calc(var(--angle) + var(--angle-offset)))
          );
          -webkit-mask: radial-gradient(
            calc(var(--circle-diameter) * 0.86) at 50%
              calc(60% / cos(calc(var(--angle) + var(--angle-offset)))),
            transparent var(--circle-diameter),
            black var(--circle-diameter)
          );
          mask: radial-gradient(
            calc(var(--circle-diameter) * 0.86) at 50%
              calc(60% / cos(calc(var(--angle) + var(--angle-offset)))),
            transparent var(--circle-diameter),
            black var(--circle-diameter)
          );
          -webkit-mask-repeat: no-repeat;
          mask-repeat: no-repeat;
          -webkit-mask-size: 100% 100%;
          mask-size: 100% 100%;
          -webkit-mask-position: 0 0;
          mask-position: 0 0;
        }

        @keyframes ta-angle {
          from {
            --angle: 360deg;
          }
          to {
            --angle: 0deg;
          }
        }

        .ta-ball-container {
          display: grid;
          place-items: center;
          position: absolute;
          inset: 0;
          transform: translateZ(-240px); /* -60vmin */
          animation: ta-ball-container var(--animation-duration) linear infinite;
        }

        .ta-ball {
          width: 168px; /* 42vmin */
          aspect-ratio: 1;
          border-radius: 50%;
          /* 
             Black Sphere: 
             A simple radial gradient gives it a 3D ball look without strange colors.
          */
          background: radial-gradient(
              circle at 30% 30%,
              #444444 0%,
              #000000 60%
          );
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
          transform: rotateX(45deg) rotateY(45deg) translateY(-80px); /* -20vmin */
        }

        @keyframes ta-ball-container {
          from {
            transform: translateZ(-160px); /* -40vmin */
            opacity: 0;
          }
          10% {
            transform: translateZ(-100px); /* -25vmin */
            opacity: 1;
          }

          85% {
            opacity: 1;
          }
          to {
            opacity: 0;
            transform: translateZ(280px); /* 70vmin */
          }
        }

        /* Inject Generated Loop Styles */
        ${generateWallStyles()}
      `}</style>
    </div>
  );
};

export default TunnelAnimation;
