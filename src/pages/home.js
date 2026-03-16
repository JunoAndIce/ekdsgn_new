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

  useEffect(() => {
    const rows = Array.from(document.querySelectorAll('.scroll-row'));
    const removeHandlers = rows.map((row) => {
      let isPointerDown = false;
      let didDrag = false;
      let startX = 0;
      let startScrollLeft = 0;

      const markDragState = (dragging) => {
        row.classList.toggle('is-dragging', dragging);
        row.dataset.dragging = dragging ? 'true' : 'false';
      };

      const handlePointerDown = (event) => {
        if (event.button !== 0) {
          return;
        }

        isPointerDown = true;
        didDrag = false;
        startX = event.clientX;
        startScrollLeft = row.scrollLeft;
        markDragState(false);
      };

      const handlePointerMove = (event) => {
        if (!isPointerDown) {
          return;
        }

        const deltaX = event.clientX - startX;

        if (Math.abs(deltaX) > 4) {
          didDrag = true;
          markDragState(true);
        }

        if (didDrag) {
          row.scrollLeft = startScrollLeft - deltaX;
          event.preventDefault();
        }
      };

      const endPointerInteraction = () => {
        if (!isPointerDown) {
          return;
        }

        isPointerDown = false;

        if (didDrag) {
          window.setTimeout(() => {
            markDragState(false);
          }, 120);
        } else {
          markDragState(false);
        }
      };

      const handleWheel = (event) => {
        if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
          return;
        }

        row.scrollLeft += event.deltaY;
        event.preventDefault();
      };

      const handleClickCapture = (event) => {
        if (row.dataset.dragging === 'true') {
          event.preventDefault();
          event.stopPropagation();
        }
      };

      row.addEventListener('pointerdown', handlePointerDown);
      row.addEventListener('pointermove', handlePointerMove);
      row.addEventListener('pointerup', endPointerInteraction);
      row.addEventListener('pointercancel', endPointerInteraction);
      row.addEventListener('pointerleave', endPointerInteraction);
      row.addEventListener('wheel', handleWheel, { passive: false });
      row.addEventListener('click', handleClickCapture, true);

      return () => {
        row.removeEventListener('pointerdown', handlePointerDown);
        row.removeEventListener('pointermove', handlePointerMove);
        row.removeEventListener('pointerup', endPointerInteraction);
        row.removeEventListener('pointercancel', endPointerInteraction);
        row.removeEventListener('pointerleave', endPointerInteraction);
        row.removeEventListener('wheel', handleWheel);
        row.removeEventListener('click', handleClickCapture, true);
      };
    });

    return () => {
      removeHandlers.forEach((remove) => remove());
    };
  }, [activeCategory]);

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
