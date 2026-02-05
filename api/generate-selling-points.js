import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default async function handler(req, res) {
  // CORS 헤더
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
    const { productInfo } = req.body;

    if (!productInfo) {
      return res.status(400).json({ error: 'productInfo is required' });
    }

    const prompt = `당신은 퍼포먼스 마케팅 전문가입니다. 다음 제품 정보를 분석하여 효과적인 광고 소구점 3가지를 추천해주세요.

제품 정보:
- 제품명: ${productInfo.name}
- 카테고리: ${productInfo.category}
- 판매가: ${productInfo.salePrice?.toLocaleString()}원
- 정상가: ${productInfo.originalPrice?.toLocaleString()}원
- 타깃 연령: ${productInfo.targetAge?.join(', ') || '전체'}
- 타깃 성별: ${productInfo.targetGender === 'female' ? '여성' : productInfo.targetGender === 'male' ? '남성' : '전체'}
- 주요 특징: ${productInfo.features?.join(', ') || '없음'}
- 프로모션: ${productInfo.promotion || '없음'}

각 소구점은 다음 형식으로 작성해주세요:
1. 타깃 고객의 명확한 pain point 해결
2. 차별화된 가치 제안
3. 구체적이고 측정 가능한 효과 제시

JSON 형식으로 응답해주세요:
{
  "sellingPoints": [
    {
      "title": "소구점 제목 (10자 이내)",
      "description": "소구점 설명 (30자 이내)"
    }
  ]
}`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        { role: 'user', content: prompt }
      ],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // JSON 추출
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse response');
    }

    const result = JSON.parse(jsonMatch[0]);
    return res.status(200).json(result);

  } catch (error) {
    console.error('Error generating selling points:', error);
    return res.status(500).json({
      error: 'Failed to generate selling points',
      message: error.message
    });
  }
}
