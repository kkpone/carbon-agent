import I18N from '@src/lang/I18N';
import { useRequest } from 'ahooks';
import { Input, Popover, ConfigProvider } from 'antd';
import { debounce } from 'lodash-es';
import { FC, useEffect, useMemo, useState } from 'react';

import delSvg from './del.svg';
import styles from './index.module.less';
import searchSvg from './search.svg';
import {
  associateWordCcdb,
  ccdbSearchDel,
  ccdbSearchlist,
  EDelType,
  IDelSearch,
} from '../../service';

interface ISearchInputProps {
  initValue?: string;
  search?: (value: string) => void;
  autoFocus?: boolean;
  showTips?: boolean;
  placeholder?: string;
}

const { Search } = Input;

export const SearchInput: FC<ISearchInputProps> = props => {
  const {
    initValue = '',
    search,
    autoFocus = true,
    showTips = true,
    placeholder = I18N.ccdb.pleaseEnterTheKey,
  } = props;
  const [value, setValue] = useState(initValue);
  const [showPopover, setShowPopover] = useState(false);
  const onSearch = (e: string) => {
    setShowPopover(false);
    search?.(e);
  };

  const { data, run } = useRequest(ccdbSearchlist);
  const history = data?.data.data;

  const showHistory = useMemo(
    () => showPopover && value.length === 0,
    [showPopover, value],
  );
  const [AssociativeWord, SetAssociativeWord] = useState<string[]>([]);

  useEffect(() => {
    if (value.length === 0) {
      run();
    }
  }, [value.length, run]);
  const associative = useMemo(
    () =>
      debounce(async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!showTips) {
          return;
        }
        const { data: AssociativeList } = await associateWordCcdb({
          name: e.target.value,
        });
        SetAssociativeWord(AssociativeList.data);
      }, 300),
    [],
  );

  const del = async (delData: IDelSearch) => {
    await ccdbSearchDel(delData);
    run();
  };

  return (
    <div>
      <ConfigProvider
        theme={{
          token: {
            borderRadius: 8,
            controlHeightLG: 46,
          },
          components: {
            Button: {
              // colorPrimary: '#00b96b',
            },
            Input: {
              // colorPrimary: '#eb2f96',
            },
          },
        }}
      >
        <Popover
          overlayInnerStyle={{
            marginTop: '12px',
            marginLeft: '16px',
          }}
          style={{
            zIndex: 100,
            marginLeft: '10px',
          }}
          zIndex={100}
          open={
            showTips &&
            showPopover &&
            ((showHistory && Boolean(history?.length)) ||
              (!showHistory && AssociativeWord.length > 0))
          }
          onOpenChange={e => {
            if (!e) {
              setShowPopover(false);
            }
          }}
          placement='bottom'
          content={
            <div className={styles.contentWrapper}>
              {showHistory && (
                <div className={styles.historyWrapper}>
                  <div className={styles.historyHeader}>
                    <span className={styles.title}>
                      {I18N.ccdb.recentSearches}
                    </span>
                    <span
                      className={styles.clear}
                      onClick={() =>
                        del({
                          delType: EDelType.all,
                        })
                      }
                    >
                      {I18N.components.empty}
                    </span>
                  </div>
                  {history?.map(item => (
                    <div className={styles.historyItem}>
                      <div
                        className={styles.name}
                        onClick={() => {
                          setValue(item);
                          onSearch(item);
                          setShowPopover(false);
                        }}
                      >
                        {item}
                      </div>
                      <div
                        className={styles.del}
                        onClick={() =>
                          del({
                            delType: EDelType.word,
                            searchKeywords: item,
                          })
                        }
                      >
                        <img src={delSvg} alt='' />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {!showHistory && (
                <div>
                  {AssociativeWord.map(item => (
                    <div
                      key={item}
                      className={styles.AssociativeWord}
                      onClick={() => {
                        setValue(item);
                        onSearch(item);
                        setShowPopover(false);
                      }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </div>
          }
          arrow={false}
        >
          <Search
            style={{
              height: '48px',
              width: '736px',
              borderRadius: '12px',
            }}
            autoFocus={autoFocus}
            placeholder={placeholder}
            allowClear
            value={value}
            onChange={e => {
              setShowPopover(true);
              associative(e);
              setValue(e.target.value);
            }}
            onClick={() => setShowPopover(true)}
            // onFocus={() => setShowPopover(true)}
            // onBlur={}
            enterButton={
              <div className={styles.searchBtn}>
                <img src={searchSvg} alt='' />
                {I18N.components.search}
              </div>
            }
            size='large'
            onSearch={onSearch}
          />
        </Popover>
      </ConfigProvider>
    </div>
  );
};
