import { useState } from 'react'
import {
  Copy,
  Star,
  Download,
  Save,
  Image as ImageIcon,
  Filter,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, Button, Badge, showToast } from '../ui'
import { useAppStore } from '../../store/useAppStore'
import { copyToClipboard, downloadAsCSV } from '../../lib/utils'

type FilterType = 'all' | 'favorites'

export function Step5CopyResults() {
  const {
    sellingPoints,
    copies,
    toggleFavorite,
    selectCopyForImage,
    isGeneratingCopies,
    saveProject,
    productInfo,
  } = useAppStore()

  const [filter, setFilter] = useState<FilterType>('all')

  const filteredCopies =
    filter === 'favorites' ? copies.filter((c) => c.isFavorite) : copies

  const handleCopySingle = async (copy: typeof copies[0]) => {
    const text = `메인: ${copy.main}\n서브: ${copy.sub}\nCTA: ${copy.cta}`
    await copyToClipboard(text)
    showToast('success', '클립보드에 복사되었습니다.')
  }

  const handleCopyAll = async () => {
    const text = filteredCopies
      .map(
        (copy, index) =>
          `#${index + 1}\n메인: ${copy.main}\n서브: ${copy.sub}\nCTA: ${copy.cta}`
      )
      .join('\n\n---\n\n')
    await copyToClipboard(text)
    showToast('success', `${filteredCopies.length}개 카피가 복사되었습니다.`)
  }

  const handleExportExcel = () => {
    const data = filteredCopies.map((copy, index) => ({
      번호: `${index + 1}`,
      소구점: sellingPoints.find((sp) => sp.id === copy.sellingPointId)?.title || '',
      메인카피: copy.main,
      서브카피: copy.sub,
      CTA: copy.cta,
      후킹점수: copy.hookScore.toString(),
      직관성점수: copy.clarityScore.toString(),
      즐겨찾기: copy.isFavorite ? 'Y' : 'N',
    }))
    downloadAsCSV(data, `copyflow-${productInfo.name || 'copies'}-${new Date().toISOString().split('T')[0]}`)
    showToast('success', '엑셀 파일이 다운로드되었습니다.')
  }

  const handleSaveProject = () => {
    const projectName = productInfo.name
      ? `${productInfo.name} 캠페인`
      : `프로젝트 ${new Date().toLocaleDateString()}`
    saveProject(projectName)
    showToast('success', '프로젝트가 저장되었습니다.')
  }

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return 'text-green-600'
    if (score >= 4.0) return 'text-blue-600'
    if (score >= 3.5) return 'text-yellow-600'
    return 'text-gray-500'
  }

  const getScoreBar = (score: number) => {
    const filled = Math.round(score)
    const empty = 5 - filled
    return (
      <span className="font-mono text-xs">
        {'█'.repeat(filled)}
        {'░'.repeat(empty)}
      </span>
    )
  }

  if (isGeneratingCopies) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-16 h-16 text-primary animate-spin mb-6" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              카피를 생성 중입니다...
            </h2>
            <p className="text-gray-500">잠시만 기다려 주세요.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            생성 완료! {copies.length}개 카피
          </h1>
          <p className="text-gray-500 mt-1">
            마음에 드는 카피를 선택하고 이미지를 생성해 보세요.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleCopyAll}>
            <Copy className="w-4 h-4 mr-1" />
            전체 복사
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportExcel}>
            <Download className="w-4 h-4 mr-1" />
            엑셀 다운로드
          </Button>
          <Button variant="secondary" size="sm" onClick={handleSaveProject}>
            <Save className="w-4 h-4 mr-1" />
            프로젝트 저장
          </Button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-6">
        <Filter className="w-4 h-4 text-gray-500" />
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
            filter === 'all'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          전체 ({copies.length})
        </button>
        <button
          onClick={() => setFilter('favorites')}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
            filter === 'favorites'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          즐겨찾기 ({copies.filter((c) => c.isFavorite).length})
        </button>
      </div>

      {/* Results by Selling Point */}
      {sellingPoints.map((sp) => {
        const spCopies = filteredCopies.filter((c) => c.sellingPointId === sp.id)
        if (spCopies.length === 0) return null

        return (
          <div key={sp.id} className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <h2 className="text-lg font-semibold text-gray-900">
                {sp.title}
              </h2>
              <Badge variant="secondary">{spCopies.length}개</Badge>
            </div>

            <div className="space-y-4">
              {spCopies.map((copy) => (
                <Card key={copy.id}>
                  <CardContent>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-500">
                        #{filteredCopies.indexOf(copy) + 1}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star
                          className={`w-4 h-4 ${getScoreColor(copy.hookScore)}`}
                        />
                        <span className={`text-sm font-medium ${getScoreColor(copy.hookScore)}`}>
                          {copy.hookScore.toFixed(1)}/5
                        </span>
                      </div>
                    </div>

                    {/* Copy Content */}
                    <div className="space-y-2 mb-4">
                      <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">
                          메인
                        </span>
                        <p className="text-lg font-semibold text-gray-900">
                          {copy.main}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">
                          서브
                        </span>
                        <p className="text-gray-700">{copy.sub}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">
                          CTA
                        </span>
                        <p className="text-primary font-medium">{copy.cta}</p>
                      </div>
                    </div>

                    {/* Scores */}
                    <div className="flex gap-6 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-2">
                        <span>후킹력</span>
                        {getScoreBar(copy.hookScore)}
                      </div>
                      <div className="flex items-center gap-2">
                        <span>직관성</span>
                        {getScoreBar(copy.clarityScore)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopySingle(copy)}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        복사
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFavorite(copy.id)}
                        className={copy.isFavorite ? 'text-yellow-500' : ''}
                      >
                        <Star
                          className={`w-4 h-4 mr-1 ${
                            copy.isFavorite ? 'fill-yellow-500' : ''
                          }`}
                        />
                        즐겨찾기
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => selectCopyForImage(copy.id)}
                      >
                        <ImageIcon className="w-4 h-4 mr-1" />
                        이미지 생성
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )
      })}

      {filteredCopies.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">
              {filter === 'favorites'
                ? '즐겨찾기한 카피가 없습니다.'
                : '생성된 카피가 없습니다.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
