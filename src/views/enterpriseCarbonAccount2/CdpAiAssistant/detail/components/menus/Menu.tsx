import I18N from '@src/lang/I18N';
import React, { useEffect, useState } from 'react';
import './cdp.css';

import closeSvg from './close.svg';
import { URender } from './components/URender';
import styles from './index.module.less';
import menuSvg from './menu.svg';

import classNames from 'classnames';

import { useCdpAiAssistant } from '../../context';

interface MenuNode {
  title: string;
  key: string;
  children?: MenuNode[];
}

interface MenuProps {
  // define your props here
  menu: MenuNode[];
}

export const Menu: React.FC<MenuProps> = props => {
  // Add your component logic here
  const { menu } = props;

  const [collapse, setCollapse] = useState(false);
  // console.log(question);
  const [selectedKey, setSelectedKey] = useState<string>(
    menu?.[0]?.title || '',
  );

  const { drawOpen } = useCdpAiAssistant();

  useEffect(() => {
    if (drawOpen) {
      setCollapse(true);
    } else {
      setCollapse(false);
    }
  }, [drawOpen]);
  // console.log(selectedKey, 'selectedKey')
  return (
    <div
      className={classNames(styles.wrapper, {
        [styles.collapsedWrapper]: collapse,
      })}
    >
      {/* your component code here */}
      <div
        className={classNames(styles.innerWrapper, {
          [styles.collapsedInner]: collapse,
        })}
      >
        <div className={styles.header}>
          <div className={styles.menu}>
            {I18N.enterpriseCarbonAccount2.catalogue}
          </div>
          <div className={styles.close} onClick={() => setCollapse(true)}>
            <img src={closeSvg} alt='' />
          </div>
        </div>
        <ul
          id='formatted_responses__menu'
          className='formatted_responses__menu--climate-change'
        >
          {menu.map(section => (
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
      </div>
      {collapse && (
        <div
          className={styles.collapseButton}
          onClick={() => setCollapse(pre => !pre)}
        >
          <img src={menuSvg} alt='' />
        </div>
      )}
    </div>
  );
};
