import { Link2, PenLine, Lightbulb } from 'lucide-react'
import { Card, CardContent, Button } from '../ui'
import { useAppStore } from '../../store/useAppStore'
import type { InputMode } from '../../types'

const inputMethods = [
  {
    mode: 'url' as InputMode,
    icon: Link2,
    title: 'URL 분석',
    description: '랜딩페이지 URL만 입력하면 자동으로 제품 정보를 분석합니다.',
  },
  {
    mode: 'manual' as InputMode,
    icon: PenLine,
    title: '직접 입력',
    description: '제품 정보를 직접 작성하여 더 정확한 카피를 생성합니다.',
  },
]

const exampleTemplates = [
  { name: '뷰티/스킨케어', category: '뷰티/스킨케어' },
  { name: '헬스케어', category: '헬스/건강식품' },
  { name: '식품', category: '식품/음료' },
  { name: '패션', category: '패션/의류' },
  { name: '디지털', category: '디지털/가전' },
]

export function Step1InputMethod() {
  const { inputMode, setInputMode, nextStep, updateProductInfo } = useAppStore()

  const handleSelectMethod = (mode: InputMode) => {
    setInputMode(mode)
  }

  const handleLoadTemplate = (category: string) => {
    // Load example data based on category
    const templateData: Record<string, any> = {
      '뷰티/스킨케어': {
        name: '클린포어 모공 흡입기',
        category: '뷰티/스킨케어',
        salePrice: 49000,
        originalPrice: 98000,
        targetAge: ['20대', '30대'],
        targetGender: 'female' as const,
        features: ['3단계 흡입력 조절', 'USB 충전식', '5가지 교체형 헤드', '방수 기능'],
        promotion: '오늘만 특가 + 사은품 증정',
        customSellingPoints: [],
      },
      '헬스/건강식품': {
        name: '그린 프로틴 쉐이크',
        category: '헬스/건강식품',
        salePrice: 39000,
        originalPrice: 59000,
        targetAge: ['20대', '30대', '40대'],
        targetGender: 'all' as const,
        features: ['식물성 단백질 25g', '무설탕', '7가지 슈퍼푸드', '글루텐 프리'],
        promotion: '3개 구매시 1개 무료',
        customSellingPoints: [],
      },
      '식품/음료': {
        name: '프리미엄 콜드브루 원액',
        category: '식품/음료',
        salePrice: 25000,
        originalPrice: 35000,
        targetAge: ['20대', '30대'],
        targetGender: 'all' as const,
        features: ['100% 아라비카 원두', '12시간 저온 추출', '무첨가', '500ml 대용량'],
        promotion: '첫 구매 20% 할인',
        customSellingPoints: [],
      },
      '패션/의류': {
        name: '에어 쿨링 티셔츠',
        category: '패션/의류',
        salePrice: 29000,
        originalPrice: 45000,
        targetAge: ['20대', '30대', '40대'],
        targetGender: 'all' as const,
        features: ['냉감 소재', '속건성 기능', '신축성 우수', '자외선 차단'],
        promotion: '2+1 이벤트 진행 중',
        customSellingPoints: [],
      },
      '디지털/가전': {
        name: '미니 무선 가습기',
        category: '디지털/가전',
        salePrice: 35000,
        originalPrice: 55000,
        targetAge: ['20대', '30대', '40대'],
        targetGender: 'all' as const,
        features: ['무선 사용 가능', '7가지 무드등', '초음파 방식', '저소음 설계'],
        promotion: '무료 배송 + 필터 증정',
        customSellingPoints: [],
      },
    }

    const data = templateData[category]
    if (data) {
      updateProductInfo(data)
      setInputMode('manual')
      nextStep()
    }
  }

  const handleContinue = () => {
    nextStep()
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          광고 카피 생성 방법을 선택하세요
        </h1>
        <p className="text-gray-500">
          URL을 분석하거나 직접 입력하여 맞춤 광고 카피를 생성합니다.
        </p>
      </div>

      {/* Input Method Selection */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        {inputMethods.map((method) => (
          <Card
            key={method.mode}
            hover
            onClick={() => handleSelectMethod(method.mode)}
            className={
              inputMode === method.mode
                ? 'border-2 border-primary bg-primary/5'
                : ''
            }
          >
            <CardContent className="flex flex-col items-center text-center py-8">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${
                  inputMode === method.mode
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                <method.icon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {method.title}
              </h3>
              <p className="text-sm text-gray-500">{method.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Continue Button */}
      <div className="flex justify-center mb-12">
        <Button size="lg" onClick={handleContinue}>
          다음 단계로
        </Button>
      </div>

      {/* Example Templates */}
      <div className="border-t border-gray-200 pt-8">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-warning" />
          <h2 className="text-lg font-semibold text-gray-900">
            예시 템플릿 보기
          </h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          업종별 샘플 데이터로 빠르게 시작해 보세요.
        </p>
        <div className="flex flex-wrap gap-2">
          {exampleTemplates.map((template) => (
            <Button
              key={template.name}
              variant="outline"
              size="sm"
              onClick={() => handleLoadTemplate(template.category)}
            >
              {template.name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
