import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppState, AppActions, ProductInfo, SellingPoint, GenerationOptions, ImageOptions, GeneratedCopy, Project } from '../types'
import { generateId } from '../lib/utils'

const initialProductInfo: ProductInfo = {
  name: '',
  category: '',
  salePrice: 0,
  originalPrice: 0,
  targetAge: [],
  targetGender: 'all',
  features: [],
  promotion: '',
  customSellingPoints: [],
}

const initialOptions: GenerationOptions = {
  tone: 'professional',
  length: 'medium',
  platforms: ['meta'],
  requiredKeywords: [],
  forbiddenKeywords: [],
}

const initialImageOptions: ImageOptions = {
  style: 'lifestyle',
  size: '1:1',
  colorTone: 'minimal',
  includeText: true,
  fontStyle: 'Pretendard Bold',
  textPosition: 'bottom-center',
}

const initialState: AppState = {
  currentStep: 1,
  inputMode: 'manual',
  urlToAnalyze: '',
  competitorUrls: [],
  isAnalyzing: false,
  productInfo: initialProductInfo,
  sellingPoints: [],
  isGeneratingSellingPoints: false,
  options: initialOptions,
  copies: [],
  isGeneratingCopies: false,
  selectedCopyId: null,
  imageOptions: initialImageOptions,
  imagePrompt: null,
  generatedImages: [],
  isGeneratingImages: false,
  projects: [],
  currentProjectId: null,
  showProjectsModal: false,
  showImageModal: false,
}

// ============================================
// 타겟별 페르소나 정의
// ============================================
interface Persona {
  tone: string
  style: string
  hooks: string[]
  ctas: string[]
  emotionalTriggers: string[]
}

const personaByAge: Record<string, Persona> = {
  '10대': {
    tone: '친근하고 트렌디한',
    style: '반말, 이모지 활용, 줄임말 OK',
    hooks: ['요즘 핫한', '찐으로 대박', '이거 실화?', 'ㄹㅇ 갓템', '난리난'],
    ctas: ['지금 바로 겟', '클릭 고고', '놓치면 후회', '득템 찬스'],
    emotionalTriggers: ['FOMO', '트렌드', '인싸', '바이럴']
  },
  '20대': {
    tone: '세련되고 공감가는',
    style: '캐주얼한 존댓말, 위트 있는 표현',
    hooks: ['드디어 찾았다', '이건 진짜', '숨겨왔던', '알고 보니', '사실은'],
    ctas: ['지금 확인하기', '놓치지 마세요', '한정 수량', '오늘만 특가'],
    emotionalTriggers: ['가성비', '효율', '자기계발', '라이프스타일']
  },
  '30대': {
    tone: '신뢰감 있고 실용적인',
    style: '정중한 존댓말, 데이터 기반 표현',
    hooks: ['전문가가 인정한', '검증된 효과', '바쁜 일상 속', '현명한 선택', '시간을 아끼는'],
    ctas: ['무료 체험 신청', '상담 받아보기', '자세히 알아보기', '지금 시작하기'],
    emotionalTriggers: ['효율성', '시간절약', '품질', '전문성']
  },
  '40대': {
    tone: '품격 있고 안정적인',
    style: '격식체, 신뢰감 있는 표현',
    hooks: ['오랜 노하우로', '믿을 수 있는', '진정한 가치', '달라진 일상', '새로운 시작'],
    ctas: ['자세한 안내 받기', '전문 상담 신청', '프리미엄 혜택', '특별 제안 확인'],
    emotionalTriggers: ['신뢰', '품격', '건강', '가족']
  },
  '50대': {
    tone: '따뜻하고 정중한',
    style: '높임말, 친근하면서 존중하는 표현',
    hooks: ['건강을 생각한다면', '현명하신 분들의', '검증된 품질', '오래도록 사랑받는', '특별히 준비한'],
    ctas: ['부담 없이 문의하기', '맞춤 상담 받기', '자녀에게 선물하기', '지금 바로 경험'],
    emotionalTriggers: ['건강', '가족', '품질', '신뢰']
  },
  '60대 이상': {
    tone: '존경을 담은 따뜻한',
    style: '정중하고 쉬운 표현, 큰 글씨 권장',
    hooks: ['편안한 일상을 위한', '건강한 매일', '손쉽게 사용하는', '자녀분들이 추천한', '믿고 선택하는'],
    ctas: ['지금 바로 전화주세요', '무료로 체험해보세요', '편하게 문의하세요', '선물로도 좋아요'],
    emotionalTriggers: ['건강', '편안함', '가족', '신뢰']
  }
}

