import { PrismaClient } from '@prisma/client';
import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Load curriculum
  const curriculumPath = path.join(__dirname, '../../curriculum/30day.yaml');
  const curriculumData = yaml.load(fs.readFileSync(curriculumPath, 'utf8')) as any;

  // Clear existing data
  await prisma.curriculum.deleteMany();
  console.log('✅ Cleared existing curriculum data');

  // Insert curriculum
  for (const episode of curriculumData.episodes) {
    await prisma.curriculum.create({
      data: {
        number: episode.day,
        goal: episode.goal,
        keywords: episode.keywords,
        exampleBirth: episode.example_birth || null,
        planDate: new Date(`2024-01-${String(episode.day).padStart(2, '0')}T09:00:00`)
      }
    });
  }
  console.log(`✅ Inserted ${curriculumData.episodes.length} curriculum days`);

  // Create sample episodes for testing
  const sampleEpisodes = [
    {
      number: 1,
      title: '사주가 엔지니어링이 될 수 있을까?',
      status: 'PUBLISHED' as const,
      goal: '채널 소개, 사주를 데이터로 보는 관점 제시',
      scheduledFor: new Date('2024-01-01T09:00:00'),
    },
    {
      number: 2,
      title: '천간지지, 우주의 좌표계',
      status: 'REVIEW' as const,
      goal: '천간 10개, 지지 12개의 구조적 이해',
      scheduledFor: new Date('2024-01-02T09:00:00'),
    },
    {
      number: 3,
      title: '오행의 균형방정식',
      status: 'RUNNING' as const,
      goal: '목화토금수 5원소의 상생상극 관계',
      scheduledFor: new Date('2024-01-03T09:00:00'),
    },
  ];

  for (const episodeData of sampleEpisodes) {
    const episode = await prisma.episode.create({
      data: episodeData
    });

    // Add sample Saju chart for episode 1
    if (episode.number === 1) {
      await prisma.sajuChart.create({
        data: {
          episodeId: episode.id,
          birthInput: {
            datetime: '1990-05-15T14:30:00',
            is_lunar: false,
            sex: 'M',
            time_known: true
          },
          pillars: {
            year: ['庚', '午'],
            month: ['辛', '巳'],
            day: ['甲', '子'],
            hour: ['辛', '未']
          },
          dayMaster: '甲',
          fiveElements: { 목: 1, 화: 2, 토: 1, 금: 3, 수: 1 },
          tenGods: {
            year_gan: '편관',
            month_gan: '정관',
            hour_gan: '정관'
          },
          luckPillars: {
            direction: '순행',
            start_age: 7,
            sequence: [
              ['壬', '午'], ['癸', '未'], ['甲', '申'], ['乙', '酉'],
              ['丙', '戌'], ['丁', '亥'], ['戊', '子'], ['己', '丑']
            ]
          },
          verifyHash: 'sample_hash_' + Date.now()
        }
      });

      // Add sample script
      await prisma.script.create({
        data: {
          episodeId: episode.id,
          intro: '사주를 미신이 아닌 데이터로 볼 수 있다면 어떨까요? 전직 OLED CTO가 명리학을 공학적 관점으로 풀어봅니다.',
          body: [
            {
              title: '사주란 무엇인가',
              narration: '사주는 태어난 년월일시를 천간과 지지로 표현한 8글자입니다.',
              onscreen_text: '사주 = 년월일시 × 천간지지',
              infographic: 'text_overlay'
            },
            {
              title: '데이터로서의 사주',
              narration: '8글자는 단순한 문자가 아니라 시간과 공간의 좌표계입니다.',
              onscreen_text: '좌표계 = 시간 + 공간',
              infographic: null
            }
          ],
          meta: {
            titles: [
              '사주가 엔지니어링이 될 수 있을까?',
              '전직 CTO가 풀어보는 사주 이야기',
              '데이터로 보는 사주명리학'
            ],
            description: '사주공학 채널 소개. 전통 명리학을 현대적 데이터 관점으로 재해석합니다.',
            tags: ['사주', '명리학', '데이터분석', '동양철학', '사주공학'],
            thumbnail_text: '사주 = 데이터?'
          },
          model: 'claude-3-sonnet-20240229',
          temperature: 0.7,
          promptTokens: 1500,
          outputTokens: 800,
          validated: true
        }
      });

      // Add sample costs
      await prisma.costLog.create({
        data: {
          episodeId: episode.id,
          stage: 'interpret',
          item: 'claude_tokens',
          quantity: 2300,
          unitCost: 0.00005,
          amount: 0.115,
          currency: 'USD'
        }
      });
    }
  }

  console.log(`✅ Created ${sampleEpisodes.length} sample episodes`);
  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });