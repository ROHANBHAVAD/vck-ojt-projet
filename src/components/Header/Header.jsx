import {Link} from 'react-router-dom'
import './Header.css';
const Header = () =>
{
     return(
        
           
        
        
        <div class="navlayout">
        <Header/>            
            <nav>
                <Link to ="/home">home</Link>
                <Link to="/about">aboute</Link>
                <Link to="/courses">Courses</Link>
                <Link to ="/contact">Contact</Link>
                <Link to="/admission">Apply Now</Link>                        
                
                 
            </nav>
        </div>
     )
}

export default Header;