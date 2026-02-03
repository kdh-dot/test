import { useState } from 'react'
import { ArrowLeft, Sparkles, Plus, X } from 'lucide-react'
import { Card, CardContent, Button, Input, RadioGroup, Checkbox } from '../ui'
import { useAppStore } from '../../store/useAppStore'
import type { ToneStyle, CopyLength, Platform } from '../../types'

const toneOptions = [
  { value: 'friendly', label: '친근한 (반말)', description: '20~30대 타깃에 효과적' },
  { value: 'professional', label: '세련된 (존댓말)', description: '대부분의 상황에 적합' },
  { value: 'expert', label: '전문적인', description: '신뢰감을 주는 톤' },
  { value: 'humorous', label: '유머러스한', description: '주목도를 높이는 톤' },
]

const lengthOptions = [
  { value: 'short', label: '짧고 강렬하게', description: '15자 이내' },
  { value: 'medium', label: '보통 (권장)', description: '20자 내외' },
  { value: 'long', label: '상세하게', description: '30자 내외' },
]

const platformOptions: { value: Platform; label: string }[] = [
  { value: 'meta', label: '메타 (인스타그램/페이스북)' },
  { value: 'google', label: '구글 검색광고' },
  { value: 'kakao', label: '카카오모먼트' },
  { value: 'naver', label: '네이버 파워링크' },
]

export function Step4GenerationOptions() {
  const { options, updateOptions, prevStep, nextStep, generateCopies, isGeneratingCopies } = useAppStore()

  const [newRequiredKeyword, setNewRequiredKeyword] = useState('')
  const [newForbiddenKeyword, setNewForbiddenKeyword] = useState('')

  const handlePlatformToggle = (platform: Platform) => {
    const newPlatforms = options.platforms.includes(platform)
      ? options.platforms.filter((p) => p !== platform)
      : [...options.platforms, platform]
    updateOptions({ platforms: newPlatforms })
  }

  const handleAddRequiredKeyword = () => {
    if (newRequiredKeyword.trim() && !options.requiredKeywords.includes(newRequiredKeyword.trim())) {
      updateOptions({
        requiredKeywords: [...options.requiredKeywords, newRequiredKeyword.trim()],
      })
      setNewRequiredKeyword('')
    }
  }

  const handleRemoveRequiredKeyword = (keyword: string) => {
    updateOptions({
      requiredKeywords: options.requiredKeywords.filter((k) => k !== keyword),
    })
  }

  const handleAddForbiddenKeyword = () => {
    if (newForbiddenKeyword.trim() && !options.forbiddenKeywords.includes(newForbiddenKeyword.trim())) {
      updateOptions({
        forbiddenKeywords: [...options.forbiddenKeywords, newForbiddenKeyword.trim()],
      })
      setNewForbiddenKeyword('')
    }
  }

  const handleRemoveForbiddenKeyword = (keyword: string) => {
    updateOptions({
      forbiddenKeywords: options.forbiddenKeywords.filter((k) => k !== keyword),
    })
  }

  const handleGenerate = async () => {
    await generateCopies()
    nextStep()
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          카피 생성 옵션 설정
        </h1>
        <p className="text-gray-500">
          원하는 스타일과 플랫폼에 맞는 카피를 생성합니다.
        </p>
      </div>

      <div className="space-y-6">
        {/* Tone */}
        <Card>
          <CardContent>
            <RadioGroup
              name="tone"
              label="톤앤매너"
              options={toneOptions}
              value={options.tone}
              onChange={(value) => updateOptions({ tone: value as ToneStyle })}
            />
          </CardContent>
        </Card>

        {/* Length */}
        <Card>
          <CardContent>
            <RadioGroup
              name="length"
              label="카피 스타일"
              options={lengthOptions}
              value={options.length}
              onChange={(value) => updateOptions({ length: value as CopyLength })}
            />
          </CardContent>
        </Card>

        {/* Platform */}
        <Card>
          <CardContent>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              광고 플랫폼 (복수 선택 가능)
            </h3>
            <div className="space-y-2">
              {platformOptions.map((platform) => (
                <Checkbox
                  key={platform.value}
                  label={platform.label}
                  checked={options.platforms.includes(platform.value)}
                  onChange={() => handlePlatformToggle(platform.value)}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Required Keywords */}
        <Card>
          <CardContent>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              필수 포함 키워드 (선택)
            </h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {options.requiredKeywords.map((keyword) => (
                <span
                  key={keyword}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                >
                  {keyword}
                  <button
                    onClick={() => handleRemoveRequiredKeyword(keyword)}
                    className="hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="키워드 입력"
                value={newRequiredKeyword}
                onChange={(e) => setNewRequiredKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddRequiredKeyword()}
              />
              <Button variant="outline" onClick={handleAddRequiredKeyword}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Forbidden Keywords */}
        <Card>
          <CardContent>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              금지 키워드 (선택)
            </h3>
            <p className="text-xs text-gray-500 mb-3">
              광고 심의 등으로 사용할 수 없는 키워드를 입력하세요.
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {options.forbiddenKeywords.map((keyword) => (
                <span
                  key={keyword}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm"
                >
                  {keyword}
                  <button
                    onClick={() => handleRemoveForbiddenKeyword(keyword)}
                    className="hover:bg-red-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="예: 완치, 치료, 100%"
                value={newForbiddenKeyword}
                onChange={(e) => setNewForbiddenKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddForbiddenKeyword()}
              />
              <Button variant="outline" onClick={handleAddForbiddenKeyword}>
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
        <Button onClick={handleGenerate} isLoading={isGeneratingCopies}>
          <Sparkles className="w-4 h-4 mr-2" />
          카피 생성 시작
        </Button>
      </div>
    </div>
  )
}
