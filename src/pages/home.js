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
      let lastMoveTime = 0;
      let lastMoveX = 0;
      let scrollVelocity = 0;
      let inertiaFrameId = 0;
      let suppressClickUntil = 0;
      const dragThreshold = 6;
      const clickSuppressMs = 220;

      const markDragState = (dragging) => {
        row.classList.toggle('is-dragging', dragging);
        row.dataset.dragging = dragging ? 'true' : 'false';
      };

      const stopInertia = () => {
        if (inertiaFrameId) {
          window.cancelAnimationFrame(inertiaFrameId);
          inertiaFrameId = 0;
        }
      };

      const startInertia = () => {
        stopInertia();

        let velocity = scrollVelocity;
        let lastFrameTime = performance.now();

        const tick = (now) => {
          const frameDt = Math.min(34, now - lastFrameTime);
          lastFrameTime = now;

          if (Math.abs(velocity) < 0.02) {
            stopInertia();
            return;
          }

          const maxScrollLeft = row.scrollWidth - row.clientWidth;
          row.scrollLeft += velocity * frameDt;

          if ((row.scrollLeft <= 0 && velocity < 0) || (row.scrollLeft >= maxScrollLeft && velocity > 0)) {
            stopInertia();
            return;
          }

          velocity *= 0.92;
          inertiaFrameId = window.requestAnimationFrame(tick);
        };

        inertiaFrameId = window.requestAnimationFrame(tick);
      };

      const handlePointerDown = (event) => {
        if (event.pointerType === 'mouse' && event.button !== 0) {
          return;
        }

        if (row.scrollWidth <= row.clientWidth) {
          return;
        }

        stopInertia();

        isPointerDown = true;
        didDrag = false;
        startX = event.clientX;
        startScrollLeft = row.scrollLeft;
        lastMoveX = event.clientX;
        lastMoveTime = performance.now();
        scrollVelocity = 0;
        markDragState(false);

        if (typeof row.setPointerCapture === 'function') {
          row.setPointerCapture(event.pointerId);
        }

        event.preventDefault();
      };

      const handlePointerMove = (event) => {
        if (!isPointerDown) {
          return;
        }

        const deltaX = event.clientX - startX;
        const now = performance.now();
        const dt = Math.max(1, now - lastMoveTime);
        const dx = event.clientX - lastMoveX;

        if (Math.abs(deltaX) > dragThreshold) {
          didDrag = true;
          markDragState(true);
        }

        if (didDrag) {
          row.scrollLeft = startScrollLeft - deltaX;
          const pointerVelocity = dx / dt;
          const nextVelocity = -pointerVelocity;
          scrollVelocity = (scrollVelocity * 0.8) + (nextVelocity * 0.2);
          event.preventDefault();
        }

        lastMoveX = event.clientX;
        lastMoveTime = now;
      };

      const endPointerInteraction = (event) => {
        if (!isPointerDown) {
          return;
        }

        isPointerDown = false;

        if (event && typeof row.releasePointerCapture === 'function') {
          try {
            row.releasePointerCapture(event.pointerId);
          } catch (_error) {
            // No-op: pointer may already be released.
          }
        }

        if (didDrag) {
          suppressClickUntil = performance.now() + clickSuppressMs;
          markDragState(false);
          startInertia();
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
        if (performance.now() < suppressClickUntil || row.dataset.dragging === 'true') {
          event.preventDefault();
          event.stopPropagation();
        }
      };

      const handleDragStart = (event) => {
        event.preventDefault();
      };

      row.addEventListener('pointerdown', handlePointerDown);
      row.addEventListener('pointermove', handlePointerMove);
      row.addEventListener('pointerup', endPointerInteraction);
      row.addEventListener('pointercancel', endPointerInteraction);
      row.addEventListener('pointerleave', endPointerInteraction);
      row.addEventListener('wheel', handleWheel, { passive: false });
      row.addEventListener('click', handleClickCapture, true);
      row.addEventListener('dragstart', handleDragStart);

      return () => {
        stopInertia();
        row.removeEventListener('pointerdown', handlePointerDown);
        row.removeEventListener('pointermove', handlePointerMove);
        row.removeEventListener('pointerup', endPointerInteraction);
        row.removeEventListener('pointercancel', endPointerInteraction);
        row.removeEventListener('pointerleave', endPointerInteraction);
        row.removeEventListener('wheel', handleWheel);
        row.removeEventListener('click', handleClickCapture, true);
        row.removeEventListener('dragstart', handleDragStart);
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
