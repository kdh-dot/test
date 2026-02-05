// API 서비스 레이어
// 환경 변수에 따라 실제 API 또는 로컬 생성 사용

import type { ProductInfo, SellingPoint, GenerationOptions, GeneratedCopy, ImageOptions } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'
const USE_REAL_API = import.meta.env.VITE_USE_REAL_API === 'true'

// API 호출 헬퍼
async function apiCall<T>(endpoint: string, data: object): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'API call failed' }))
    throw new Error(error.message || 'API call failed')
  }

  return response.json()
}

// URL 분석 API
export async function analyzeUrlAPI(url: string): Promise<ProductInfo> {
  if (!USE_REAL_API) {
    // 로컬 분석 (CORS 프록시 사용)
    return analyzeUrlLocal(url)
  }

  try {
    const result = await apiCall<ProductInfo>('/analyze-url', { url })
    return {
      ...result,
      customSellingPoints: result.customSellingPoints || [],
    }
  } catch (error) {
    console.error('URL 분석 API 실패, 로컬 분석으로 전환:', error)
    return analyzeUrlLocal(url)
  }
}

// 로컬 URL 분석 (CORS 프록시 사용)
async function analyzeUrlLocal(url: string): Promise<ProductInfo> {
  try {
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
    const response = await fetch(proxyUrl)

    if (!response.ok) {
      throw new Error('URL을 가져올 수 없습니다.')
    }

    const html = await response.text()

    // 제품명 추출
    const ogTitleMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"[^>]*>/i)
    const h1Match = html.match(/<h1[^>]*>([^<]*)<\/h1>/i)
    const titleMatch = html.match(/<title>([^<]*)<\/title>/i)

    const productName =
      ogTitleMatch?.[1] ||
      h1Match?.[1]?.trim() ||
      titleMatch?.[1]?.split('|')[0]?.split('-')[0]?.trim() ||
      '제품명을 입력해주세요'

    // 가격 추출
    const priceMatches = html.match(/[\d,]+\s*원/g) || []
    const prices = priceMatches
      .map(p => parseInt(p.replace(/[^\d]/g, '')))
      .filter(p => p > 1000 && p < 10000000)
      .sort((a, b) => a - b)

    const uniquePrices = [...new Set(prices)]
    const salePrice = uniquePrices[0] || 0
    const originalPrice = uniquePrices.length > 1 ? uniquePrices[uniquePrices.length - 1] : 0

    // 카테고리 감지
    const category = detectCategoryFromText(productName + ' ' + html.substring(0, 5000))

    // 특징 추출 (OG description 또는 메타 description 사용)
    const ogDescMatch = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]*)"[^>]*>/i)
    const metaDescMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i)
    const description = ogDescMatch?.[1] || metaDescMatch?.[1] || ''

    const features = description
      ? [description.substring(0, 50)]
      : ['제품 특징을 직접 입력해주세요']

    return {
      name: productName.substring(0, 50),
      category,
      salePrice,
      originalPrice,
      targetAge: ['20대', '30대'],
      targetGender: 'all',
      features,
      promotion: '',
      customSellingPoints: [],
    }
  } catch (error) {
    console.error('로컬 URL 분석 오류:', error)
    throw new Error('URL 분석에 실패했습니다. 직접 입력 모드를 사용해 주세요.')
  }
}

function detectCategoryFromText(text: string): string {
  const categories: Record<string, string[]> = {
    '뷰티/스킨케어': ['화장품', '스킨케어', '뷰티', '피부', '세럼', '크림', '에센스', '미백', '주름'],
    '뷰티/디바이스': ['디바이스', '마사지기', '미용기기', 'LED', '갈바닉', '초음파'],
    '헬스/건강식품': ['건강', '비타민', '영양제', '다이어트', '프로틴', '유산균'],
    '식품/음료': ['식품', '음료', '커피', '차', '간식'],
    '패션/의류': ['패션', '의류', '옷', '신발', '가방'],
    '디지털/가전': ['전자', '디지털', '가전', '충전기', '이어폰'],
    '생활용품': ['생활', '주방', '욕실', '청소'],
  }

  const lowerText = text.toLowerCase()
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(k => lowerText.includes(k))) {
      return category
    }
  }
  return '기타'
}

// 소구점 생성
export async function generateSellingPointsAPI(productInfo: ProductInfo): Promise<SellingPoint[]> {
  if (!USE_REAL_API) {
    // 로컬 생성 (기존 로직 사용)
    return generateSellingPointsLocal(productInfo)
  }

  try {
    const result = await apiCall<{ sellingPoints: Array<{ title: string; description: string }> }>(
      '/generate-selling-points',
      { productInfo }
    )

    return result.sellingPoints.map((sp, index) => ({
      id: `sp-${Date.now()}-${index}`,
      title: sp.title,
      description: sp.description,
      copyCount: 10,
    }))
  } catch (error) {
    console.error('API 호출 실패, 로컬 생성으로 전환:', error)
    return generateSellingPointsLocal(productInfo)
  }
}