const personaByGender: Record<string, { adjectives: string[], contexts: string[] }> = {
  female: {
    adjectives: ['아름다운', '우아한', '섬세한', '빛나는', '사랑스러운', '환한'],
    contexts: ['바쁜 일상 속 나만의 시간', '셀프케어의 완성', '거울 보는 게 즐거워지는', '자신감이 달라지는']
  },
  male: {
    adjectives: ['강력한', '스마트한', '효율적인', '프리미엄', '압도적인', '완벽한'],
    contexts: ['성공하는 사람들의 선택', '남다른 퍼포먼스', '차원이 다른 경험', '진짜 프로의 선택']
  },
  all: {
    adjectives: ['특별한', '놀라운', '새로운', '완벽한', '혁신적인', '프리미엄'],
    contexts: ['일상이 달라지는', '삶의 질이 높아지는', '누구나 만족하는', '모두가 찾는']
  }
}

// ============================================
// 실제 URL 분석 함수
// ============================================
async function analyzeUrlContent(url: string): Promise<ProductInfo> {
  try {
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
    const response = await fetch(proxyUrl)

    if (!response.ok) {
      throw new Error('URL을 가져올 수 없습니다.')
    }

    const html = await response.text()
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')

    // 제품명 추출
    const productName =
      doc.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
      doc.querySelector('h1')?.textContent?.trim() ||
      doc.querySelector('.product-name, .product-title, [class*="product"][class*="name"]')?.textContent?.trim() ||
      doc.querySelector('title')?.textContent?.trim()?.split('|')[0]?.split('-')[0]?.trim() ||
      '제품명을 찾을 수 없습니다'

    // 가격 추출
    const priceText = html.match(/[\d,]+\s*원/g) || []
    const prices = priceText.map(p => parseInt(p.replace(/[^\d]/g, ''))).filter(p => p > 0 && p < 10000000)
    const uniquePrices = [...new Set(prices)].sort((a, b) => a - b)

    const salePrice = uniquePrices[0] || 0
    const originalPrice = uniquePrices.length > 1 ? uniquePrices[uniquePrices.length - 1] : salePrice

    // 카테고리 감지
    const category = detectCategory(productName + ' ' + html.substring(0, 5000))

    // 특징 추출
    const features: string[] = []
    const listItems = doc.querySelectorAll('li, .feature, [class*="feature"], [class*="benefit"]')
    listItems.forEach(item => {
      const text = item.textContent?.trim() || ''
      if (text.length > 5 && text.length < 50 && !text.includes('로그인') && !text.includes('회원')) {
        if (features.length < 5 && !features.includes(text)) {
          features.push(text)
        }
      }
    })

    // 타깃 추정
    const targetAge = detectTargetAge(html)
    const targetGender = detectTargetGender(html, productName, category)

    // 프로모션 추출
    const promotionKeywords = ['특가', '할인', '무료배송', '사은품', '이벤트', 'SALE', '증정']
    let promotion = ''
    promotionKeywords.forEach(keyword => {
      const match = html.match(new RegExp(`[^<>]{0,20}${keyword}[^<>]{0,30}`, 'i'))
      if (match && !promotion) {
        promotion = match[0].trim()
      }
    })

    return {
      name: productName.substring(0, 50),
      category,
      salePrice,
      originalPrice: originalPrice > salePrice ? originalPrice : 0,
      targetAge,
      targetGender,
      features: features.length > 0 ? features : ['제품 특징을 직접 입력해 주세요'],
      promotion,
      customSellingPoints: [],
    }
  } catch (error) {
    console.error('URL 분석 오류:', error)
    throw new Error('URL 분석에 실패했습니다. 직접 입력 모드를 사용해 주세요.')
  }
}

