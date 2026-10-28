import React, { useState } from 'react';

import three from './three.svg';

interface MenuNode {
  title: string;
  key: string;
  children?: MenuNode[];
}

type URenderProps = {
  // Define your props here
  selectedKey: string;
  innerSections?: MenuNode[];
  info: MenuNode;
  // language: string;
  setSelectedKey: (id: string) => void;
};

export const URender: React.FC<URenderProps> = props => {
  // Component logic goes here
  const { selectedKey, innerSections, info, setSelectedKey } = props;
  const [checked, setChecked] = useState(false);

  const scroll = id => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    // JSX code goes here
    <li
      className={`section_formatted_responses_section_31558 ${
        selectedKey === info.key
          ? 'ndp_formated_response__menu_item--selected'
          : ''
      }`}
    >
      {innerSections && innerSections?.length > 0 && (
        <div
          className={checked ? 'toggle checked' : 'toggle'}
          onClick={() => setChecked(pre => !pre)}
        >
          <img src={three} alt='' />
        </div>
      )}
      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
      <a
        onClick={() => {
          setSelectedKey(info.key);
          scroll(info.key);
        }}
      >
        {info.title}
      </a>
      <ul className='inner' style={{ display: checked ? 'block' : 'none' }}>
        {innerSections?.map(section => (
          <URender
            key={section.key}
            selectedKey={selectedKey}
            innerSections={section.children}
            info={section}
            // language={language}
            setSelectedKey={setSelectedKey}
          />
        ))}
      </ul>
    </li>
  );
};
