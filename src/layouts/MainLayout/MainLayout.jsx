import { Outlet } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import EmergencyTicker from '../../components/EmergencyTicker'
import QuickReportWidget from '../../components/QuickReportWidget'
import AIChatbot from '../../components/AIChatbot'
import ScrollToTop from '../../components/ScrollToTop'

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col font-inter">
      <ScrollToTop />
      {/* Fixed Navbar sits at top on its own */}
      <Navbar />
      {/* EmergencyTicker appears below the fixed navbar without overlapping */}
      <div className="fixed left-0 right-0 z-[55]" style={{ top: '73px' }}>
        <EmergencyTicker />
      </div>
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <QuickReportWidget />
      <AIChatbot />
    </div>
  )
}

export default MainLayout
