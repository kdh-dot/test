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

// Mock AI functions - 실제로는 Claude API를 호출
async function mockAnalyzeUrl(_url: string): Promise<ProductInfo> {
  await new Promise(resolve => setTimeout(resolve, 2000))
  return {
    name: '클린포어 모공 흡입기',
    category: '뷰티/스킨케어',
    salePrice: 49000,
    originalPrice: 98000,
    targetAge: ['20대', '30대'],
    targetGender: 'female',
    features: [
      '3단계 흡입력 조절',
      'USB 충전식',
      '5가지 교체형 헤드',
      '방수 기능',
      'LED 디스플레이'
    ],
    promotion: '오늘만 특가 + 사은품 증정',
    customSellingPoints: [],
  }
}

async function mockGenerateSellingPoints(_productInfo: ProductInfo): Promise<SellingPoint[]> {
  await new Promise(resolve => setTimeout(resolve, 1500))
  return [
    {
      id: generateId(),
      title: '부위별 맞춤 케어',
      description: '이마/코/턱 등 부위별 집중 케어',
      copyCount: 10,
    },
    {
      id: generateId(),
      title: '피부과 시술 대비',
      description: '비싼 시술 vs 저렴한 홈케어 비교',
      copyCount: 10,
    },
    {
      id: generateId(),
      title: '가격 대비 효과',
      description: '합리적 가격에 전문가급 효과',
      copyCount: 10,
    },
  ]
}

async function mockGenerateCopies(
  _productInfo: ProductInfo,
  sellingPoints: SellingPoint[],
  _options: GenerationOptions
): Promise<GeneratedCopy[]> {
  await new Promise(resolve => setTimeout(resolve, 3000))

  const copies: GeneratedCopy[] = []

  const copyTemplates = {
    '부위별 맞춤 케어': [
      { main: '이마부터 턱까지, 부위별 집중', sub: '5분이면 충분해요', cta: '오늘만 특가 50%', hookScore: 4.5, clarityScore: 4.8 },
      { main: '코 블랙헤드, 집에서 해결', sub: '피부과 가는 날 줄었어요', cta: '지금 구매시 케이스 증정', hookScore: 4.2, clarityScore: 4.5 },
      { main: 'T존부터 U존까지, 맞춤 흡입', sub: '피부 타입별 케어 가능', cta: '50% 할인 마감 임박', hookScore: 4.0, clarityScore: 4.3 },
      { main: '얼굴 부위마다 다른 흡입력', sub: '전문가처럼 케어하세요', cta: '오늘 주문시 무료배송', hookScore: 4.3, clarityScore: 4.6 },
      { main: '이마 모공? 코 블랙헤드?', sub: '부위별로 해결해요', cta: '첫 구매 15% 추가 할인', hookScore: 4.7, clarityScore: 4.4 },
      { main: '같은 얼굴, 다른 케어가 필요해요', sub: '5가지 헤드로 맞춤 관리', cta: '한정 수량 특가', hookScore: 4.1, clarityScore: 4.2 },
      { main: '코옆 모공, 포기하지 마세요', sub: '집에서 전문 케어 가능', cta: '지금 50% 할인 중', hookScore: 4.4, clarityScore: 4.5 },
      { main: '부위별 흡입력 조절의 비밀', sub: '민감한 피부도 OK', cta: '사은품 3종 증정', hookScore: 4.0, clarityScore: 4.1 },
      { main: '얼굴 전체 부위별 집중 케어', sub: '하루 5분 투자로 달라져요', cta: '오늘만 반값', hookScore: 4.6, clarityScore: 4.7 },
      { main: '눈가부터 턱선까지 맞춤 케어', sub: '3단계 파워 조절', cta: '무료 체험 이벤트', hookScore: 4.2, clarityScore: 4.3 },
    ],
    '피부과 시술 대비': [
      { main: '피부과 시술비 아끼세요', sub: '집에서 전문 케어 가능', cta: '시술 1회 가격으로 평생 사용', hookScore: 4.8, clarityScore: 4.6 },
      { main: '피부과 1회 가격 = 평생 홈케어', sub: '매달 가던 피부과, 이제 안녕', cta: '지금 50% 할인', hookScore: 4.7, clarityScore: 4.8 },
      { main: '20만원 시술 효과, 5만원에', sub: '전문가급 모공 케어', cta: '오늘 주문시 무료 배송', hookScore: 4.5, clarityScore: 4.5 },
      { main: '피부과 예약 취소했어요', sub: '집에서도 충분하더라고요', cta: '고객 후기 5만건 돌파', hookScore: 4.4, clarityScore: 4.3 },
      { main: '시술 대기 없이, 원할 때 케어', sub: '24시간 나만의 피부과', cta: '한정 수량 특가', hookScore: 4.3, clarityScore: 4.4 },
      { main: '피부과 다녀온 것 같대요', sub: '친구들이 물어봤어요', cta: '지금 구매시 50% 할인', hookScore: 4.6, clarityScore: 4.2 },
      { main: '시술 1회 vs 평생 홈케어', sub: '현명한 선택은?', cta: '오늘만 특가', hookScore: 4.5, clarityScore: 4.7 },
      { main: '피부과 갈 시간이 없다면', sub: '5분 홈케어로 해결', cta: '지금 바로 시작하세요', hookScore: 4.2, clarityScore: 4.4 },
      { main: '시술 효과, 집에서 재현', sub: '전문가 레벨 모공 관리', cta: '체험 후기 확인하기', hookScore: 4.4, clarityScore: 4.5 },
      { main: '비싼 시술비, 이제 그만', sub: '가성비 최강 홈케어', cta: '50% 할인 마감 임박', hookScore: 4.3, clarityScore: 4.6 },
    ],
    '가격 대비 효과': [
      { main: '5만원으로 피부과 효과?', sub: '가능합니다, 진짜로', cta: '지금 50% 할인 중', hookScore: 4.6, clarityScore: 4.7 },
      { main: '가격표 보고 놀랐어요', sub: '효과 보고 또 놀랐어요', cta: '한정 수량 특가', hookScore: 4.8, clarityScore: 4.5 },
      { main: '이 가격에 이 효과?', sub: '후기가 증명합니다', cta: '5만 후기 확인하기', hookScore: 4.7, clarityScore: 4.6 },
      { main: '하루 100원으로 모공 케어', sub: '커피 한 잔 값도 안 돼요', cta: '오늘만 반값 특가', hookScore: 4.5, clarityScore: 4.8 },
      { main: '가성비 끝판왕 모공 흡입기', sub: '비싼 게 답이 아니에요', cta: '지금 구매시 사은품 증정', hookScore: 4.4, clarityScore: 4.4 },
      { main: '효과는 2배, 가격은 절반', sub: '똑똑한 쇼핑의 정답', cta: '마감 임박 50% 할인', hookScore: 4.6, clarityScore: 4.5 },
      { main: '합리적 가격, 전문가급 효과', sub: '두 마리 토끼를 잡았어요', cta: '오늘 주문시 무료 배송', hookScore: 4.3, clarityScore: 4.6 },
      { main: '가격 걱정 없이 매일 케어', sub: '한 번 사면 평생 사용', cta: '지금이 최저가', hookScore: 4.4, clarityScore: 4.7 },
      { main: '비싼 화장품 대신 이거', sub: '근본적인 모공 관리', cta: '첫 구매 20% 추가 할인', hookScore: 4.5, clarityScore: 4.3 },
      { main: '가격 대비 효과 최고', sub: '후회 없는 선택', cta: '오늘만 특가 진행 중', hookScore: 4.2, clarityScore: 4.5 },
    ],
  }

  for (const sp of sellingPoints) {
    const templates = copyTemplates[sp.title as keyof typeof copyTemplates] || copyTemplates['부위별 맞춤 케어']
    const count = Math.min(sp.copyCount, templates.length)

    for (let i = 0; i < count; i++) {
      copies.push({
        id: generateId(),
        sellingPointId: sp.id,
        ...templates[i],
        isFavorite: false,
      })
    }
  }

  return copies
}

