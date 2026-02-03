import { useState } from 'react'
import { Plus, X, Loader2, ArrowLeft, ArrowRight, Search, Globe } from 'lucide-react'
import { Card, CardContent, Button, Input, Select } from '../ui'
import { useAppStore } from '../../store/useAppStore'
import { formatPrice, calculateDiscount } from '../../lib/utils'

const categories = [
  { value: '', label: '카테고리 선택' },
  { value: '뷰티/스킨케어', label: '뷰티/스킨케어' },
  { value: '헬스/건강식품', label: '헬스/건강식품' },
  { value: '식품/음료', label: '식품/음료' },
  { value: '패션/의류', label: '패션/의류' },
  { value: '디지털/가전', label: '디지털/가전' },
  { value: '생활용품', label: '생활용품' },
  { value: '교육/서비스', label: '교육/서비스' },
  { value: '기타', label: '기타' },
]

const ageOptions = ['10대', '20대', '30대', '40대', '50대', '60대 이상']

export function Step2ProductInfo() {
  const {
    inputMode,
    urlToAnalyze,
    setUrlToAnalyze,
    competitorUrls,
    addCompetitorUrl,
    removeCompetitorUrl,
    analyzeUrl,
    isAnalyzing,
    productInfo,
    updateProductInfo,
    addFeature,
    removeFeature,
    addCustomSellingPoint,
    removeCustomSellingPoint,
    prevStep,
    nextStep,
  } = useAppStore()

  const [newFeature, setNewFeature] = useState('')
  const [newSellingPoint, setNewSellingPoint] = useState('')
  const [newCompetitorUrl, setNewCompetitorUrl] = useState('')

  const handleAnalyze = async () => {
    if (!urlToAnalyze) return
    await analyzeUrl()
  }

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      addFeature(newFeature.trim())
      setNewFeature('')
    }
  }

  const handleAddSellingPoint = () => {
    if (newSellingPoint.trim()) {
      addCustomSellingPoint(newSellingPoint.trim())
      setNewSellingPoint('')
    }
  }

  const handleAddCompetitorUrl = () => {
    if (newCompetitorUrl.trim()) {
      addCompetitorUrl(newCompetitorUrl.trim())
      setNewCompetitorUrl('')
    }
  }

  const handleAgeToggle = (age: string) => {
    const newAges = productInfo.targetAge.includes(age)
      ? productInfo.targetAge.filter((a) => a !== age)
      : [...productInfo.targetAge, age]
    updateProductInfo({ targetAge: newAges })
  }

  const discount = calculateDiscount(productInfo.originalPrice, productInfo.salePrice)

  const canProceed =
    productInfo.name &&
    productInfo.category &&
    productInfo.salePrice > 0 &&
    productInfo.features.length > 0

  // URL Analysis Mode
  if (inputMode === 'url') {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            URL 자동 분석
          </h1>
          <p className="text-gray-500">
            랜딩페이지 URL을 입력하면 제품 정보를 자동으로 추출합니다.
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-5 h-5 text-primary" />
              <span className="font-medium text-gray-900">랜딩페이지 URL</span>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="https://example.com/product"
                value={urlToAnalyze}
                onChange={(e) => setUrlToAnalyze(e.target.value)}
              />
              <Button onClick={handleAnalyze} disabled={!urlToAnalyze || isAnalyzing}>
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    분석 중
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    분석
                  </>
                )}
              </Button>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  경쟁사 URL (선택사항)
                </span>
              </div>
              {competitorUrls.map((url, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input value={url} disabled className="bg-gray-50" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCompetitorUrl(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  placeholder="https://competitor.com"
                  value={newCompetitorUrl}
                  onChange={(e) => setNewCompetitorUrl(e.target.value)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddCompetitorUrl}
                  disabled={!newCompetitorUrl}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Show analyzed result if available */}
        {productInfo.name && (
          <Card className="mb-6">
            <CardContent>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">분석 결과</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">제품명</span>
                  <span className="font-medium">{productInfo.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">카테고리</span>
                  <span className="font-medium">{productInfo.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">가격</span>
                  <span className="font-medium">
                    {formatPrice(productInfo.salePrice)}
                    {productInfo.originalPrice > productInfo.salePrice && (
                      <span className="text-gray-400 line-through ml-2">
                        {formatPrice(productInfo.originalPrice)}
                      </span>
                    )}
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-100">
                  <span className="text-gray-500">주요 특징</span>
                  <ul className="mt-2 space-y-1">
                    {productInfo.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between">
          <Button variant="secondary" onClick={prevStep}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            이전
          </Button>
          <Button onClick={nextStep} disabled={!productInfo.name}>
            다음 단계로
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    )
  }

  // Manual Input Mode
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">제품 정보 입력</h1>
        <p className="text-gray-500">
          정확한 제품 정보를 입력할수록 더 좋은 카피가 생성됩니다.
        </p>
      </div>

      <div className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardContent className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">기본 정보</h3>

            <Input
              label="제품명 *"
              placeholder="예: 클린포어 모공 흡입기"
              value={productInfo.name}
              onChange={(e) => updateProductInfo({ name: e.target.value })}
            />

            <Select
              label="제품 카테고리 *"
              options={categories}
              value={productInfo.category}
              onChange={(e) => updateProductInfo({ category: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="판매가 *"
                type="number"
                placeholder="49000"
                value={productInfo.salePrice || ''}
                onChange={(e) =>
                  updateProductInfo({ salePrice: parseInt(e.target.value) || 0 })
                }
              />
              <Input
                label="정상가 (선택)"
                type="number"
                placeholder="98000"
                value={productInfo.originalPrice || ''}
                onChange={(e) =>
                  updateProductInfo({ originalPrice: parseInt(e.target.value) || 0 })
                }
              />
            </div>

            {discount > 0 && (
              <p className="text-sm text-success">할인율: {discount}%</p>
            )}
          </CardContent>
        </Card>

        {/* Target */}
        <Card>
          <CardContent className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">타깃 고객</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                연령대 (복수 선택 가능)
              </label>
              <div className="flex flex-wrap gap-2">
                {ageOptions.map((age) => (
                  <button
                    key={age}
                    onClick={() => handleAgeToggle(age)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      productInfo.targetAge.includes(age)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {age}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                성별
              </label>
              <div className="flex gap-4">
                {[
                  { value: 'male', label: '남성' },
                  { value: 'female', label: '여성' },
                  { value: 'all', label: '전체' },
                ].map((option) => (
                  <label key={option.value} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="gender"
                      value={option.value}
                      checked={productInfo.targetGender === option.value}
                      onChange={(e) =>
                        updateProductInfo({
                          targetGender: e.target.value as 'male' | 'female' | 'all',
                        })
                      }
                      className="w-4 h-4 text-primary"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardContent className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              주요 특징 (최대 5개) *
            </h3>

            <div className="space-y-2">
              {productInfo.features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg"
                >
                  <span className="flex-1 text-sm">{feature}</span>
                  <button
                    onClick={() => removeFeature(index)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              ))}
            </div>

            {productInfo.features.length < 5 && (
              <div className="flex gap-2">
                <Input
                  placeholder="예: 3단계 흡입력 조절"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddFeature()}
                />
                <Button variant="outline" onClick={handleAddFeature}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Promotion */}
        <Card>
          <CardContent className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">프로모션 정보 (선택)</h3>
            <Input
              placeholder="예: 오늘만 특가 + 사은품 증정"
              value={productInfo.promotion}
              onChange={(e) => updateProductInfo({ promotion: e.target.value })}
            />
          </CardContent>
        </Card>

        {/* Custom Selling Points */}
        <Card>
          <CardContent className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              소구점 직접 입력 (선택)
            </h3>
            <p className="text-sm text-gray-500">
              AI 추천 외에 강조하고 싶은 소구점이 있다면 입력하세요.
            </p>

            <div className="space-y-2">
              {productInfo.customSellingPoints.map((point, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg"
                >
                  <span className="flex-1 text-sm">{point}</span>
                  <button
                    onClick={() => removeCustomSellingPoint(index)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="예: 부위별 케어, 시술 대비 효과"
                value={newSellingPoint}
                onChange={(e) => setNewSellingPoint(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddSellingPoint()}
              />
              <Button variant="outline" onClick={handleAddSellingPoint}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <Button variant="secondary" onClick={prevStep}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          이전
        </Button>
        <Button onClick={nextStep} disabled={!canProceed}>
          다음 단계로
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
