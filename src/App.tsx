import { Routes, Route } from 'react-router-dom'
import { RegistrationPage } from '@/pages/RegistrationPage';
import { GalleryPage } from '@/pages/GalleryPage';


const App = () => {
  return (
    <Routes>
      {/* Registration flow - standalone pages */}
      <Route path="/" element={<RegistrationPage />} />
      <Route path="/register" element={<RegistrationPage />} />
      <Route path="/event/:slug/register" element={<RegistrationPage />} />
      
      {/* Gallery pages - standalone without layout */}
      <Route path="/u/:code" element={<GalleryPage />} />

    </Routes>
  )
}

export default App 