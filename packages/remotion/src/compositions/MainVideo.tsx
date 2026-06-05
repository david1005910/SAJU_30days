import React from 'react';
import { Sequence, Audio } from 'remotion';
import { Intro30 } from './Intro30';
import { SceneBlock } from './SceneBlock';
import { FiveElementsChart } from './FiveElementsChart';
import { Outro } from './Outro';

interface Scene {
  id: string;
  type: 'scene' | 'chart';
  duration: number;
  narration: string;
  subtitle: string;
  imageSrc?: string;
  audioSrc?: string;
  chartData?: any;
}

interface MainVideoProps {
  episode: {
    number: number;
    title: string;
    intro: string;
    scenes: Scene[];
  };
}

export const MainVideo: React.FC<MainVideoProps> = ({ episode }) => {
  // Calculate cumulative frame positions
  let currentFrame = 0;
  const sceneFrames: Array<{ scene: Scene; from: number; duration: number }> = [];

  // Intro duration (30 seconds at 30fps)
  const introDuration = 30 * 30;
  currentFrame += introDuration;

  // Process scenes
  episode.scenes.forEach((scene) => {
    const durationInFrames = Math.floor(scene.duration * 30); // Convert seconds to frames
    sceneFrames.push({
      scene,
      from: currentFrame,
      duration: durationInFrames,
    });
    currentFrame += durationInFrames;
  });

  // Outro duration (10 seconds)
  const outroDuration = 10 * 30;

  return (
    <>
      {/* Intro */}
      <Sequence from={0} durationInFrames={introDuration}>
        <Intro30
          title={episode.title}
          hook={episode.intro}
        />
      </Sequence>

      {/* Main scenes */}
      {sceneFrames.map(({ scene, from, duration }) => (
        <Sequence key={scene.id} from={from} durationInFrames={duration}>
          {scene.type === 'chart' ? (
            <FiveElementsChart
              elements={scene.chartData || { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 }}
            />
          ) : (
            <SceneBlock
              imageSrc={scene.imageSrc || '/placeholder.jpg'}
              audioSrc={scene.audioSrc}
              narration={scene.narration}
              subtitle={scene.subtitle}
            />
          )}
        </Sequence>
      ))}

      {/* Outro */}
      <Sequence from={currentFrame} durationInFrames={outroDuration}>
        <Outro
          disclaimer="본 콘텐츠는 교양과 엔터테인먼트 목적입니다"
        />
      </Sequence>

      {/* Background music (optional) */}
      {/* <Audio src="/bgm.mp3" volume={0.1} /> */}
    </>
  );
};