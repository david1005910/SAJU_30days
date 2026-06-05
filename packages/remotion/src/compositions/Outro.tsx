import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

interface OutroProps {
  disclaimer: string;
  channelName?: string;
  subscribeText?: string;
}

export const Outro: React.FC<OutroProps> = ({
  disclaimer,
  channelName = '사주공학',
  subscribeText = '구독과 좋아요는 큰 힘이 됩니다',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animation timings
  const logoScale = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    durationInFrames: 30,
  });

  const textOpacity = interpolate(frame, [20, 40], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const subscribeOpacity = interpolate(frame, [40, 60], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const disclaimerOpacity = interpolate(frame, [60, 80], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#1a0f0a' }}>
      {/* Background pattern */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at center, #2d1810 0%, #1a0f0a 100%)',
          opacity: 0.9,
        }}
      />

      {/* Channel logo/name */}
      <div
        style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: `translate(-50%, -50%) scale(${logoScale})`,
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: '#d4a574',
            fontFamily: 'Noto Serif KR',
            letterSpacing: '0.1em',
            marginBottom: 20,
            textShadow: '3px 3px 6px rgba(0,0,0,0.5)',
          }}
        >
          {channelName}
        </h1>
        
        <div
          style={{
            width: 200,
            height: 3,
            backgroundColor: '#d4a574',
            margin: '0 auto',
            opacity: textOpacity,
          }}
        />
      </div>

      {/* Subscribe CTA */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: subscribeOpacity,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 20,
            padding: '20px 40px',
            backgroundColor: 'rgba(212, 165, 116, 0.1)',
            border: '2px solid #d4a574',
            borderRadius: 50,
          }}
        >
          <span
            style={{
              fontSize: 36,
              color: '#f5e6d3',
              fontFamily: 'Noto Sans KR',
              fontWeight: 500,
            }}
          >
            {subscribeText}
          </span>
        </div>

        <div
          style={{
            marginTop: 30,
            display: 'flex',
            justifyContent: 'center',
            gap: 40,
          }}
        >
          {/* Subscribe button */}
          <div
            style={{
              padding: '12px 30px',
              backgroundColor: '#ff0000',
              borderRadius: 25,
              cursor: 'pointer',
            }}
          >
            <span
              style={{
                color: '#ffffff',
                fontSize: 20,
                fontWeight: 600,
                fontFamily: 'Noto Sans KR',
              }}
            >
              구독
            </span>
          </div>

          {/* Like button */}
          <div
            style={{
              padding: '12px 30px',
              backgroundColor: 'transparent',
              border: '2px solid #d4a574',
              borderRadius: 25,
              cursor: 'pointer',
            }}
          >
            <span
              style={{
                color: '#d4a574',
                fontSize: 20,
                fontWeight: 600,
                fontFamily: 'Noto Sans KR',
              }}
            >
              👍 좋아요
            </span>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div
        style={{
          position: 'absolute',
          bottom: 60,
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          opacity: disclaimerOpacity,
          width: '80%',
        }}
      >
        <p
          style={{
            fontSize: 18,
            color: '#999',
            fontFamily: 'Noto Sans KR',
            lineHeight: 1.5,
          }}
        >
          {disclaimer}
        </p>
        
        <p
          style={{
            fontSize: 14,
            color: '#666',
            fontFamily: 'Noto Sans KR',
            marginTop: 10,
          }}
        >
          © 2024 사주공학. 데이터로 풀어보는 명리학
        </p>
      </div>
    </AbsoluteFill>
  );
};