export type InputMode = 'url' | 'manual'

export type ToneStyle = 'friendly' | 'professional' | 'expert' | 'humorous'
export type CopyLength = 'short' | 'medium' | 'long'
export type Platform = 'meta' | 'google' | 'kakao' | 'naver'

export interface ProductInfo {
  name: string
  category: string
  salePrice: number
  originalPrice: number
  targetAge: string[]
  targetGender: 'male' | 'female' | 'all'
  features: string[]
  promotion: string
  customSellingPoints: string[]
}

export interface SellingPoint {
  id: string
  title: string
  description: string
  copyCount: number
}

export interface GenerationOptions {
  tone: ToneStyle
  length: CopyLength
  platforms: Platform[]
  requiredKeywords: string[]
  forbiddenKeywords: string[]
}

export interface GeneratedCopy {
  id: string
  sellingPointId: string
  main: string
  sub: string
  cta: string
  hookScore: number
  clarityScore: number
  isFavorite: boolean
}

export interface ImageOptions {
  style: 'realistic' | 'lifestyle' | 'illustration' | '3d'
  size: '1:1' | '4:5' | '16:9'
  colorTone: 'bright' | 'minimal' | 'luxury' | 'warm'
  includeText: boolean
  fontStyle: string
  textPosition: string
}

export interface ImagePrompt {
  english: string
  korean: string
}

export interface Project {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  productInfo: ProductInfo
  sellingPoints: SellingPoint[]
  options: GenerationOptions
  copies: GeneratedCopy[]
}

export interface AppState {
  // Current step
  currentStep: number

  // Input mode
  inputMode: InputMode

  // URL analysis
  urlToAnalyze: string
  competitorUrls: string[]
  isAnalyzing: boolean

  // Product info
  productInfo: ProductInfo

  // Selling points
  sellingPoints: SellingPoint[]
  isGeneratingSellingPoints: boolean

  // Generation options
  options: GenerationOptions

  // Generated copies
  copies: GeneratedCopy[]
  isGeneratingCopies: boolean

  // Image generation
  selectedCopyId: string | null
  imageOptions: ImageOptions
  imagePrompt: ImagePrompt | null
  generatedImages: string[]
  isGeneratingImages: boolean

  // Projects
  projects: Project[]
  currentProjectId: string | null

  // UI state
  showProjectsModal: boolean
  showImageModal: boolean
}

export type AppActions = {
  // Navigation
  setStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void

  // Input mode
  setInputMode: (mode: InputMode) => void

  // URL analysis
  setUrlToAnalyze: (url: string) => void
  addCompetitorUrl: (url: string) => void
  removeCompetitorUrl: (index: number) => void
  analyzeUrl: () => Promise<void>

  // Product info
  updateProductInfo: (info: Partial<ProductInfo>) => void
  addFeature: (feature: string) => void
  removeFeature: (index: number) => void
  addCustomSellingPoint: (point: string) => void
  removeCustomSellingPoint: (index: number) => void

  // Selling points
  setSellingPoints: (points: SellingPoint[]) => void
  updateSellingPoint: (id: string, updates: Partial<SellingPoint>) => void
  addSellingPoint: () => void
  removeSellingPoint: (id: string) => void
  generateSellingPoints: () => Promise<void>

  // Generation options
  updateOptions: (options: Partial<GenerationOptions>) => void

  // Copies
  generateCopies: () => Promise<void>
  toggleFavorite: (id: string) => void

  // Image generation
  selectCopyForImage: (id: string | null) => void
  updateImageOptions: (options: Partial<ImageOptions>) => void
  generateImagePrompt: () => Promise<void>
  generateImages: () => Promise<void>

  // Projects
  saveProject: (name: string) => void
  loadProject: (id: string) => void
  deleteProject: (id: string) => void

  // UI
  setShowProjectsModal: (show: boolean) => void
  setShowImageModal: (show: boolean) => void

  // Reset
  reset: () => void
}
