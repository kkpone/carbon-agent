import I18N from '@src/lang/I18N';
import { useEffect, useMemo, useState } from 'react';

import { icons } from '../constants';
import type { HomeSuggestion } from '../constants';
import style from '../index.module.less';
import { fetchHomeSuggestions } from '../service';

type NewChatHeroProps = {
  authenticated: boolean;
  disabled?: boolean;
  mobile?: boolean;
  onPromptSelect: (message: string) => void;
  scene?: string;
};

const getSuggestionRows = (suggestions: HomeSuggestion[]) => {
  const rows: HomeSuggestion[][] = [];

  for (let index = 0; index < suggestions.length; index += 2) {
    rows.push(suggestions.slice(index, index + 2));
  }

  return rows;
};

const NewChatHero = ({
  authenticated,
  disabled = false,
  mobile = false,
  onPromptSelect,
  scene,
}: NewChatHeroProps) => {
  const [suggestions, setSuggestions] = useState<HomeSuggestion[]>([]);

  useEffect(() => {
    let cancelled = false;

    setSuggestions([]);

    if (!authenticated || !scene) {
      return () => {
        cancelled = true;
      };
    }

    fetchHomeSuggestions({ scene })
      .then(nextSuggestions => {
        if (cancelled || nextSuggestions.length === 0) {
          return;
        }

        const seen = new Set<string>();
        setSuggestions(
          nextSuggestions.filter(item => {
            const key = `${item.scene || 'suggestion'}-${item.title}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          }),
        );
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [authenticated, scene]);

  const suggestionRows = useMemo(
    () => getSuggestionRows(suggestions),
    [suggestions],
  );

  return (
    <section className={style.hero}>
      <img className={style.aiIcon} src={icons.aiAssistant} alt='' />
      <div className={style.titleBlock}>
        <h1 className={style.newChatTitle}>
          <span>{I18N.carbonAgent.greetingHello}</span>
          <span className={style.titleGradientWrap}>
            <span className={style.titleGradient}>Carbon Agent</span>
            <span className={style.titleReveal} />
          </span>
        </h1>
        <p className={style.subtitle}>
          {mobile
            ? I18N.carbonAgent.newChatSubtitleMobile
            : I18N.carbonAgent.newChatSubtitle}
        </p>
      </div>

      <div
        className={style.promptArea}
        aria-label={I18N.carbonAgent.recommendedQuestions}
      >
        {suggestionRows.map(row => (
          <div
            className={style.promptRow}
            key={row.map(item => item.title).join('-')}
          >
            {row.map(item => (
              <button
                className={style.promptChip}
                key={`${item.scene || 'suggestion'}-${item.title}`}
                type='button'
                disabled={disabled}
                onClick={() => onPromptSelect(item.message)}
              >
                {item.title}
              </button>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
};

export default NewChatHero;
