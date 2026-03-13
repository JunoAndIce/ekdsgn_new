import React, { useState, useEffect, useRef } from 'react';
import '../assets/css/portfolio.css';
import Navbar from '../components/Navbar/Navbar';
import Hero from '../components/Hero/Hero';
import FilterChips from '../components/FilterChips/FilterChips';
import PortfolioSection from '../components/PortfolioSection/PortfolioSection';
import CardWide from '../components/cards/CardWide';
import Footer from '../components/Footer/Footer';
import Modal from '../components/Modal/Modal';

const Home = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [modalKey, setModalKey] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = (key) => {
    setModalKey(key);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleFilter = (category) => {
    setActiveCategory(category);
  };

  // Intersection observer for fade-in elements
  const mainRef = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('visible');
        });
      },
      { threshold: 0.08 }
    );
    const targets = document.querySelectorAll('.fade-in');
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [activeCategory]);

  const isCategoryVisible = (cat) =>
    activeCategory === 'all' || activeCategory === cat;

  return (
    <>
      <Navbar />
      <main className="main" ref={mainRef}>
        <Hero onOpenModal={openModal} />

        <FilterChips activeCategory={activeCategory} onFilter={handleFilter} />

        {/* Creative Direction */}
        <PortfolioSection
          category="creative-direction"
          emoji="🎬"
          title="Creative Direction"
          hidden={!isCategoryVisible('creative-direction')}
        >
          <CardWide projectKey="bottega"  name="Bottega Desires"         meta="Fashion Campaign · 2024"  onOpenModal={openModal} />
          <CardWide projectKey="mcmurry"  name="McMurry University Football" meta="Creative Director · Current" onOpenModal={openModal} />
          <CardWide projectKey="select"   name="SelectQB Athletics"      meta="Brand · Campaign"         onOpenModal={openModal} />
          <CardWide projectKey="txst"     name="Texas State Football"    meta="Creative · Sports"        onOpenModal={openModal} />
          <CardWide projectKey="hwy6"     name="hwy6 Universe"           meta="Founder · CEO · 2023–"    onOpenModal={openModal} placeholderIcon="🛣️" placeholderClass="placeholder-hwy6" />
        </PortfolioSection>

        <div className="section-divider"></div>

        {/* Graphic Design */}
        <PortfolioSection
          category="graphic-design"
          emoji="✏️"
          title="Graphic Design"
          hidden={!isCategoryVisible('graphic-design')}
        >
          <CardWide projectKey="mcmurry"   name="McMurry FB"    meta="Sports Design"  onOpenModal={openModal} />
          <CardWide projectKey="select"    name="SelectQB"      meta="Brand Design"   onOpenModal={openModal} />
          <CardWide projectKey="txst"      name="Texas State"   meta="Athletics"      onOpenModal={openModal} />
          <CardWide projectKey="powerade"  name="Powerade"      meta="Campaign"       onOpenModal={openModal} placeholderIcon="⚡"  placeholderClass="placeholder-powerade" />
          <CardWide projectKey="alief"     name="Alief Taylor"  meta="Football"       onOpenModal={openModal} placeholderIcon="🏈" placeholderClass="placeholder-alief" />
          <CardWide projectKey="hightower" name="Hightower"     meta="Volleyball"     onOpenModal={openModal} placeholderIcon="🏐" placeholderClass="placeholder-fashion" />
          <CardWide projectKey="77studios" name="77studios"     meta="Studios"        onOpenModal={openModal}  />
          <CardWide projectKey="6athletics"name="6 Athletics"   meta="Athletics"      onOpenModal={openModal}  />
        </PortfolioSection>

        <div className="section-divider"></div>

        {/* Videography */}
        <PortfolioSection
          category="videography"
          emoji="📽️"
          title="Videography"
          hidden={!isCategoryVisible('videography')}
        >
          <CardWide projectKey="bottega" name="Bottega Desires"  meta="Fashion Film"    onOpenModal={openModal} />
          <CardWide projectKey="mcmurry" name="McMurry Football" meta="Hype Content"    onOpenModal={openModal} />
          <CardWide projectKey="select"  name="SelectQB"         meta="Athlete Film"    onOpenModal={openModal} />
          <CardWide projectKey="hwy6"    name="hwy6 Events"      meta="Event Coverage"  onOpenModal={openModal} placeholderIcon="🛣️" placeholderClass="placeholder-hwy6" />
          <CardWide projectKey="alief"   name="Alief Taylor"     meta="Game Day"        onOpenModal={openModal} placeholderIcon="📸" placeholderClass="placeholder-alief" />
        </PortfolioSection>

        <div className="section-divider"></div>

        {/* Logos */}
        <PortfolioSection
          category="logos"
          emoji="⬡"
          title="Logos"
          hidden={!isCategoryVisible('logos')}
        >
          <CardWide projectKey="eklogo"        name="EK Personal"    meta="Identity Mark"     onOpenModal={openModal} />
          <CardWide projectKey="hwy6logo"      name="hwy6"           meta="Brand Mark"        onOpenModal={openModal} />
          <CardWide projectKey="logocollection" name="6,000+ Logos"   meta="TheLogoCentral"    onOpenModal={openModal} />
          <CardWide projectKey="selectlogo"     name="SelectQB"       meta="Sport Identity"    onOpenModal={openModal} />
          <CardWide projectKey="fashion"        name="hwy6archives"   meta="Fashion Brand"     onOpenModal={openModal} />
        </PortfolioSection>

        <Footer />
      </main>

      <Modal isOpen={modalOpen} projectKey={modalKey} onClose={closeModal} />
    </>
  );
};

export default Home;
