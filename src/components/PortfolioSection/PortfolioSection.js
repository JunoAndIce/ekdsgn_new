import React from 'react';

const PortfolioSection = ({ sectionId, emoji, title, hidden, children }) => {
  return (
    <section className={`section fade-in${hidden ? ' hidden' : ''}`} data-category={sectionId}>
      <div className="section-header">
        <div className="section-title">
          <span className="section-emoji-pill">{emoji}</span>
          {title}
        </div>
      </div>
      <div className="scroll-row">{children}</div>
    </section>
  );
};

export default PortfolioSection;
