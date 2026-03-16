import React from 'react';

const FilterChips = ({ sections = [], activeCategory, onFilter }) => {
  const chips = [{ label: 'All', value: 'all' }, ...sections.map((section) => ({
    label: section.label,
    value: section.id,
  }))];

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
