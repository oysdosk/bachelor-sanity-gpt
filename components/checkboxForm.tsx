// CheckboxForm.tsx
import React, { useState } from 'react';

interface CheckboxFormProps {
  titles: string[];
  onSubmit: (selectedTitles: string[]) => void;
}

const CheckboxForm: React.FC<CheckboxFormProps> = ({ titles, onSubmit }) => {
  const [selectedOptions, setSelectedOptions] = useState(new Set<string>());

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;
    if (checked) {
      setSelectedOptions((prev) => new Set([...prev, value]));
    } else {
      setSelectedOptions((prev) => new Set([...prev].filter((item) => item !== value)));
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(Array.from(selectedOptions));
  };

  return (
    <form onSubmit={handleSubmit}>
      {titles.map((title, index) => (
        <label key={index}>
          <input
            type="checkbox"
            value={title}
            onChange={handleChange}
            checked={selectedOptions.has(title)}
          />
          {title}
        </label>
      ))}
      <button type="submit">Generate Articles</button>
    </form>
  );
};

export default CheckboxForm;