async function mockGenerateImagePrompt(
  _copy: GeneratedCopy,
  _productInfo: ProductInfo,
  imageOptions: ImageOptions
): Promise<{ english: string; korean: string }> {
  await new Promise(resolve => setTimeout(resolve, 1000))

  const styleMap = {
    realistic: 'professional product photography',
    lifestyle: 'lifestyle aesthetic photography',
    illustration: 'modern illustration style',
    '3d': '3D rendered scene',
  }

  const colorMap = {
    bright: 'bright and cheerful lighting, vibrant colors',
    minimal: 'clean minimal aesthetic, white and pastel tones',
    luxury: 'elegant and luxurious, gold and black accents',
    warm: 'warm and cozy atmosphere, soft golden light',
  }

  const english = `A ${colorMap[imageOptions.colorTone]}, ${styleMap[imageOptions.style]}, featuring a modern skincare device on a clean bathroom counter. Soft natural lighting, close-up of smooth facial skin, ${imageOptions.size === '1:1' ? 'square composition' : imageOptions.size === '4:5' ? 'vertical composition' : 'horizontal composition'}. High quality, advertising style.`

  const korean = `${colorMap[imageOptions.colorTone] === 'bright and cheerful lighting, vibrant colors' ? '밝고 활기찬 조명, 생생한 색상' : colorMap[imageOptions.colorTone] === 'clean minimal aesthetic, white and pastel tones' ? '깨끗하고 미니멀한 감성, 화이트와 파스텔 톤' : colorMap[imageOptions.colorTone] === 'elegant and luxurious, gold and black accents' ? '우아하고 고급스러운 분위기, 골드와 블랙 포인트' : '따뜻하고 아늑한 분위기, 부드러운 골든 라이트'}의 ${styleMap[imageOptions.style] === 'professional product photography' ? '전문적인 제품 사진' : styleMap[imageOptions.style] === 'lifestyle aesthetic photography' ? '라이프스타일 감성 사진' : styleMap[imageOptions.style] === 'modern illustration style' ? '모던한 일러스트레이션 스타일' : '3D 렌더링 장면'}, 깨끗한 욕실 카운터 위의 현대적인 스킨케어 디바이스. 부드러운 자연광, 매끄러운 얼굴 피부 클로즈업, ${imageOptions.size === '1:1' ? '정사각형 구도' : imageOptions.size === '4:5' ? '세로형 구도' : '가로형 구도'}. 고품질, 광고 스타일.`

  return { english, korean }
}

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
      addCompetitorUrl: (url) => set((state) => ({
        competitorUrls: [...state.competitorUrls, url]
      })),
      removeCompetitorUrl: (index) => set((state) => ({
        competitorUrls: state.competitorUrls.filter((_, i) => i !== index)
      })),
      analyzeUrl: async () => {
        set({ isAnalyzing: true })
        try {
          const productInfo = await mockAnalyzeUrl(get().urlToAnalyze)
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
        productInfo: {
          ...state.productInfo,
          features: [...state.productInfo.features, feature]
        }
      })),
      removeFeature: (index) => set((state) => ({
        productInfo: {
          ...state.productInfo,
          features: state.productInfo.features.filter((_, i) => i !== index)
        }
      })),
      addCustomSellingPoint: (point) => set((state) => ({
        productInfo: {
          ...state.productInfo,
          customSellingPoints: [...state.productInfo.customSellingPoints, point]
        }
      })),
      removeCustomSellingPoint: (index) => set((state) => ({
        productInfo: {
          ...state.productInfo,
          customSellingPoints: state.productInfo.customSellingPoints.filter((_, i) => i !== index)
        }
      })),

      // Selling points
      setSellingPoints: (points) => set({ sellingPoints: points }),
      updateSellingPoint: (id, updates) => set((state) => ({
        sellingPoints: state.sellingPoints.map((sp) =>
          sp.id === id ? { ...sp, ...updates } : sp
        )
      })),
      addSellingPoint: () => set((state) => ({
        sellingPoints: [
          ...state.sellingPoints,
          {
            id: generateId(),
            title: '',
            description: '',
            copyCount: 10,
          }
        ]
      })),
      removeSellingPoint: (id) => set((state) => ({
        sellingPoints: state.sellingPoints.filter((sp) => sp.id !== id)
      })),
      generateSellingPoints: async () => {
        set({ isGeneratingSellingPoints: true })
        try {
          const sellingPoints = await mockGenerateSellingPoints(get().productInfo)
          set({ sellingPoints, isGeneratingSellingPoints: false })
        } catch (error) {
          set({ isGeneratingSellingPoints: false })
          throw error
        }
      },

      // Generation options
      updateOptions: (options) => set((state) => ({
        options: { ...state.options, ...options }
      })),

      // Copies
      generateCopies: async () => {
        set({ isGeneratingCopies: true })
        try {
          const copies = await mockGenerateCopies(
            get().productInfo,
            get().sellingPoints,
            get().options
          )
          set({ copies, isGeneratingCopies: false })
        } catch (error) {
          set({ isGeneratingCopies: false })
          throw error
        }
      },
      toggleFavorite: (id) => set((state) => ({
        copies: state.copies.map((copy) =>
          copy.id === id ? { ...copy, isFavorite: !copy.isFavorite } : copy
        )
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

        try {
          const imagePrompt = await mockGenerateImagePrompt(selectedCopy, productInfo, imageOptions)
          set({ imagePrompt })
        } catch (error) {
          throw error
        }
      },
      generateImages: async () => {
        set({ isGeneratingImages: true })
        try {
          await new Promise(resolve => setTimeout(resolve, 3000))
          // Mock generated images - in production, this would call FLUX API
          set({
            generatedImages: [
              'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=512&h=512&fit=crop',
              'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=512&h=512&fit=crop',
            ],
            isGeneratingImages: false
          })
        } catch (error) {
          set({ isGeneratingImages: false })
          throw error
        }
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
        if (!project) return

        set({
          currentProjectId: id,
          productInfo: project.productInfo,
          sellingPoints: project.sellingPoints,
          options: project.options,
          copies: project.copies,
          currentStep: project.copies.length > 0 ? 5 : 1,
          showProjectsModal: false,
        })
      },
      deleteProject: (id) => set((state) => ({
        projects: state.projects.filter(p => p.id !== id),
        currentProjectId: state.currentProjectId === id ? null : state.currentProjectId,
      })),

      // UI
      setShowProjectsModal: (show) => set({ showProjectsModal: show }),
      setShowImageModal: (show) => set({ showImageModal: show }),

      // Reset
      reset: () => set({
        ...initialState,
        projects: get().projects, // Keep projects
      }),
    }),
    {
      name: 'copyflow-storage',
      partialize: (state) => ({
        projects: state.projects,
      }),
    }
  )
)
