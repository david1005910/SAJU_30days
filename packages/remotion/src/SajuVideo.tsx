import { Composition } from 'remotion';
import { Intro30 } from './compositions/Intro30';
import { SceneBlock } from './compositions/SceneBlock';
import { FiveElementsChart } from './compositions/FiveElementsChart';
import { Outro } from './compositions/Outro';
import { MainVideo } from './compositions/MainVideo';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="SajuVideo"
        component={MainVideo}
        durationInFrames={30 * 60 * 8} // 8 minutes at 30fps
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          episode: {
            number: 1,
            title: "사주가 엔지니어링이 될 수 있을까?",
            intro: "사주를 미신이 아닌 데이터로 볼 수 있다면?",
            scenes: []
          }
        }}
      />
      
      <Composition
        id="Intro30"
        component={Intro30}
        durationInFrames={30 * 30} // 30 seconds
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: "사주가 엔지니어링이 될 수 있을까?",
          hook: "사주를 미신이 아닌 데이터로 볼 수 있다면?"
        }}
      />
      
      <Composition
        id="SceneBlock"
        component={SceneBlock}
        durationInFrames={30 * 60} // 1 minute
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          imageSrc: "/sample-image.jpg",
          narration: "나레이션 텍스트",
          subtitle: "자막 텍스트"
        }}
      />
      
      <Composition
        id="FiveElementsChart"
        component={FiveElementsChart}
        durationInFrames={30 * 10} // 10 seconds
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          elements: {
            목: 2,
            화: 1,
            토: 2,
            금: 2,
            수: 1
          }
        }}
      />
      
      <Composition
        id="Outro"
        component={Outro}
        durationInFrames={30 * 10} // 10 seconds
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          disclaimer: "본 콘텐츠는 교양과 엔터테인먼트 목적입니다"
        }}
      />
    </>
  );
};