// 카피 생성
export async function generateCopiesAPI(
  productInfo: ProductInfo,
  sellingPoints: SellingPoint[],
  options: GenerationOptions
): Promise<GeneratedCopy[]> {
  if (!USE_REAL_API) {
    return generateCopiesLocal(productInfo, sellingPoints, options)
  }

  try {
    const allCopies: GeneratedCopy[] = []

    // 각 소구점별로 카피 생성
    for (const sp of sellingPoints) {
      const result = await apiCall<{ copies: Array<{ main: string; sub: string; cta: string; hookScore: number; clarityScore: number }> }>(
        '/generate-copies',
        { productInfo, sellingPoint: sp, options, count: sp.copyCount }
      )

      const copies = result.copies.map((copy, index) => ({
        id: `copy-${Date.now()}-${sp.id}-${index}`,
        sellingPointId: sp.id,
        main: copy.main,
        sub: copy.sub,
        cta: copy.cta,
        hookScore: copy.hookScore,
        clarityScore: copy.clarityScore,
        isFavorite: false,
      }))

      allCopies.push(...copies)
    }

    return allCopies
  } catch (error) {
    console.error('API 호출 실패, 로컬 생성으로 전환:', error)
    return generateCopiesLocal(productInfo, sellingPoints, options)
  }
}

// 이미지 프롬프트 생성
export async function generateImagePromptAPI(
  copy: GeneratedCopy,
  productInfo: ProductInfo,
  imageOptions: ImageOptions
): Promise<{ english: string; korean: string }> {
  if (!USE_REAL_API) {
    return generateImagePromptLocal(copy, productInfo, imageOptions)
  }

  try {
    const result = await apiCall<{ english: string; korean: string }>(
      '/generate-image-prompt',
      { copy, productInfo, imageOptions }
    )
    return result
  } catch (error) {
    console.error('API 호출 실패, 로컬 생성으로 전환:', error)
    return generateImagePromptLocal(copy, productInfo, imageOptions)
  }
}

// ============================================
// 로컬 생성 함수들 (API 실패 시 폴백)
// ============================================

function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

// 타겟 페르소나 데이터
const personaByAge: Record<string, { hooks: string[]; ctas: string[]; emotionalTriggers: string[] }> = {
  '10대': {
    hooks: ['요즘 핫한', '찐으로 대박', '이거 실화?', 'ㄹㅇ 갓템', '난리난'],
    ctas: ['지금 바로 겟', '클릭 고고', '놓치면 후회', '득템 찬스'],
    emotionalTriggers: ['FOMO', '트렌드', '인싸', '바이럴']
  },
  '20대': {
    hooks: ['드디어 찾았다', '이건 진짜', '숨겨왔던', '알고 보니', '사실은'],
    ctas: ['지금 확인하기', '놓치지 마세요', '한정 수량', '오늘만 특가'],
    emotionalTriggers: ['가성비', '효율', '자기계발', '라이프스타일']
  },
  '30대': {
    hooks: ['전문가가 인정한', '검증된 효과', '바쁜 일상 속', '현명한 선택', '시간을 아끼는'],
    ctas: ['무료 체험 신청', '상담 받아보기', '자세히 알아보기', '지금 시작하기'],
    emotionalTriggers: ['효율성', '시간절약', '품질', '전문성']
  },
  '40대': {
    hooks: ['오랜 노하우로', '믿을 수 있는', '진정한 가치', '달라진 일상', '새로운 시작'],
    ctas: ['자세한 안내 받기', '전문 상담 신청', '프리미엄 혜택', '특별 제안 확인'],
    emotionalTriggers: ['신뢰', '품격', '건강', '가족']
  },
  '50대': {
    hooks: ['건강을 생각한다면', '현명하신 분들의', '검증된 품질', '오래도록 사랑받는'],
    ctas: ['부담 없이 문의하기', '맞춤 상담 받기', '자녀에게 선물하기'],
    emotionalTriggers: ['건강', '가족', '품질', '신뢰']
  },
}

