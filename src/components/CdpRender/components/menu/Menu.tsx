import React, { useState } from 'react';

import { URender } from './components/URender';

interface MenuProps {
  // Add your props here
  question: any;
  language: string;
}

export const Menu: React.FC<MenuProps> = props => {
  // Add your component logic here
  const { question, language } = props;
  const [selectedKey, setSelectedKey] = useState(13303);
  // console.log(selectedKey, 'selectedKey')
  return (
    <ul
      id='formatted_responses__menu'
      className='formatted_responses__menu--climate-change'
    >
      {question.sections.map(section => (
        <URender
          key={section.section_id}
          selectedKey={selectedKey}
          innerSections={section.sections}
          info={section}
          language={language}
          setSelectedKey={setSelectedKey}
        />
      ))}
    </ul>
  );
};
