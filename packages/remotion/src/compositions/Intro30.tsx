import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
} from 'remotion';

interface Intro30Props {
  title: string;
  hook: string;
}

export const Intro30: React.FC<Intro30Props> = ({ title, hook }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  // Spring animations for smooth entrance
  const titleScale = spring({
    frame,
    fps,
    from: 0.8,
    to: 1,
    durationInFrames: 20,
  });
  
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: 'clamp',
  });
  
  const hookOpacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateRight: 'clamp',
  });
  
  const hookTranslateY = interpolate(frame, [30, 50], [30, 0], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#1a0f0a' }}>
      {/* Dark wooden background pattern */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(180deg, #1a0f0a 0%, #2d1810 100%)',
          opacity: 0.9,
        }}
      />
      
      {/* Traditional Korean pattern overlay */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4a574' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Channel identifier */}
      <Sequence from={0} durationInFrames={900}>
        <div
          style={{
            position: 'absolute',
            top: 60,
            left: 80,
            fontSize: 24,
            color: '#d4a574',
            fontFamily: 'Noto Sans KR',
            letterSpacing: '0.2em',
            opacity: 0.8,
          }}
        >
          사주공학
        </div>
      </Sequence>
      
      {/* Main title */}
      <Sequence from={10} durationInFrames={900}>
        <div
          style={{
            position: 'absolute',
            top: '40%',
            left: '50%',
            transform: `translate(-50%, -50%) scale(${titleScale})`,
            opacity: titleOpacity,
            textAlign: 'center',
            width: '80%',
          }}
        >
          <h1
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: '#f5e6d3',
              fontFamily: 'Noto Serif KR',
              lineHeight: 1.3,
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            }}
          >
            {title}
          </h1>
        </div>
      </Sequence>
      
      {/* Hook question */}
      <Sequence from={30} durationInFrames={900}>
        <div
          style={{
            position: 'absolute',
            top: '60%',
            left: '50%',
            transform: `translate(-50%, ${hookTranslateY}px)`,
            opacity: hookOpacity,
            textAlign: 'center',
            width: '70%',
          }}
        >
          <p
            style={{
              fontSize: 36,
              color: '#d4a574',
              fontFamily: 'Noto Sans KR',
              fontWeight: 300,
              lineHeight: 1.5,
            }}
          >
            {hook}
          </p>
        </div>
      </Sequence>
      
      {/* Bottom decorator */}
      <div
        style={{
          position: 'absolute',
          bottom: 60,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 100,
          height: 2,
          backgroundColor: '#d4a574',
          opacity: 0.5,
        }}
      />
    </AbsoluteFill>
  );
};