function detectCategory(text: string): string {
  const categories: Record<string, string[]> = {
    '뷰티/스킨케어': ['화장품', '스킨케어', '뷰티', '피부', '모공', '미백', '주름', '세럼', '크림'],
    '헬스/건강식품': ['건강', '비타민', '영양제', '다이어트', '운동', '헬스', '프로틴'],
    '식품/음료': ['식품', '음료', '커피', '차', '간식', '밀키트'],
    '패션/의류': ['패션', '의류', '옷', '신발', '가방', '액세서리'],
    '디지털/가전': ['전자', '디지털', '가전', 'LED', 'USB', '충전'],
    '생활용품': ['생활', '주방', '욕실', '청소', '인테리어'],
  }

  const lowerText = text.toLowerCase()
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(k => lowerText.includes(k.toLowerCase()))) {
      return category
    }
  }
  return '기타'
}

function detectTargetAge(html: string): string[] {
  const ages: string[] = []
  if (html.includes('10대') || html.includes('청소년')) ages.push('10대')
  if (html.includes('20대') || html.includes('젊은')) ages.push('20대')
  if (html.includes('30대') || html.includes('직장인')) ages.push('30대')
  if (html.includes('40대') || html.includes('중년')) ages.push('40대')
  if (html.includes('50대')) ages.push('50대')
  if (html.includes('60대') || html.includes('시니어')) ages.push('60대 이상')
  return ages.length > 0 ? ages : ['20대', '30대']
}

function detectTargetGender(html: string, productName: string, category: string): 'male' | 'female' | 'all' {
  const text = (html + productName + category).toLowerCase()
  const femaleKeywords = ['여성', '여자', '그녀', '엄마', '화장품', '스킨케어', '뷰티']
  const maleKeywords = ['남성', '남자', '그', '아빠', '면도']

  let femaleScore = femaleKeywords.filter(k => text.includes(k)).length
  let maleScore = maleKeywords.filter(k => text.includes(k)).length

  if (femaleScore > maleScore + 1) return 'female'
  if (maleScore > femaleScore + 1) return 'male'
  return 'all'
}

