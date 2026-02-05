import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { copy, productInfo, imageOptions } = req.body;

    if (!copy || !productInfo || !imageOptions) {
      return res.status(400).json({ error: 'copy, productInfo, and imageOptions are required' });
    }

    const styleGuide = {
      realistic: '전문적인 제품 사진, 스튜디오 조명, 선명한 포커스',
      lifestyle: '라이프스타일 사진, 자연광, 감성적인 인테리어',
      illustration: '모던 미니멀 일러스트레이션, 깔끔한 벡터 아트',
      '3d': '3D 렌더링, 부드러운 그림자, 시네마틱 조명',
    };

    const colorGuide = {
      bright: '밝고 생생한 색상, 경쾌한 분위기',
      minimal: '깔끔한 미니멀 감성, 화이트와 파스텔 톤',
      luxury: '고급스러운 감성, 골드 포인트, 다크 톤',
      warm: '따뜻하고 포근한 분위기, 골든아워 조명',
    };

    const prompt = `당신은 광고 이미지 프롬프트 전문가입니다. 다음 광고 카피와 제품 정보를 바탕으로 AI 이미지 생성용 프롬프트를 작성해주세요.

광고 카피:
- 메인: ${copy.main}
- 서브: ${copy.sub}
- CTA: ${copy.cta}

제품 정보:
- 제품명: ${productInfo.name}
- 카테고리: ${productInfo.category}
- 타깃: ${productInfo.targetAge?.join(', ') || '20-30대'} ${productInfo.targetGender === 'female' ? '여성' : productInfo.targetGender === 'male' ? '남성' : '전체'}

이미지 스타일: ${styleGuide[imageOptions.style] || styleGuide.lifestyle}
색상 톤: ${colorGuide[imageOptions.colorTone] || colorGuide.minimal}
이미지 비율: ${imageOptions.size}
텍스트 포함: ${imageOptions.includeText ? '예' : '아니오'}
${imageOptions.includeText ? `텍스트 위치: ${imageOptions.textPosition}` : ''}

프롬프트 작성 규칙:
1. 영어 프롬프트: FLUX/Midjourney에 최적화된 상세한 영어 프롬프트
2. 한국어 설명: 프롬프트 내용을 한국어로 설명
3. 광고 이미지에 적합한 구도와 분위기
4. 제품과 카피의 조화를 고려

JSON 형식으로 응답해주세요:
{
  "english": "영어 프롬프트 (100-150 단어)",
  "korean": "한국어 설명"
}`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        { role: 'user', content: prompt }
      ],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse response');
    }

    const result = JSON.parse(jsonMatch[0]);
    return res.status(200).json(result);

  } catch (error) {
    console.error('Error generating image prompt:', error);
    return res.status(500).json({
      error: 'Failed to generate image prompt',
      message: error.message
    });
  }
}
