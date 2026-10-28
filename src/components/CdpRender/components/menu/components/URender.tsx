import React, { useState } from 'react';

import three from './three.svg';

type URenderProps = {
  // Define your props here
  selectedKey: number;
  innerSections: any[];
  info: any;
  language: string;
  setSelectedKey: (id: number) => void;
};

export const URender: React.FC<URenderProps> = props => {
  // Component logic goes here
  const { selectedKey, innerSections, info, language, setSelectedKey } = props;
  const [checked, setChecked] = useState(false);
  return (
    // JSX code goes here
    <li
      className={`section_formatted_responses_section_31558 ${
        selectedKey === info.section_id
          ? 'ndp_formated_response__menu_item--selected'
          : ''
      }`}
    >
      {innerSections?.length > 0 && (
        <div
          className={checked ? 'toggle checked' : 'toggle'}
          onClick={() => setChecked(pre => !pre)}
        >
          <img src={three} alt='' />
          {/* {checked ? '-' : '+'} */}
        </div>
      )}
      <a
        href={`#formatted_responses_section_${info.section_id}`}
        onClick={() => setSelectedKey(info.section_id)}
      >
        {info.title[language] || info.title.en}
      </a>
      <ul className='inner' style={{ display: checked ? 'block' : 'none' }}>
        {innerSections?.map(section => (
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
    </li>
  );
};
