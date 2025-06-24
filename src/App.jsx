import { Route ,BrowserRouter as Router ,Routes } from "react-router-dom";
import HomePage from "./pages/homePage";
import AboutPage from "./pages/aboutPage";
import CoursesPage from "./pages/coursesPage";
import ContactPage from "./pages/contactPage";
import './styles/pages.css'
import AdmissionPage from "./pages/admissionPage";
const App =() =>
{
  return(
    <div>
      <Router>
        <Routes>
           <Route path="/" element={<HomePage/>}/>
          <Route path="/home" element={<HomePage/>}/>
          <Route path="/about" element={<AboutPage/>}/>
          <Route path="/courses" element={<CoursesPage/>}/>
          <Route path="/contact" element={<ContactPage/>}/>
          <Route path="/admission" element={<AdmissionPage/>}/>   
         </Routes>
      </Router>
    </div>
  )
}
export default App;