// ============================================
// 소구점 생성 (다양성 확보)
// ============================================
function generateSellingPointsFromProduct(productInfo: ProductInfo): SellingPoint[] {
  const { name, category, salePrice, originalPrice, features, promotion, targetAge } = productInfo

  // 카테고리별 소구점 풀
  const categoryPool: Record<string, Array<{ title: string; desc: string }>> = {
    '뷰티/스킨케어': [
      { title: '전문가급 홈케어', desc: '집에서 전문 시술 효과를 경험하세요' },
      { title: '피부 고민 해결', desc: '피부 트러블과 고민을 근본적으로 해결' },
      { title: '시간 절약 케어', desc: '바쁜 일상 속 짧은 시간으로 관리' },
      { title: '자연스러운 변화', desc: '매일 조금씩 눈에 띄는 변화' },
      { title: '피부과 대비 가성비', desc: '시술 비용 대비 합리적인 가격' },
      { title: '민감성 피부 안심', desc: '자극 없이 부드럽게 케어' },
      { title: '셀프케어의 새로운 기준', desc: '전문가 없이도 완벽한 관리' },
      { title: '빛나는 피부 완성', desc: '건강하고 광채나는 피부로' },
    ],
    '헬스/건강식품': [
      { title: '건강한 습관 시작', desc: '매일 간편하게 챙기는 건강' },
      { title: '과학적 효능 검증', desc: '임상 검증된 성분과 효과' },
      { title: '흡수율 극대화', desc: '몸에 빠르게 흡수되는 설계' },
      { title: '꾸준한 복용 효과', desc: '지속적인 복용으로 체감하는 변화' },
      { title: '안전한 원료', desc: '엄선된 원료로 만든 건강기능식품' },
      { title: '간편한 섭취', desc: '언제 어디서나 쉽게 섭취' },
      { title: '에너지 충전', desc: '활력 넘치는 하루를 위한 선택' },
      { title: '면역력 강화', desc: '건강한 몸을 위한 필수 영양소' },
    ],
    '디지털/가전': [
      { title: '스마트한 생활', desc: '기술로 더 편리해지는 일상' },
      { title: '뛰어난 성능', desc: '기대 이상의 퍼포먼스' },
      { title: '간편한 사용법', desc: '누구나 쉽게 사용하는 직관적 설계' },
      { title: '에너지 효율', desc: '효율적인 에너지 사용으로 경제적' },
      { title: '내구성 보장', desc: '오래 사용해도 변함없는 성능' },
      { title: '혁신적 기술', desc: '최신 기술이 집약된 제품' },
      { title: '올인원 솔루션', desc: '하나로 모든 것을 해결' },
      { title: '프리미엄 디자인', desc: '인테리어와 어우러지는 세련된 디자인' },
    ],
  }

  const defaultPool = [
    { title: '품질 보증', desc: '믿을 수 있는 검증된 품질' },
    { title: '가성비 최고', desc: '가격 대비 뛰어난 만족도' },
    { title: '편리한 사용', desc: '누구나 쉽게 사용 가능' },
    { title: '고객 만족', desc: '수많은 후기가 증명하는 만족도' },
    { title: '빠른 배송', desc: '주문 후 빠르게 받아보세요' },
    { title: '특별한 혜택', desc: '지금만 누릴 수 있는 특별함' },
    { title: '차별화된 가치', desc: '다른 제품과는 다른 특별함' },
    { title: '전문가 추천', desc: '전문가들이 인정한 품질' },
  ]

  // 가격 관련 소구점
  const pricePoints: Array<{ title: string; desc: string }> = []
  if (originalPrice > salePrice && salePrice > 0) {
    const discountRate = Math.round((1 - salePrice / originalPrice) * 100)
    pricePoints.push({ title: `${discountRate}% 파격 할인`, desc: `정가 대비 ${discountRate}% 할인된 특별 가격` })
  }
  if (promotion) {
    pricePoints.push({ title: '한정 프로모션', desc: promotion })
  }

  // 특징 기반 소구점
  const featurePoints = features.slice(0, 2).map(f => ({
    title: f.length > 12 ? f.substring(0, 12) + '...' : f,
    desc: `${name}만의 특별한 장점`
  }))

  // 타깃 기반 소구점
  const targetPoints: Array<{ title: string; desc: string }> = []
  const primaryAge = targetAge[0] || '30대'
  const persona = personaByAge[primaryAge]
  if (persona) {
    targetPoints.push({
      title: persona.hooks[Math.floor(Math.random() * persona.hooks.length)],
      desc: persona.emotionalTriggers.join(', ') + '에 민감한 고객 타깃'
    })
  }

  // 모든 소구점 합치고 셔플
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

// ============================================
// 카피 생성 (타겟 페르소나 반영)
// ============================================
function generateCopiesFromSellingPoints(
  productInfo: ProductInfo,
  sellingPoints: SellingPoint[],
  options: GenerationOptions
): GeneratedCopy[] {
  const { name, targetAge, targetGender, salePrice, originalPrice } = productInfo
  const copies: GeneratedCopy[] = []

  // 주요 타깃 페르소나 결정
  const primaryAge = targetAge[0] || '30대'
  const agePersona = personaByAge[primaryAge] || personaByAge['30대']
  const genderPersona = personaByGender[targetGender] || personaByGender['all']

  // 톤에 따른 스타일 조정
  const toneModifier = {
    friendly: { suffix: '요', exclaim: '!' },
    professional: { suffix: '습니다', exclaim: '.' },
    expert: { suffix: '입니다', exclaim: '.' },
    humorous: { suffix: '요~', exclaim: '!' },
  }[options.tone] || { suffix: '요', exclaim: '.' }

  // 다양한 메인 카피 템플릿
  const mainTemplates = [
    `{hook} {product}의 비밀`,
    `{adj} {product}, 드디어 만났다`,
    `{product}로 {context}`,
    `{hook} {product} 출시`,
    `{product} 하나면 충분해{suffix}`,
    `이런 {product}는 처음이{suffix}`,
    `{product}, {hook}`,
    `{context}, {product}와 함께`,
    `당신을 위한 {adj} {product}`,
    `{hook}, {product}로 시작하세요`,
    `{product}가 달라졌{suffix}`,
    `진짜 {adj} {product}를 찾았다`,
    `{product}, 이제 망설이지 마세요`,
    `{hook}! {product} 체험기`,
    `{adj} 변화, {product}`,
  ]

  // 서브 카피 템플릿
  const subTemplates = [
    `{desc}`,
    `{feature} 경험하세요`,
    `{context} 시작해보세요`,
    `지금 바로 확인하세요`,
    `후기가 증명합니다`,
    `{feature}로 달라지는 일상`,
    `전문가도 인정한 효과`,
    `{desc} 느껴보세요`,
  ]

  // 할인율 계산
  const discountRate = originalPrice > salePrice ? Math.round((1 - salePrice / originalPrice) * 100) : 0

  // CTA 템플릿
  const ctaTemplates = [
    ...agePersona.ctas,
    discountRate > 0 ? `${discountRate}% 할인 중` : '특별 혜택 확인',
    '무료 배송 혜택',
    '한정 수량 특가',
    '오늘만 이 가격',
    '지금 시작하기',
  ]

  for (const sp of sellingPoints) {
    const usedMains = new Set<string>()
    const count = Math.min(sp.copyCount, 15)

    for (let i = 0; i < count; i++) {
      // 랜덤 요소 선택
      const hook = agePersona.hooks[Math.floor(Math.random() * agePersona.hooks.length)]
      const adj = genderPersona.adjectives[Math.floor(Math.random() * genderPersona.adjectives.length)]
      const context = genderPersona.contexts[Math.floor(Math.random() * genderPersona.contexts.length)]
      const feature = productInfo.features[Math.floor(Math.random() * productInfo.features.length)] || sp.title

      // 메인 카피 생성 (중복 방지)
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

      // 서브 카피 생성
      const subTemplate = subTemplates[Math.floor(Math.random() * subTemplates.length)]
      const subCopy = subTemplate
        .replace('{desc}', sp.description)
        .replace('{feature}', feature)
        .replace('{context}', context)

      // CTA 생성
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

// ============================================
// 이미지 프롬프트 생성 (페르소나 반영)
// ============================================
function generateImagePromptFromCopy(
  copy: GeneratedCopy,
  productInfo: ProductInfo,
  imageOptions: ImageOptions
): { english: string; korean: string } {
  const { name, category, targetAge, targetGender } = productInfo

  const styleMap: Record<string, { en: string; ko: string }> = {
    realistic: { en: 'professional product photography, studio lighting, sharp focus', ko: '전문적인 제품 사진, 스튜디오 조명' },
    lifestyle: { en: 'lifestyle photography, natural light, aesthetic interior', ko: '라이프스타일 사진, 자연광, 감성 인테리어' },
    illustration: { en: 'modern minimalist illustration, clean vector art, flat design', ko: '모던 미니멀 일러스트, 깔끔한 벡터 아트' },
    '3d': { en: '3D rendered scene, soft shadows, cinematic lighting, octane render', ko: '3D 렌더링, 부드러운 그림자, 시네마틱 조명' },
  }

  const colorMap: Record<string, { en: string; ko: string }> = {
    bright: { en: 'bright vibrant colors, cheerful mood, high saturation', ko: '밝고 생생한 색상, 경쾌한 분위기' },
    minimal: { en: 'clean minimal aesthetic, white and soft pastels, negative space', ko: '깔끔한 미니멀 감성, 화이트와 파스텔 톤' },
    luxury: { en: 'elegant luxury aesthetic, gold accents, dark sophisticated tones', ko: '고급스러운 감성, 골드 포인트, 세련된 다크 톤' },
    warm: { en: 'warm cozy atmosphere, golden hour lighting, soft warm tones', ko: '따뜻하고 포근한 분위기, 골든아워 조명' },
  }

  // 타깃에 따른 모델 설명
  const targetDesc = {
    age: targetAge[0] || '30대',
    gender: targetGender === 'female' ? 'woman' : targetGender === 'male' ? 'man' : 'person'
  }

  const style = styleMap[imageOptions.style] || styleMap.lifestyle
  const color = colorMap[imageOptions.colorTone] || colorMap.minimal

  const sizeRatio = {
    '1:1': 'square composition',
    '4:5': 'vertical portrait composition',
    '16:9': 'horizontal cinematic composition',
  }[imageOptions.size]

  const english = `${style.en}, ${color.en}. Product: "${name}" (${category}). ${sizeRatio}. Target audience: ${targetDesc.age} ${targetDesc.gender}. High-end commercial advertising quality. ${imageOptions.includeText ? `Text overlay: "${copy.main}" positioned at ${imageOptions.textPosition.replace('-', ' ')}.` : 'No text overlay.'}`

  const korean = `${style.ko}, ${color.ko}. 제품: "${name}" (${category}). 타깃: ${targetDesc.age} ${targetGender === 'female' ? '여성' : targetGender === 'male' ? '남성' : '전체'}. 고급 광고 퀄리티. ${imageOptions.includeText ? `"${copy.main}" 문구를 ${imageOptions.textPosition}에 배치.` : '텍스트 없음.'}`

  return { english, korean }
}

// ============================================
// Zustand Store
// ============================================
export const useAppStore = create<AppState & AppActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Navigation
      setStep: (step) => set({ currentStep: step }),
      nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 7) })),
      prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),

      // Input mode
      setInputMode: (mode) => set({ inputMode: mode }),

      // URL analysis
      setUrlToAnalyze: (url) => set({ urlToAnalyze: url }),
      addCompetitorUrl: (url) => set((state) => ({ competitorUrls: [...state.competitorUrls, url] })),
      removeCompetitorUrl: (index) => set((state) => ({
        competitorUrls: state.competitorUrls.filter((_, i) => i !== index)
      })),
      analyzeUrl: async () => {
        set({ isAnalyzing: true })
        try {
          const productInfo = await analyzeUrlContent(get().urlToAnalyze)
          set({ productInfo, isAnalyzing: false })
        } catch (error) {
          set({ isAnalyzing: false })
          throw error
        }
      },

      // Product info
      updateProductInfo: (info) => set((state) => ({
        productInfo: { ...state.productInfo, ...info }
      })),
      addFeature: (feature) => set((state) => ({
        productInfo: { ...state.productInfo, features: [...state.productInfo.features, feature] }
      })),
      removeFeature: (index) => set((state) => ({
        productInfo: { ...state.productInfo, features: state.productInfo.features.filter((_, i) => i !== index) }
      })),
      addCustomSellingPoint: (point) => set((state) => ({
        productInfo: { ...state.productInfo, customSellingPoints: [...state.productInfo.customSellingPoints, point] }
      })),
      removeCustomSellingPoint: (index) => set((state) => ({
        productInfo: { ...state.productInfo, customSellingPoints: state.productInfo.customSellingPoints.filter((_, i) => i !== index) }
      })),

      // Selling points
      setSellingPoints: (points) => set({ sellingPoints: points }),
      updateSellingPoint: (id, updates) => set((state) => ({
        sellingPoints: state.sellingPoints.map((sp) => sp.id === id ? { ...sp, ...updates } : sp)
      })),
      addSellingPoint: () => set((state) => ({
        sellingPoints: [...state.sellingPoints, { id: generateId(), title: '', description: '', copyCount: 10 }]
      })),
      removeSellingPoint: (id) => set((state) => ({
        sellingPoints: state.sellingPoints.filter((sp) => sp.id !== id)
      })),
      generateSellingPoints: async () => {
        set({ isGeneratingSellingPoints: true })
        await new Promise(r => setTimeout(r, 1000))
        const sellingPoints = generateSellingPointsFromProduct(get().productInfo)
        set({ sellingPoints, isGeneratingSellingPoints: false })
      },

      // Generation options
      updateOptions: (options) => set((state) => ({
        options: { ...state.options, ...options }
      })),

      // Copies
      generateCopies: async () => {
        set({ isGeneratingCopies: true })
        await new Promise(r => setTimeout(r, 2000))
        const copies = generateCopiesFromSellingPoints(
          get().productInfo,
          get().sellingPoints,
          get().options
        )
        set({ copies, isGeneratingCopies: false })
      },
      toggleFavorite: (id) => set((state) => ({
        copies: state.copies.map((c) => c.id === id ? { ...c, isFavorite: !c.isFavorite } : c)
      })),

      // Image generation
      selectCopyForImage: (id) => set({ selectedCopyId: id, showImageModal: id !== null }),
      updateImageOptions: (options) => set((state) => ({
        imageOptions: { ...state.imageOptions, ...options }
      })),
      generateImagePrompt: async () => {
        const { selectedCopyId, copies, productInfo, imageOptions } = get()
        const selectedCopy = copies.find((c) => c.id === selectedCopyId)
        if (!selectedCopy) return

        const imagePrompt = generateImagePromptFromCopy(selectedCopy, productInfo, imageOptions)
        set({ imagePrompt })
      },
      generateImages: async () => {
        set({ isGeneratingImages: true })
        await new Promise(r => setTimeout(r, 2000))
        set({
          generatedImages: [
            'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=512&h=512&fit=crop',
            'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=512&h=512&fit=crop',
          ],
          isGeneratingImages: false
        })
      },

      // Projects
      saveProject: (name) => {
        const state = get()
        const project: Project = {
          id: state.currentProjectId || generateId(),
          name,
          createdAt: state.currentProjectId
            ? state.projects.find(p => p.id === state.currentProjectId)?.createdAt || new Date().toISOString()
            : new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          productInfo: state.productInfo,
          sellingPoints: state.sellingPoints,
          options: state.options,
          copies: state.copies,
        }
        set((state) => ({
          projects: state.currentProjectId
            ? state.projects.map(p => p.id === state.currentProjectId ? project : p)
            : [...state.projects, project],
          currentProjectId: project.id,
        }))
      },
      loadProject: (id) => {
        const project = get().projects.find(p => p.id === id)
        if (project) {
          set({
            currentProjectId: id,
            productInfo: project.productInfo,
            sellingPoints: project.sellingPoints,
            options: project.options,
            copies: project.copies,
            currentStep: project.copies.length > 0 ? 5 : 1,
            showProjectsModal: false,
          })
        }
      },
      deleteProject: (id) => set((state) => ({
        projects: state.projects.filter(p => p.id !== id),
        currentProjectId: state.currentProjectId === id ? null : state.currentProjectId,
      })),

      // UI
      setShowProjectsModal: (show) => set({ showProjectsModal: show }),
      setShowImageModal: (show) => set({ showImageModal: show }),

      // Reset
      reset: () => set({ ...initialState, projects: get().projects }),
    }),
    {
      name: 'copyflow-storage',
      partialize: (state) => ({ projects: state.projects }),
    }
  )
)
