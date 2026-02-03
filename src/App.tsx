import { Layout } from './components/Layout'
import { ToastContainer } from './components/ui'
import { ProjectsModal } from './components/ProjectsModal'
import { ImageGenerationModal } from './components/ImageGenerationModal'
import {
  Step1InputMethod,
  Step2ProductInfo,
  Step3SellingPoints,
  Step4GenerationOptions,
  Step5CopyResults,
} from './components/steps'
import { useAppStore } from './store/useAppStore'

function App() {
  const { currentStep } = useAppStore()

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1InputMethod />
      case 2:
        return <Step2ProductInfo />
      case 3:
        return <Step3SellingPoints />
      case 4:
        return <Step4GenerationOptions />
      case 5:
        return <Step5CopyResults />
      default:
        return <Step1InputMethod />
    }
  }

  return (
    <>
      <Layout>{renderStep()}</Layout>
      <ProjectsModal />
      <ImageGenerationModal />
      <ToastContainer />
    </>
  )
}

export default App
