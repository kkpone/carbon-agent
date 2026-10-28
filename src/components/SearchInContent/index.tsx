import I18N from '@src/lang/I18N';
import { Input } from 'antd';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';

import down from './img/chevron-down.png';
import up from './img/chevron-up2.png';
import close from './img/close2.png';
import searchGr from './img/search-gr.png';
import search from './img/search.png';
import styles from './index.module.less';

const highlightClassName = '.highlighted';

function cancelHighlight() {
  const highlightedSpan = document.querySelectorAll(highlightClassName);
  highlightedSpan.forEach(item => {
    // eslint-disable-next-line no-param-reassign
    item.outerHTML = item.innerHTML;
  });
}

function scrollByIndex(index: number) {
  const highlightedSpan = document.querySelectorAll(highlightClassName);
  highlightedSpan[index]?.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
  });
}

function searchAndHighlight(searchText: string, contentId?: string) {
  cancelHighlight();
  const content = contentId
    ? document.getElementById(contentId)
    : document.body;
  const regex = new RegExp(searchText, 'gi');
  const matches: {
    node: ChildNode;
    match: RegExpMatchArray | null | undefined;
  }[] = [];

  // Iterate through all text nodes within the content element
  function traverseTextNodes(node: ChildNode | null | undefined) {
    if (node?.nodeType === 3) {
      // Node.TEXT_NODE
      const match = node.nodeValue?.match(regex);
      if (match) {
        matches.push({
          node,
          match,
        });
      }
    } else {
      for (let i = 0; i < (node?.childNodes.length || 0); i++) {
        traverseTextNodes(node?.childNodes[i]);
      }
    }
  }

  traverseTextNodes(content);
  matches.forEach((firstMatch, index) => {
    const span = document.createElement('span');
    span.innerHTML =
      firstMatch.node.nodeValue?.replace(
        regex,
        match =>
          `<span style="background-color: yellow; color: black"  class="highlighted">${match}</span>`,
      ) || '';
    firstMatch.node.parentNode?.replaceChild(span, firstMatch.node);

    // Scroll to the highlighted element
    if (index === 0) {
      scrollByIndex(0);
    }
  });
  return matches;
}

interface SearchInContentProps {
  /** 一个 dom 上的 id, 控制在这个区域内搜索, 不填默认取 body */
  contentId?: string;
}

export const SearchInContent: React.FC<SearchInContentProps> = props => {
  const { contentId } = props;
  const [searchText, setSearchText] = useState('');
  const [matchIndex, setMatchIndex] = useState(0);
  const [matchesNumber, setMatchesNumber] = useState(0);

  const [show, setShow] = useState(false);
  useEffect(() => {
    if (searchText.length === 0) {
      cancelHighlight();
      setMatchesNumber(0);
      return;
    }
    const matches = searchAndHighlight(searchText, contentId);
    setMatchIndex(0);
    setMatchesNumber(matches.length);
  }, [searchText, contentId]);

  useEffect(() => {
    if (searchText.length === 0) {
      cancelHighlight();
      return;
    }
    scrollByIndex(matchIndex);
  }, [matchIndex]);

  const next = () => {
    setMatchIndex(pre => {
      if (pre < matchesNumber - 1) {
        return pre + 1;
      }
      return 0;
    });
  };

  const clickPre = () => {
    setMatchIndex(pre => {
      if (pre > 0) {
        return pre - 1;
      }
      return 0;
    });
  };
  return (
    <div className={styles.wrapper}>
      <div
        className={classNames(styles.inputBox, {
          [styles.show]: show,
        })}
      >
        <div className={styles.content}>
          <div className={styles.left}>
            <img src={searchGr} alt='' />
            <Input
              placeholder={I18N.components.pleaseEnterSearch}
              bordered={false}
              onPressEnter={e => {
                if (
                  searchText ===
                  (e.target as unknown as { value: string }).value
                ) {
                  next();
                }
              }}
              value={searchText}
              defaultValue={searchText}
              onChange={e => setSearchText(e.target.value)}
            />
            {matchesNumber > 0 ? matchIndex + 1 : 0}/{matchesNumber}
          </div>
          <div className={styles.btn}>
            <div onClick={clickPre}>
              <img src={up} alt='' />
            </div>
            <div onClick={next}>
              <img src={down} alt='' />
            </div>
            <div
              onClick={() => {
                cancelHighlight();
                setShow(false);
                setSearchText('');
              }}
            >
              <img src={close} alt='' />
            </div>
          </div>
        </div>
      </div>
      <div
        className={styles.search}
        onClick={() => {
          cancelHighlight();
          setShow(true);
        }}
      >
        <img src={search} className={styles.searchImg} alt='' />
      </div>
    </div>
  );
};
