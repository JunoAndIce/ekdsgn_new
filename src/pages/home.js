import React, { useEffect, useRef } from 'react';
import { useState } from 'react';
import '../assets/css/portfolio.css';
import Navbar from '../components/Navbar/Navbar';
import Hero from '../components/Hero/Hero';
import FilterChips from '../components/FilterChips/FilterChips';
import PortfolioSection from '../components/PortfolioSection/PortfolioSection';
import CardWide from '../components/cards/CardWide';
import Footer from '../components/Footer/Footer';
import Modal from '../components/Modal/Modal';
import { categoryDefinitions, projectsById, projectsBySection } from '../data/projects';
import { useMomentumDragScroll } from '../hooks/useMomentumDragScroll';

const Home = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [modalProjectId, setModalProjectId] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const mainRef = useRef(null);

  const openModal = (projectId) => {
    setModalProjectId(projectId);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const isCategoryVisible = (sectionId) => activeCategory === 'all' || activeCategory === sectionId;

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
  }, []);

  useMomentumDragScroll('.scroll-row', activeCategory);

  return (
    <>
      <Navbar />
      <main className="main" ref={mainRef}>
        <Hero onOpenModal={openModal} />

        <FilterChips
          sections={categoryDefinitions}
          activeCategory={activeCategory}
          onFilter={setActiveCategory}
        />

        {projectsBySection.map((section, index) => (
          <React.Fragment key={section.id}>
            {index > 0 ? <div className="section-divider"></div> : null}
            <PortfolioSection
              sectionId={section.id}
              emoji={section.emoji}
              title={section.label}
              hidden={!isCategoryVisible(section.id)}
            >
              {section.items.map((project) => (
                <CardWide key={`${section.id}-${project.id}`} project={project} onOpenModal={openModal} />
              ))}
            </PortfolioSection>
          </React.Fragment>
        ))}

        <Footer />
      </main>

      <Modal
        isOpen={modalOpen}
        project={projectsById[modalProjectId]}
        onClose={closeModal}
      />
    </>
  );
};

export default Home;