const personaByGender: Record<string, { adjectives: string[]; contexts: string[] }> = {
  female: {
    adjectives: ['아름다운', '우아한', '섬세한', '빛나는', '사랑스러운'],
    contexts: ['바쁜 일상 속 나만의 시간', '셀프케어의 완성', '거울 보는 게 즐거워지는']
  },
  male: {
    adjectives: ['강력한', '스마트한', '효율적인', '프리미엄', '압도적인'],
    contexts: ['성공하는 사람들의 선택', '남다른 퍼포먼스', '차원이 다른 경험']
  },
  all: {
    adjectives: ['특별한', '놀라운', '새로운', '완벽한', '혁신적인'],
    contexts: ['일상이 달라지는', '삶의 질이 높아지는', '누구나 만족하는']
  }
}

// 로컬 소구점 생성
function generateSellingPointsLocal(productInfo: ProductInfo): SellingPoint[] {
  const { category, salePrice, originalPrice, features, promotion, targetAge } = productInfo

  const categoryPool: Record<string, Array<{ title: string; desc: string }>> = {
    '뷰티/스킨케어': [
      { title: '전문가급 홈케어', desc: '집에서 전문 시술 효과를 경험하세요' },
      { title: '피부 고민 해결', desc: '피부 트러블과 고민을 근본적으로 해결' },
      { title: '시간 절약 케어', desc: '바쁜 일상 속 짧은 시간으로 관리' },
      { title: '피부과 대비 가성비', desc: '시술 비용 대비 합리적인 가격' },
    ],
    '헬스/건강식품': [
      { title: '건강한 습관 시작', desc: '매일 간편하게 챙기는 건강' },
      { title: '과학적 효능 검증', desc: '임상 검증된 성분과 효과' },
      { title: '흡수율 극대화', desc: '몸에 빠르게 흡수되는 설계' },
    ],
    '디지털/가전': [
      { title: '스마트한 생활', desc: '기술로 더 편리해지는 일상' },
      { title: '뛰어난 성능', desc: '기대 이상의 퍼포먼스' },
      { title: '간편한 사용법', desc: '누구나 쉽게 사용하는 직관적 설계' },
    ],
  }

  const defaultPool = [
    { title: '품질 보증', desc: '믿을 수 있는 검증된 품질' },
    { title: '가성비 최고', desc: '가격 대비 뛰어난 만족도' },
    { title: '편리한 사용', desc: '누구나 쉽게 사용 가능' },
  ]

  const pricePoints: Array<{ title: string; desc: string }> = []
  if (originalPrice > salePrice && salePrice > 0) {
    const discountRate = Math.round((1 - salePrice / originalPrice) * 100)
    pricePoints.push({ title: `${discountRate}% 파격 할인`, desc: `정가 대비 ${discountRate}% 할인된 특별 가격` })
  }
  if (promotion) {
    pricePoints.push({ title: '한정 프로모션', desc: promotion })
  }

  const featurePoints = features.slice(0, 2).map(f => ({
    title: f.length > 12 ? f.substring(0, 12) + '...' : f,
    desc: `제품만의 특별한 장점`
  }))

  const targetPoints: Array<{ title: string; desc: string }> = []
  const primaryAge = targetAge[0] || '30대'
  const persona = personaByAge[primaryAge]
  if (persona) {
    targetPoints.push({
      title: persona.hooks[Math.floor(Math.random() * persona.hooks.length)],
      desc: persona.emotionalTriggers.join(', ') + ' 타깃'
    })
  }

  const pool = categoryPool[category] || defaultPool
  const allPoints = [...pool, ...pricePoints, ...featurePoints, ...targetPoints]
  const shuffled = allPoints.sort(() => Math.random() - 0.5)

  return shuffled.slice(0, 3).map(p => ({
    id: generateId(),
    title: p.title,
    description: p.desc,
    copyCount: 10,
  }))
}

