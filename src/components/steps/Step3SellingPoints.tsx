import { useState, useEffect } from 'react'
import { Sparkles, RefreshCw, Plus, X, ArrowLeft, ArrowRight, Loader2, Edit2 } from 'lucide-react'
import { Card, CardContent, Button, Input, Select, Textarea, Badge } from '../ui'
import { useAppStore } from '../../store/useAppStore'

const copyCountOptions = [
  { value: '5', label: '5개' },
  { value: '10', label: '10개' },
  { value: '15', label: '15개' },
  { value: '20', label: '20개' },
]

export function Step3SellingPoints() {
  const {
    sellingPoints,
    updateSellingPoint,
    addSellingPoint,
    removeSellingPoint,
    generateSellingPoints,
    isGeneratingSellingPoints,
    prevStep,
    nextStep,
  } = useAppStore()

  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    // Auto-generate selling points when entering this step
    if (sellingPoints.length === 0 && !isGeneratingSellingPoints) {
      generateSellingPoints()
    }
  }, [])

  const totalCopies = sellingPoints.reduce((sum, sp) => sum + sp.copyCount, 0)

  const handleRegenerate = async () => {
    await generateSellingPoints()
  }

  const handleEditToggle = (id: string) => {
    setEditingId(editingId === id ? null : id)
  }

  const canProceed = sellingPoints.length > 0 && sellingPoints.every(sp => sp.title.trim())

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          AI 소구점 추천
        </h1>
        <p className="text-gray-500">
          제품 분석 기반으로 3가지 소구점을 추천합니다. 수정하거나 직접 작성할 수 있습니다.
        </p>
      </div>

      {/* Loading State */}
      {isGeneratingSellingPoints && (
        <Card className="mb-6">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-gray-500">소구점을 분석 중입니다...</p>
          </CardContent>
        </Card>
      )}

      {/* Selling Points List */}
      {!isGeneratingSellingPoints && (
        <div className="space-y-4 mb-6">
          {sellingPoints.map((sp, index) => (
            <Card key={sp.id}>
              <CardContent>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500">
                      소구점 {index + 1}
                    </span>
                    <Badge variant="primary">
                      <Sparkles className="w-3 h-3 mr-1" />
                      AI 추천
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditToggle(sp.id)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    {sellingPoints.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSellingPoint(sp.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {editingId === sp.id ? (
                  <div className="space-y-3">
                    <Input
                      label="소구점 제목"
                      value={sp.title}
                      onChange={(e) =>
                        updateSellingPoint(sp.id, { title: e.target.value })
                      }
                      placeholder="예: 부위별 맞춤 케어"
                    />
                    <Textarea
                      label="설명"
                      value={sp.description}
                      onChange={(e) =>
                        updateSellingPoint(sp.id, { description: e.target.value })
                      }
                      placeholder="예: 이마/코/턱 등 부위별 집중 케어"
                      rows={2}
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setEditingId(null)}
                    >
                      완료
                    </Button>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {sp.title || '(제목 없음)'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {sp.description || '(설명 없음)'}
                    </p>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-sm text-gray-500">카피 개수</span>
                  <Select
                    options={copyCountOptions}
                    value={sp.copyCount.toString()}
                    onChange={(e) =>
                      updateSellingPoint(sp.id, {
                        copyCount: parseInt(e.target.value),
                      })
                    }
                    className="w-24"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Actions */}
      {!isGeneratingSellingPoints && (
        <div className="flex flex-wrap gap-3 mb-6">
          <Button variant="outline" onClick={addSellingPoint}>
            <Plus className="w-4 h-4 mr-2" />
            소구점 추가하기
          </Button>
          <Button
            variant="secondary"
            onClick={handleRegenerate}
            disabled={isGeneratingSellingPoints}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            소구점 재추천
          </Button>
        </div>
      )}

      {/* Total Count */}
      {!isGeneratingSellingPoints && (
        <Card className="mb-8 bg-gray-50 border-gray-200">
          <CardContent className="flex items-center justify-between py-4">
            <span className="text-sm font-medium text-gray-700">
              총 생성될 카피 개수
            </span>
            <span className="text-2xl font-bold text-primary">{totalCopies}개</span>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="secondary" onClick={prevStep}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          이전
        </Button>
        <Button
          onClick={nextStep}
          disabled={!canProceed || isGeneratingSellingPoints}
        >
          다음 단계로
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
