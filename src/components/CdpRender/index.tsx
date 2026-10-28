import React from 'react';

import { GridRender } from './components/GridRender';
import { MdRepeater } from './components/MdRepeater';
import { RadioRender } from './components/RadioRender';
import { Repeater } from './components/Repeater';
import { RtQuestion } from './components/RtQuestion';
import { TableRender } from './components/TableRender';
import { Menu } from './components/menu/Menu';
import './cdp.css';
import styles from './index.module.less';

interface CdpRenderProps {
  reportData: any;
}

export const CdpRender: React.FC<CdpRenderProps> = props => {
  const json = props.reportData as any;

  if (!json) {
    return <div />;
  }
  const { default_language } = json;
  return (
    <div className={styles.wrapper}>
      <div className={styles.ulWrapper}>
        <Menu question={json} language={default_language} />
      </div>
      <div>
        <section
          id='formatted_responses_ndp__container'
          className='ndp_formatted_response--climate-change'
        >
          <h1 className='ndp_formatted_response__header'>
            {json.discloser_name}-{json.questionnaire.name}
          </h1>
          {json.sections.map(section => (
            <section
              className='ndp_formatted_response__section'
              key={section.section_id}
              id={`formatted_responses_section_${section.section_id}`}
            >
              <h2 className='ndp_formatted_response__header'>
                {section.title[default_language]}
              </h2>
              <hr />
              {section.sections.map(innerSection => (
                <section
                  className='ndp_formatted_response__section'
                  key={innerSection.section_id}
                  id={`formatted_responses_section_${innerSection.section_id}`}
                >
                  <h2 className='ndp_formatted_response__header'>
                    {innerSection.title[default_language]}
                  </h2>
                  <hr />
                  {innerSection.questions.map(question => {
                    switch (question.type) {
                      case 'rtquestion':
                        return (
                          <RtQuestion
                            key={question.question_id}
                            question={question}
                            default_language={default_language}
                          />
                        );
                      case 'matrixset':
                        if (question.display_type === 'repeater') {
                          return (
                            <Repeater
                              key={question.question_id}
                              question={question}
                              language={default_language}
                            />
                          );
                        }
                        if (question.display_type === 'grid') {
                          return (
                            <GridRender
                              key={question.question_id}
                              question={question}
                              language={default_language}
                            />
                          );
                        }

                        return null;
                      case 'checkbox':
                        return (
                          <RadioRender
                            key={question.question_id}
                            question={question}
                            language={default_language}
                          />
                        );
                      case 'radio':
                        return (
                          <RadioRender
                            key={question.question_id}
                            question={question}
                            language={default_language}
                          />
                        );
                      case 'matrixdynamic':
                        if (question.display_type === 'repeater') {
                          return (
                            <MdRepeater
                              key={question.question_id}
                              question={question}
                              language={default_language}
                            />
                          );
                        }
                        if (question.display_type === 'grid') {
                          return (
                            <TableRender
                              key={question.question_id}
                              question={question}
                              language={default_language}
                            />
                          );
                        }
                        return null;

                      default:
                        return null;
                    }
                  })}
                </section>
              ))}
            </section>
          ))}
        </section>
      </div>
    </div>
  );
};