// 로컬 카피 생성
function generateCopiesLocal(
  productInfo: ProductInfo,
  sellingPoints: SellingPoint[],
  options: GenerationOptions
): GeneratedCopy[] {
  const { name, targetAge, targetGender, salePrice, originalPrice } = productInfo
  const copies: GeneratedCopy[] = []

  const primaryAge = targetAge[0] || '30대'
  const agePersona = personaByAge[primaryAge] || personaByAge['30대']
  const genderPersona = personaByGender[targetGender] || personaByGender['all']

  const toneModifier = {
    friendly: { suffix: '요' },
    professional: { suffix: '습니다' },
    expert: { suffix: '입니다' },
    humorous: { suffix: '요~' },
  }[options.tone] || { suffix: '요' }

  const mainTemplates = [
    `{hook} {product}의 비밀`,
    `{adj} {product}, 드디어 만났다`,
    `{product}로 {context}`,
    `{product} 하나면 충분해{suffix}`,
    `이런 {product}는 처음이{suffix}`,
    `{product}, {hook}`,
    `{context}, {product}와 함께`,
    `당신을 위한 {adj} {product}`,
    `{hook}, {product}로 시작하세요`,
    `진짜 {adj} {product}를 찾았다`,
  ]

  const subTemplates = [
    `{desc}`,
    `{feature} 경험하세요`,
    `{context} 시작해보세요`,
    `후기가 증명합니다`,
    `전문가도 인정한 효과`,
  ]

  const discountRate = originalPrice > salePrice ? Math.round((1 - salePrice / originalPrice) * 100) : 0
  const ctaTemplates = [
    ...agePersona.ctas,
    discountRate > 0 ? `${discountRate}% 할인 중` : '특별 혜택 확인',
    '무료 배송 혜택',
    '한정 수량 특가',
  ]

  for (const sp of sellingPoints) {
    const usedMains = new Set<string>()
    const count = Math.min(sp.copyCount, 15)

    for (let i = 0; i < count; i++) {
      const hook = agePersona.hooks[Math.floor(Math.random() * agePersona.hooks.length)]
      const adj = genderPersona.adjectives[Math.floor(Math.random() * genderPersona.adjectives.length)]
      const context = genderPersona.contexts[Math.floor(Math.random() * genderPersona.contexts.length)]
      const feature = productInfo.features[Math.floor(Math.random() * productInfo.features.length)] || sp.title

      let mainCopy = ''
      let attempts = 0
      while (attempts < 10) {
        const template = mainTemplates[Math.floor(Math.random() * mainTemplates.length)]
        mainCopy = template
          .replace('{hook}', hook)
          .replace('{adj}', adj)
          .replace('{product}', name)
          .replace('{context}', context)
          .replace('{suffix}', toneModifier.suffix)

        if (!usedMains.has(mainCopy)) {
          usedMains.add(mainCopy)
          break
        }
        attempts++
      }

      const subTemplate = subTemplates[Math.floor(Math.random() * subTemplates.length)]
      const subCopy = subTemplate
        .replace('{desc}', sp.description)
        .replace('{feature}', feature)
        .replace('{context}', context)

      const cta = ctaTemplates[Math.floor(Math.random() * ctaTemplates.length)]

      copies.push({
        id: generateId(),
        sellingPointId: sp.id,
        main: mainCopy,
        sub: subCopy,
        cta: cta,
        hookScore: Number((3.5 + Math.random() * 1.5).toFixed(1)),
        clarityScore: Number((3.5 + Math.random() * 1.5).toFixed(1)),
        isFavorite: false,
      })
    }
  }

  return copies
}

// 로컬 이미지 프롬프트 생성
function generateImagePromptLocal(
  copy: GeneratedCopy,
  productInfo: ProductInfo,
  imageOptions: ImageOptions
): { english: string; korean: string } {
  const { name, category } = productInfo

  const styleMap: Record<string, { en: string; ko: string }> = {
    realistic: { en: 'professional product photography, studio lighting, sharp focus', ko: '전문적인 제품 사진, 스튜디오 조명' },
    lifestyle: { en: 'lifestyle photography, natural light, aesthetic interior', ko: '라이프스타일 사진, 자연광, 감성 인테리어' },
    illustration: { en: 'modern minimalist illustration, clean vector art', ko: '모던 미니멀 일러스트, 깔끔한 벡터 아트' },
    '3d': { en: '3D rendered scene, soft shadows, cinematic lighting', ko: '3D 렌더링, 부드러운 그림자, 시네마틱 조명' },
  }

  const colorMap: Record<string, { en: string; ko: string }> = {
    bright: { en: 'bright vibrant colors, cheerful mood', ko: '밝고 생생한 색상, 경쾌한 분위기' },
    minimal: { en: 'clean minimal aesthetic, white and soft pastels', ko: '깔끔한 미니멀 감성, 화이트와 파스텔 톤' },
    luxury: { en: 'elegant luxury aesthetic, gold accents', ko: '고급스러운 감성, 골드 포인트' },
    warm: { en: 'warm cozy atmosphere, golden hour lighting', ko: '따뜻하고 포근한 분위기, 골든아워 조명' },
  }

  const style = styleMap[imageOptions.style] || styleMap.lifestyle
  const color = colorMap[imageOptions.colorTone] || colorMap.minimal

  const english = `${style.en}, ${color.en}. Product: "${name}" (${category}). High-end commercial advertising quality. ${imageOptions.includeText ? `Text: "${copy.main}"` : ''}`
  const korean = `${style.ko}, ${color.ko}. 제품: "${name}" (${category}). 고급 광고 퀄리티. ${imageOptions.includeText ? `"${copy.main}" 문구 포함` : ''}`

  return { english, korean }
}
