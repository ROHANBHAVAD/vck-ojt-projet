import {Link} from 'react-router-dom'
import './Header.css';
const Header = () =>
{
     return(
        
        
        
        <div class="navlayout">
            
            <nav>
                <button class="hamburger-menu">
                    <span class="hamburger-icon"></span>
                    <span class="hamburger-icon"></span>
                    <span class="hamburger-icon"></span>
                </button>
                <nav class="drawer-nav ">
                    <button class="close-drawer-btn">
                        ✕</button><a class="nav-item" href="/" data-discover="true">Home</a>
                        <a class="nav-item" href="/about" data-discover="true">About</a>
                        <a class="nav-item" href="/courses" data-discover="true">Courses</a>
                        <a class="nav-item" href="/contact" data-discover="true">Contact</a>
                        <a class="nav-item btn primary-btn" href="/admissions" data-discover="true">Apply Now!</a>

                        
                 </nav>
                 
            </nav>
        </div>
     )
}

export default Header;