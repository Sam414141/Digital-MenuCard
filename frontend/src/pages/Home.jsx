import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import '../styles/Home.css';

export default function Home(){
    return(
        <>
        <Navbar/>
        <div className="home-container"> 
      {/* Hero Section */}
      <div className="hero">
        <h1>Welcome to Majestic Manor</h1>
        <p>Experience luxury dining and premium hospitality</p>
        <button className="btn-primary" ><Link to="/menu" className="btn-primary">View Menu</Link></button>
      </div>

      {/* Hotel Highlights */}
      <section className="highlights">
        <h2>Hotel Highlights</h2>
        <div className="highlight-cards">
          <div className="card">
            <img src="../src/assets/HomeAssets/Luxurious_LivingArea.jpeg" alt="Luxurious Rooms" />
            <h3>Luxurious Living Area</h3>
            <p>Experience the comfort of our elegantly designed rooms.</p>
          </div>
          <div className="card">
            <img src="../src/assets/HomeAssets/Fine_Dining.jpeg" alt="Fine Dining" />
            <h3>Fine Dining</h3>
            <p>Enjoy world-class cuisines crafted by top chefs.</p>
          </div>
          <div className="card">
            <img src="../src/assets/HomeAssets/MenuCard_System.jpg" alt="Digital" />
            <h3>Digital MenuCard System</h3>
            <p>A digital menu card system enables online ordering and payments.</p>
          </div>
        </div>
      </section>

      {/* Exclusive Offers */}
      <section className="offers">
        <h2>Exclusive Offers</h2>
        <p>Get up to 20% off on your first online order!</p>
        <button className="btn-primary">Claim Offer</button>
      </section>

      {/* Services & Extra Services */}
      <section className="services">
        <h2>Our Services</h2>
        <div className="service-card">
          <img src="../src/assets/HomeAssets/serviceImage.jpeg" alt="Dining Service" />
          <h3>24/7 Dining Service</h3>
          <p>Enjoy round-the-clock Dining service.</p>
        </div>
      </section>

      {/* Scenic Spots & Attractions */}
      <section className="attractions">
        <h2>Scenic Spots & Nearby Attractions</h2>
        <div className="attraction-list">
          <div className="spot">
            <img src="../src/assets/HomeAssets/Stunning_Beach_View.jpeg" alt="Beach View" />
            <h3>Stunning Beach View</h3>
            <p>Relax by the breathtaking beach just minutes away.</p>
          </div>
          <div className="spot">
            <img src="../src/assets/HomeAssets/Adventure_Mountain_Trails.jpeg" alt="Mountain Trails" />
            <h3>Adventure Mountain Trails</h3>
            <p>Explore scenic hiking trails with mesmerizing views.</p>
          </div>
        </div>
      </section>
    </div>
    <Footer/>
        </>
    )
}