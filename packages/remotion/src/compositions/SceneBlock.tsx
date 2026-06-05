import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
} from 'remotion';

interface SceneBlockProps {
  imageSrc: string;
  audioSrc?: string;
  narration: string;
  subtitle: string;
  kenBurnsEffect?: boolean;
}

export const SceneBlock: React.FC<SceneBlockProps> = ({
  imageSrc,
  audioSrc,
  narration,
  subtitle,
  kenBurnsEffect = true,
}) => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  // Ken Burns effect (slow zoom)
  const scale = kenBurnsEffect
    ? interpolate(frame, [0, durationInFrames], [1, 1.1], {
        extrapolateRight: 'clamp',
      })
    : 1;

  // Subtitle fade in/out
  const subtitleOpacity = interpolate(
    frame,
    [5, 15, durationInFrames - 15, durationInFrames - 5],
    [0, 1, 1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  return (
    <AbsoluteFill>
      {/* Background image with Ken Burns effect */}
      <AbsoluteFill
        style={{
          transform: `scale(${scale})`,
        }}
      >
        <Img
          src={imageSrc}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        
        {/* Dark overlay for text readability */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%)',
          }}
        />
      </AbsoluteFill>

      {/* Audio narration */}
      {audioSrc && <Audio src={audioSrc} />}

      {/* Subtitle container */}
      <div
        style={{
          position: 'absolute',
          bottom: 100,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          padding: '0 60px',
          opacity: subtitleOpacity,
        }}
      >
        <div
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: '20px 40px',
            borderRadius: 10,
            maxWidth: '80%',
          }}
        >
          <p
            style={{
              color: '#ffffff',
              fontSize: 42,
              fontWeight: 500,
              fontFamily: 'Noto Sans KR',
              lineHeight: 1.5,
              textAlign: 'center',
              margin: 0,
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            }}
          >
            {subtitle}
          </p>
        </div>
      </div>

      {/* Optional narration text overlay */}
      {narration && (
        <div
          style={{
            position: 'absolute',
            top: 60,
            left: 60,
            right: 60,
            opacity: 0.8,
          }}
        >
          <p
            style={{
              color: '#f5e6d3',
              fontSize: 24,
              fontWeight: 300,
              fontFamily: 'Noto Sans KR',
              lineHeight: 1.6,
              maxWidth: '60%',
            }}
          >
            {narration}
          </p>
        </div>
      )}
    </AbsoluteFill>
  );
};