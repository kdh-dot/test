import { useEffect, useState } from 'react'
import {
  Copy,
  Download,
  RefreshCw,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react'
import { Modal, Button, RadioGroup, Checkbox, Select, showToast } from './ui'
import { useAppStore } from '../store/useAppStore'
import { copyToClipboard } from '../lib/utils'

const styleOptions = [
  { value: 'realistic', label: '실사 (제품 중심)', description: '전문적인 제품 사진' },
  { value: 'lifestyle', label: '라이프스타일 (사용 장면)', description: '실제 사용 모습' },
  { value: 'illustration', label: '일러스트', description: '그래픽 스타일' },
  { value: '3d', label: '3D 렌더링', description: '입체감 있는 표현' },
]

const sizeOptions = [
  { value: '1:1', label: '정사각형 (1:1) - 인스타 피드' },
  { value: '4:5', label: '세로형 (4:5) - 인스타 스토리' },
  { value: '16:9', label: '가로형 (16:9) - 유튜브 썸네일' },
]

const colorOptions = [
  { value: 'bright', label: '밝고 경쾌한', description: '활기찬 분위기' },
  { value: 'minimal', label: '깨끗하고 미니멀한', description: '모던한 느낌' },
  { value: 'luxury', label: '고급스러운', description: '프리미엄 감성' },
  { value: 'warm', label: '따뜻한', description: '편안한 분위기' },
]

const fontOptions = [
  { value: 'Pretendard Bold', label: 'Pretendard Bold' },
  { value: 'Noto Sans KR Bold', label: 'Noto Sans KR Bold' },
  { value: 'Spoqa Han Sans Bold', label: 'Spoqa Han Sans Bold' },
]

const positionOptions = [
  { value: 'top-center', label: '상단 중앙' },
  { value: 'center', label: '중앙' },
  { value: 'bottom-center', label: '하단 중앙' },
]

export function ImageGenerationModal() {
  const {
    showImageModal,
    setShowImageModal,
    selectedCopyId,
    copies,
    imageOptions,
    updateImageOptions,
    imagePrompt,
    generateImagePrompt,
    generatedImages,
    generateImages,
    isGeneratingImages,
  } = useAppStore()

  const selectedCopy = copies.find((c) => c.id === selectedCopyId)
  const [activeTab, setActiveTab] = useState<'options' | 'result'>('options')

  useEffect(() => {
    if (showImageModal && selectedCopy && !imagePrompt) {
      generateImagePrompt()
    }
  }, [showImageModal, selectedCopyId])

  const handleCopyPrompt = async (text: string) => {
    await copyToClipboard(text)
    showToast('success', '프롬프트가 복사되었습니다.')
  }

  const handleGenerateImages = async () => {
    await generateImages()
    setActiveTab('result')
  }

  const handleDownloadImage = (imageUrl: string, index: number) => {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `copyflow-image-${index + 1}.png`
    link.click()
    showToast('success', '이미지가 다운로드되었습니다.')
  }

  if (!selectedCopy) return null

  return (
    <Modal
      isOpen={showImageModal}
      onClose={() => setShowImageModal(false)}
      title="이미지 생성"
      size="xl"
    >
      <div className="max-h-[70vh] overflow-y-auto">
        {/* Selected Copy */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="text-sm font-medium text-gray-500 mb-2">선택한 카피</h4>
          <div className="space-y-1">
            <p className="font-semibold text-gray-900">메인: {selectedCopy.main}</p>
            <p className="text-gray-700">서브: {selectedCopy.sub}</p>
            <p className="text-primary">CTA: {selectedCopy.cta}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('options')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'options'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            스타일 설정
          </button>
          <button
            onClick={() => setActiveTab('result')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'result'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            생성된 이미지
          </button>
        </div>

        {activeTab === 'options' && (
          <div className="space-y-6">
            {/* Style */}
            <RadioGroup
              name="imageStyle"
              label="이미지 스타일"
              options={styleOptions}
              value={imageOptions.style}
              onChange={(value) =>
                updateImageOptions({ style: value as typeof imageOptions.style })
              }
            />

            {/* Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이미지 사이즈
              </label>
              <div className="grid grid-cols-3 gap-2">
                {sizeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() =>
                      updateImageOptions({ size: option.value as typeof imageOptions.size })
                    }
                    className={`p-3 rounded-lg border text-sm transition-colors ${
                      imageOptions.size === option.value
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Tone */}
            <RadioGroup
              name="colorTone"
              label="색상 톤"
              options={colorOptions}
              value={imageOptions.colorTone}
              onChange={(value) =>
                updateImageOptions({ colorTone: value as typeof imageOptions.colorTone })
              }
            />

            {/* Text Options */}
            <div className="space-y-4">
              <Checkbox
                label="이미지에 메인카피 자동 배치"
                checked={imageOptions.includeText}
                onChange={(checked) => updateImageOptions({ includeText: checked })}
              />

              {imageOptions.includeText && (
                <div className="grid grid-cols-2 gap-4 pl-7">
                  <Select
                    label="폰트"
                    options={fontOptions}
                    value={imageOptions.fontStyle}
                    onChange={(e) => updateImageOptions({ fontStyle: e.target.value })}
                  />
                  <Select
                    label="위치"
                    options={positionOptions}
                    value={imageOptions.textPosition}
                    onChange={(e) => updateImageOptions({ textPosition: e.target.value })}
                  />
                </div>
              )}
            </div>

            {/* Generated Prompt */}
            {imagePrompt && (
              <div className="space-y-4 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700">생성된 프롬프트</h3>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">영어</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyPrompt(imagePrompt.english)}
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        복사
                      </Button>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                      {imagePrompt.english}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">한국어</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyPrompt(imagePrompt.korean)}
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        복사
                      </Button>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                      {imagePrompt.korean}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Generate Button */}
            <div className="flex justify-end pt-4">
              <Button onClick={handleGenerateImages} isLoading={isGeneratingImages}>
                <ImageIcon className="w-4 h-4 mr-2" />
                이미지 생성하기
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'result' && (
          <div>
            {isGeneratingImages ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <p className="text-gray-500">이미지를 생성 중입니다...</p>
              </div>
            ) : generatedImages.length > 0 ? (
              <div className="space-y-6">
                {generatedImages.map((image, index) => (
                  <div key={index} className="space-y-3">
                    <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
                      <img
                        src={image}
                        alt={`Generated image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {imageOptions.includeText && (
                        <div
                          className={`absolute inset-x-0 ${
                            imageOptions.textPosition === 'top-center'
                              ? 'top-8'
                              : imageOptions.textPosition === 'center'
                              ? 'top-1/2 -translate-y-1/2'
                              : 'bottom-8'
                          } text-center`}
                        >
                          <p className="text-white text-xl font-bold drop-shadow-lg px-4">
                            {selectedCopy.main}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadImage(image, index)}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        다운로드
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleGenerateImages}
                      >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        다시 생성
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">아직 생성된 이미지가 없습니다.</p>
                <Button onClick={() => setActiveTab('options')}>
                  스타일 설정하고 생성하기
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}
