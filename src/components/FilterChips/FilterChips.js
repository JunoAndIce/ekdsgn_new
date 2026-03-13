import React from 'react';

const FilterChips = ({ activeCategory, onFilter }) => {
  const chips = [
    { label: 'All', value: 'all' },
    { label: 'Creative Direction', value: 'creative-direction' },
    { label: 'Graphic Design', value: 'graphic-design' },
    { label: 'Videography', value: 'videography' },
    { label: 'Logos', value: 'logos' },
  ];

  return (
    <div className="chips-row fade-in">
      {chips.map((chip) => (
        <button
          key={chip.value}
          className={`chip${activeCategory === chip.value ? ' active' : ''}`}
          onClick={() => onFilter(chip.value)}
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
};

export default FilterChips;
