import I18N from '@src/lang/I18N';
import { connect, useField, useForm } from '@formily/react';
import { uuid } from '@src/utils';
import { FormItemStatus } from '@src/views/enterpriseCarbonAccount2/CdpAiAssistant/detail/components/type';
import { useMount } from 'ahooks';
import { Modal } from 'antd';
import classNames from 'classnames';
import { debounce, isNull, isUndefined } from 'lodash-es';
import Quill from 'quill';
import React, { useEffect, useRef, useState } from 'react';
import 'quill/dist/quill.core.css';
import 'quill/dist/quill.bubble.css';
import './index.css';
import { useLocation } from 'react-router-dom';

import { AiModal } from './components/Modal';
import expandSvg from './img/expand.svg';
import aiLogoSvg from './img/logo.svg';
import polishSvg from './img/polish.svg';
import summarySvg from './img/summary.svg';
import tipLogoSvg from './img/tipLogo.svg';
import styles from './index.module.less';
import { createReportData } from './service';

interface IAiTextAreaProps {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  title: string;
  initialValue?: { content: string };
  questionCode: string;
  questionStatus?: FormItemStatus;
  maxLength?: number;
}

const AiTextAreaComponent: React.FC<IAiTextAreaProps> = props => {
  const {
    value,
    disabled,
    onChange,
    title,
    initialValue,
    questionStatus,
    questionCode,
    maxLength,
  } = props;

  const [range, setRange] = useState<any>();
  const [selectText, setSelectText] = useState<string>('');
  const quillInstance = useRef<Quill>();
  const [update, setUpdate] = useState(0);
  const [id] = useState(uuid());
  const containerRef = useRef<HTMLElement>(null);
  const [modal1Open, setModal1Open] = useState(false);
  const [type, setType] = useState('');
  const [modalType, setModalType] = useState<'select' | 'tip'>('select');

  const form = useForm();
  const field = useField();

  const location = useLocation<{ reportId: string }>();

  const searchParams = new URLSearchParams(location.search);

  const reportId = Number(searchParams.get('reportId') || 0);

  useEffect(() => {
    const initValue = initialValue?.content;
    if (initValue) {
      quillInstance.current?.setText(initialValue?.content || '');
      // onChange?.(initValue);
      (field as any).setInitialValue(initValue);
    }
  }, [initialValue, update]);

  useEffect(() => {
    const defaultValue = value?.toString();
    if (defaultValue) {
      quillInstance.current?.setText(defaultValue);
    }
  }, [value, update]);

  useEffect(() => {
    quillInstance.current?.enable(!disabled);
  }, [disabled, update]);

  const debounceOnchange = debounce(async () => {
    const isInnerTable = form.values.formDisplay;
    const inputValue = quillInstance.current?.getText() || '';
    if (quillInstance.current?.getText() !== undefined) {
      if (isInnerTable) {
        onChange?.(quillInstance.current?.getText());
      } else {
        if (inputValue !== '\n') {
          field.setDecoratorProps({
            questionStatus: FormItemStatus.filled,
          });
        }
        await createReportData({
          questionId: field.props.name.toString(),
          questionCode,
          title,
          reportId,
          content: inputValue,
        });
      }
    }
  });

  useEffect(() => {
    if (!disabled && quillInstance?.current) {
      const rootElement = quillInstance?.current.root;

      rootElement.addEventListener('focus', () => {
        rootElement.classList.add('ql-container--focused');
      });

      rootElement.addEventListener('blur', () => {
        rootElement.classList.remove('ql-container--focused');
      });
    }
  }, [disabled, update]);

  useMount(() => {
    containerRef.current?.addEventListener(
      'blur',
      () => {
        debounceOnchange();
      },
      true,
    );
  });

  useEffect(() => {
    const container = containerRef.current;
    const editorContainer = container?.appendChild(
      container.ownerDocument.createElement('div'),
    );
    const quill = new Quill(editorContainer!, {
      theme: 'bubble',
      modules: {
        toolbar: `#toolbar${id}`,
      },
    });

    quillInstance.current = quill;

    if (questionStatus === FormItemStatus.generating) {
      setTimeout(() => {
        quill.disable();
        quill.container.style.cursor = 'not-allowed';
      }, 200);
    }

    setUpdate(pre => pre + 1);
    quill.on(Quill.events.TEXT_CHANGE, () => {
      if (
        !isUndefined(maxLength) &&
        !isNull(maxLength) &&
        quill.getLength() > maxLength
      ) {
        quill.deleteText(maxLength, quill.getLength());
      }
    });

    quill.on(Quill.events.SELECTION_CHANGE, (...args) => {
      setRange(args);
    });

    return () => {
      quill.setText('');
      quillInstance.current = undefined;
    };
  }, []);

  const [modalPosition, setModalPosition] = useState<{
    top?: number;
    left?: number;
  }>({ top: 20 });

  const pauseQuill = (
    quill: Quill,
    range: { index: number; length: number },
  ) => {
    const rootElement = quillInstance?.current?.root;
    rootElement?.classList.add('ql-container--focused');
    quill?.formatText(range, 'background', '#0cbf9f');
    quill?.formatText(range, 'color', '#fff');

    // 禁用编辑器事件处理
    quill?.disable();
  };

  const resumeQuill = (
    quill: Quill,
    range: { index: number; length: number },
  ) => {
    quill.formatText(range, 'background', '#fff');
    quill.formatText(range, 'color', '#000');
    quill.setSelection(range, 'user');
    quill.enable();
  };

  const setModalPositionCb = () => {
    const ele = document.getElementById(`toolbar${id}`);
    const rect = ele?.getBoundingClientRect();
    const halfWidth = window.innerWidth / 2;
    setModalPosition({
      top: rect?.top,
      left: (rect?.left || 0) - halfWidth,
    });
  };

  const showModal = async (type: string) => {
    setModalPositionCb();
    const selectedText =
      quillInstance.current?.getText(range[0]) ||
      quillInstance.current?.getText(range[1]);

    setSelectText(selectedText || '');

    const quill = quillInstance.current;
    if (quill) {
      setType(type);
      pauseQuill(quill, range[0] || range[1]);
    }
    setModalType('select');
    setModal1Open(true);
  };

  const hideModal = () => {
    const quill = quillInstance.current;
    if (quill && range?.[0]) {
      resumeQuill(quill, range?.[0]);
    }
    if (quill && range?.[1]) {
      resumeQuill(quill, range?.[1]);
    }
    setSelectText('');
    setModal1Open(false);
  };
  const aiFuncs = [
    {
      icon: polishSvg,
      title: I18N.components.polishing,
      type: 'polish',
    },
    {
      icon: summarySvg,
      title: I18N.components.summary,
      type: 'summary',
    },
    {
      icon: expandSvg,
      title: I18N.components.expansion,
      type: 'expand',
    },
  ];

  const insertText = (text: string) => {
    const insertIndex = range?.[1].index || 0;
    if (range?.[1]) {
      quillInstance.current?.deleteText(range?.[1]);
    }
    quillInstance.current?.insertText(insertIndex, text, 'api');
  };

  return (
    <div>
      <div
        ref={containerRef as any}
        className={classNames(styles.editWrapper, {
          [styles.disabled]: disabled,
        })}
      >
        <div id={`toolbar${id}`}>
          <div className={styles.toolbar}>
            <div className={styles.aiLogo}>
              <img src={aiLogoSvg} alt='' />
            </div>
            {aiFuncs.map(item => (
              <div
                key={item.type}
                className={styles.aiFunc}
                onClick={() => {
                  if (disabled) {
                    return;
                  }
                  showModal(item.type);
                }}
              >
                <img src={item.icon} alt='' />
              </div>
            ))}
          </div>
          <Modal
            style={{ top: modalPosition.top, left: modalPosition.left }}
            open={modal1Open}
            mask={false}
            width={720}
            maskClosable={false}
            onOk={() => hideModal()}
            onCancel={() => hideModal()}
            footer={null}
            styles={{
              body: { padding: 0 },
              content: { padding: 0 },
            }}
            closeIcon={null}
            destroyOnClose
            closable={false}
          >
            <AiModal
              selectText={selectText}
              close={() => hideModal()}
              type={type as any}
              modalType={modalType}
              insertText={text => insertText(text)}
            />
          </Modal>
        </div>
        <div className={styles.aiAssistant}>
          <div
            className={styles.inner}
            onClick={e => {
              if (disabled) {
                return;
              }
              setModalPosition(pre => ({ ...pre, top: e.clientY + 10 }));
              setModalType('tip');
              setModal1Open(true);
            }}
          >
            <img src={tipLogoSvg} alt='' />
          </div>
        </div>
      </div>
    </div>
  );
};

export const AiTextArea = connect(AiTextAreaComponent);
