import React from 'react';

const PortfolioSection = ({ category, emoji, title, hidden, children }) => {
  return (
    <section
      className={`section fade-in${hidden ? ' hidden' : ''}`}
      data-category={category}
    >
      <div className="section-header">
        <div className="section-title">
          <span className="section-emoji-pill">{emoji}</span>
          {title}
        </div>
        <button className="section-see-all">See All</button>
      </div>
      <div className="scroll-row">
        {children}
      </div>
    </section>
  );
};

export default PortfolioSection;
