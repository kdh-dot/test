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
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // 여러 CORS 프록시 시도
    const proxyUrls = [
      `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
      `https://corsproxy.io/?${encodeURIComponent(url)}`,
    ];

    let html = null;
    let fetchError = null;

    for (const proxyUrl of proxyUrls) {
      try {
        const response = await fetch(proxyUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        if (response.ok) {
          html = await response.text();
          break;
        }
      } catch (e) {
        fetchError = e;
        continue;
      }
    }

    if (!html) {
      throw new Error('웹페이지를 가져올 수 없습니다: ' + (fetchError?.message || 'Unknown error'));
    }

    // HTML에서 불필요한 태그 제거하고 텍스트 추출
    const cleanHtml = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .substring(0, 15000); // Claude API 토큰 제한 고려

    // 가격 패턴 추출
    const priceMatches = html.match(/[\d,]+\s*원/g) || [];
    const pricesText = priceMatches.slice(0, 10).join(', ');

    // og:title, og:description 추출
    const ogTitleMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"[^>]*>/i);
    const ogDescMatch = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]*)"[^>]*>/i);
    const titleMatch = html.match(/<title>([^<]*)<\/title>/i);

    const metaInfo = {
      ogTitle: ogTitleMatch ? ogTitleMatch[1] : '',
      ogDesc: ogDescMatch ? ogDescMatch[1] : '',
      title: titleMatch ? titleMatch[1] : '',
    };

    const prompt = `당신은 랜딩페이지 분석 전문가입니다. 다음 웹페이지 내용을 분석하여 광고 카피 작성에 필요한 제품 정보를 추출해주세요.

URL: ${url}

메타 정보:
- OG Title: ${metaInfo.ogTitle}
- OG Description: ${metaInfo.ogDesc}
- Page Title: ${metaInfo.title}

발견된 가격 정보: ${pricesText || '없음'}

페이지 텍스트 내용:
${cleanHtml}

위 정보를 바탕으로 다음 JSON 형식으로 제품 정보를 추출해주세요:

{
  "name": "제품명 (반드시 실제 제품명을 추출)",
  "category": "카테고리 (뷰티/스킨케어, 헬스/건강식품, 식품/음료, 패션/의류, 디지털/가전, 생활용품, 기타 중 하나)",
  "salePrice": 할인가격(숫자만, 없으면 0),
  "originalPrice": 정가(숫자만, 없으면 0),
  "targetAge": ["20대", "30대"] 형태의 배열 (10대, 20대, 30대, 40대, 50대, 60대 이상 중 선택),
  "targetGender": "female" 또는 "male" 또는 "all",
  "features": ["특징1", "특징2", "특징3"] 형태의 배열 (최대 5개, 페이지에서 발견한 제품의 실제 특징/장점),
  "promotion": "진행 중인 프로모션 내용 (없으면 빈 문자열)"
}

중요:
1. 반드시 실제 페이지에서 찾은 정보만 사용하세요
2. 추측하지 말고 페이지에 명시된 정보를 추출하세요
3. 제품명은 반드시 실제 제품명을 사용하세요
4. features는 "~기능", "~효과" 등 구체적인 제품 특징을 추출하세요`;

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
      throw new Error('응답에서 JSON을 파싱할 수 없습니다');
    }

    const productInfo = JSON.parse(jsonMatch[0]);

    // 기본값 보정
    productInfo.customSellingPoints = [];
    if (!productInfo.targetAge || productInfo.targetAge.length === 0) {
      productInfo.targetAge = ['20대', '30대'];
    }
    if (!productInfo.features || productInfo.features.length === 0) {
      productInfo.features = ['제품 특징을 직접 입력해주세요'];
    }

    return res.status(200).json(productInfo);

  } catch (error) {
    console.error('Error analyzing URL:', error);
    return res.status(500).json({
      error: 'URL 분석에 실패했습니다',
      message: error.message
    });
  }
}
