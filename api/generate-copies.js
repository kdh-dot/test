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
    const { productInfo, sellingPoint, options, count = 10 } = req.body;

    if (!productInfo || !sellingPoint) {
      return res.status(400).json({ error: 'productInfo and sellingPoint are required' });
    }

    const toneGuide = {
      friendly: '친근하고 편안한 반말 톤, 20-30대가 공감할 수 있는 표현',
      professional: '세련되고 신뢰감 있는 존댓말, 격식 있는 표현',
      expert: '전문적이고 권위 있는 톤, 데이터와 근거 중심',
      humorous: '유머러스하고 위트 있는 톤, 재미있는 표현',
    };

    const prompt = `당신은 퍼포먼스 광고 카피라이터입니다. 다음 조건에 맞는 광고 카피 ${count}개를 생성해주세요.

제품 정보:
- 제품명: ${productInfo.name}
- 카테고리: ${productInfo.category}
- 판매가: ${productInfo.salePrice?.toLocaleString()}원
- 정상가: ${productInfo.originalPrice?.toLocaleString()}원
- 타깃: ${productInfo.targetAge?.join(', ') || '전체'} ${productInfo.targetGender === 'female' ? '여성' : productInfo.targetGender === 'male' ? '남성' : '전체'}
- 특징: ${productInfo.features?.join(', ') || '없음'}

소구점: ${sellingPoint.title}
설명: ${sellingPoint.description}

톤앤매너: ${toneGuide[options?.tone] || toneGuide.professional}
플랫폼: ${options?.platforms?.join(', ') || '메타, 구글'}
${options?.requiredKeywords?.length ? `필수 키워드: ${options.requiredKeywords.join(', ')}` : ''}
${options?.forbiddenKeywords?.length ? `금지 키워드: ${options.forbiddenKeywords.join(', ')}` : ''}

카피 작성 규칙:
1. 메인카피: 20자 내외, 강렬한 후킹 메시지
2. 서브카피: 15자 내외, 구체적 가치 전달
3. CTA: FOMO 요소 또는 프로모션 포함
4. 각 카피는 서로 다른 스타일과 접근법 사용
5. 타깃 연령대에 맞는 언어와 표현 사용

JSON 형식으로 응답해주세요:
{
  "copies": [
    {
      "main": "메인카피",
      "sub": "서브카피",
      "cta": "CTA 문구",
      "hookScore": 4.5,
      "clarityScore": 4.0
    }
  ]
}`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
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
    console.error('Error generating copies:', error);
    return res.status(500).json({
      error: 'Failed to generate copies',
      message: error.message
    });
  }
}
