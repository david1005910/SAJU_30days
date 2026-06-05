import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

interface FiveElementsChartProps {
  elements: {
    목: number;
    화: number;
    토: number;
    금: number;
    수: number;
  };
}

const elementColors = {
  목: '#2d7a2d', // Green for Wood
  화: '#d32f2f', // Red for Fire
  토: '#8d6e63', // Brown for Earth
  금: '#757575', // Gray for Metal
  수: '#1976d2', // Blue for Water
};

const elementIcons = {
  목: '🌲',
  화: '🔥',
  토: '⛰️',
  금: '⚙️',
  수: '💧',
};

export const FiveElementsChart: React.FC<FiveElementsChartProps> = ({ elements }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const maxValue = Math.max(...Object.values(elements));
  const chartEntries = Object.entries(elements);
  
  return (
    <AbsoluteFill style={{ backgroundColor: '#f5f5f5' }}>
      <div
        style={{
          position: 'absolute',
          top: '10%',
          width: '100%',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: '#1a0f0a',
            fontFamily: 'Noto Sans KR',
            marginBottom: 20,
          }}
        >
          오행 분포도
        </h2>
        <p
          style={{
            fontSize: 24,
            color: '#666',
            fontFamily: 'Noto Sans KR',
          }}
        >
          목화토금수의 균형을 한눈에
        </p>
      </div>
      
      <div
        style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80%',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'flex-end',
          height: 400,
        }}
      >
        {chartEntries.map(([element, value], index) => {
          const barHeight = spring({
            frame: frame - index * 5,
            fps,
            from: 0,
            to: (value / maxValue) * 300,
            durationInFrames: 30,
          });
          
          const opacity = interpolate(
            frame,
            [index * 5, index * 5 + 20],
            [0, 1],
            { extrapolateRight: 'clamp' }
          );
          
          return (
            <div
              key={element}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                opacity,
              }}
            >
              <div
                style={{
                  fontSize: 48,
                  marginBottom: 10,
                }}
              >
                {elementIcons[element as keyof typeof elementIcons]}
              </div>
              
              <div
                style={{
                  width: 120,
                  height: barHeight,
                  backgroundColor: elementColors[element as keyof typeof elementColors],
                  borderRadius: '8px 8px 0 0',
                  position: 'relative',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: -40,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: 32,
                    fontWeight: 700,
                    color: elementColors[element as keyof typeof elementColors],
                    fontFamily: 'Noto Sans KR',
                  }}
                >
                  {value}
                </div>
              </div>
              
              <div
                style={{
                  marginTop: 20,
                  fontSize: 36,
                  fontWeight: 500,
                  color: '#333',
                  fontFamily: 'Noto Sans KR',
                }}
              >
                {element}
              </div>
            </div>
          );
        })}
      </div>
      
      <div
        style={{
          position: 'absolute',
          bottom: 60,
          width: '100%',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontSize: 20,
            color: '#999',
            fontFamily: 'Noto Sans KR',
          }}
        >
          총 8개 간지 기준 분석
        </p>
      </div>
    </AbsoluteFill>
  );
};