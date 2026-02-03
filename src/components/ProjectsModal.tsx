import { FolderOpen, Trash2, Copy, Calendar } from 'lucide-react'
import { Modal, Button, Card, CardContent } from './ui'
import { useAppStore } from '../store/useAppStore'

export function ProjectsModal() {
  const {
    showProjectsModal,
    setShowProjectsModal,
    projects,
    loadProject,
    deleteProject,
    reset,
  } = useAppStore()

  const handleNewProject = () => {
    reset()
    setShowProjectsModal(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <Modal
      isOpen={showProjectsModal}
      onClose={() => setShowProjectsModal(false)}
      title="내 프로젝트"
      size="lg"
    >
      <div className="space-y-4">
        {/* New Project Button */}
        <Button onClick={handleNewProject} className="w-full">
          + 새 프로젝트
        </Button>

        {/* Project List */}
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">저장된 프로젝트가 없습니다.</p>
            <p className="text-sm text-gray-400 mt-1">
              카피 생성 후 프로젝트를 저장해 보세요.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {projects
              .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
              .map((project) => (
                <Card key={project.id} className="hover:border-primary/50 transition-colors">
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <FolderOpen className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{project.name}</h3>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(project.updatedAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Copy className="w-3 h-3" />
                            {project.copies.length}개 카피
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => loadProject(project.id)}
                      >
                        열기
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm('프로젝트를 삭제하시겠습니까?')) {
                            deleteProject(project.id)
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </div>
    </Modal>
  )
}
