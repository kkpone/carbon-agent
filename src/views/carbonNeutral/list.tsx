/**
 * @file 碳中和 购买记录
 * @author lijinhai
 */
import I18N from '@src/lang/I18N';
import { FC, useEffect, useState, useRef, createContext } from 'react';
import { useHistory } from 'react-router-dom';
import useSyncCallback from '@utils/useSyncCallback';
import html2canvas from 'html2canvas';
import { ModalBase } from '@src/components/UI/Modal';
import SearchTableList from './component/tableList';
import { creatColumns } from './columns';
import { apiOrdersRecords, RrecordObj } from './service';
import './style.less';
import style from './list.module.less';
import bg1 from './svg/bg@2x.png';
import logo from './svg/logo.png';
import closePng from './close.png';
import coverPng from './svg/cover.png';

export const AppContact: any = createContext({});
const GreenMeeting: FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const history = useHistory();
  const path = history.location.pathname;
  const [state, setState] = useState<{
    TablePage: { current: number; pageSize: number; total: number };
    pageName: string;
    addWord: string;
    tablList: RrecordObj[];
  }>({
    pageName:
      path === '/carbonNeutral/records'
        ? I18N.carbonNeutral.purchaseRecords
        : path === '/EnterpriseCarbonAccount/ConstructionManagement'
        ? I18N.carbonNeutral.buildingManagement
        : I18N.carbonNeutral.carbonAccountingReport,
    addWord:
      path === '/carbonNeutral/records'
        ? I18N.carbonNeutral.businessAccounting
        : path === '/EnterpriseCarbonAccount/ConstructionManagement'
        ? I18N.carbonNeutral.building
        : I18N.carbonNeutral.report,
    TablePage: {
      current: 1,
      pageSize: 10,
      total: 0,
    },
    tablList: [],
  });
  // const [IndexPage, setIndexPage] = useState(1);
  const [showLoading, setshowLoading] = useState(true);
  const [showImgs, setShowImg] = useState(false);
  // 查看图片
  const [showImg, changeShowImg] = useState(false);
  const [intergerPath, setIntergerPath] = useState('');

  // 控制新建建筑弹窗
  const [parmas, setParmas] = useState({
    page: 1,
    size: 10,
  });
  const [curentData, changeCurentData] = useState<Partial<RrecordObj>>({
    certNum: '',
    companyName: '',
    buyAmount: 0,
    createTime: '',
  });
  // 获取城市列表
  //
  // 判断 是否是编辑
  const getlist = async () => {
    try {
      await apiOrdersRecords(parmas).then(({ data }) => {
        setState({
          ...state,
          tablList: data.data.rows,
          TablePage: {
            ...state.TablePage,
            total: Number(data.data.total),
          },
        });
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
    }
    setshowLoading(false);
  };

  const syncCallbackFn = useSyncCallback(getlist);

  useEffect(() => {
    syncCallbackFn();
  }, []);

  const ShowInterger = record => {
    const ele: HTMLElement | null = document.getElementById('img');
    if (ele) {
      ele.style.transform = 'scale(1)';
    }
    // changeShowImg(true);
    setIntergerPath(record.certImgPath);
    setShowImg(true);
    changeCurentData({ ...record });
  };
  const creatImg = (type = 'chartBox') => {
    const ele: HTMLElement | null = document.getElementById(type);
    if (ele) {
      ele.style.transform = 'scale(2)';
      const downloadName = '';
      setTimeout(async () => {
        // @ts-ignore
        html2canvas(ele, {
          backgroundColor: null,
          scale: 2,
          logging: true, // 日志开关，便于查看html2canvas的内部执行流程
          width: 960, // dom 原始宽度
          height: 1358,
          useCORS: true, // 【重要】开启跨域配置
        }).then(
          async canvas => {
            const dataURL = canvas.toDataURL('image/png', '98');
            // Upload(dataURL, `${curentData.certNum}.png`);
            const downloadElement = document.createElement('a');
            downloadElement.style.display = 'none';
            downloadElement.download = downloadName;
            downloadElement.href = dataURL;
            downloadElement.click(); // 点击下载
            setshowLoading(false);
          },

          error => {
            // eslint-disable-next-line no-console
            console.log(error, 'error');
          },
        );
      }, 100);
    }
  };
  const downLoadINterger = record => {
    // changeCurentData({ ...record });
    // setshowLoading(true);
    const downloadName = record.goodsName;
    const downloadElement = document.createElement('a');
    downloadElement.style.display = 'none';
    downloadElement.download = downloadName;
    const href = record.certImgPath;
    downloadElement.href = href;
    downloadElement.target = '_blank';
    // console.log('downloadElement', downloadElement);

    downloadElement.click(); // 点击下载
    // downloadIamge(record.certImgPath, record.goodsName);
    return;
    creatImg('img');
  };
  // const downloadIamge = (downUrl, name) => {
  //   //下载地址和名字（时间戳）
  //   try {
  //     const image = new Image();
  //     // 解决跨域 Canvas 污染问题
  //     image.crossOrigin = 'Anonymous';
  //     image.onload = function () {
  //       const canvas = document.createElement('canvas');

  //       canvas.width = image.width;
  //       canvas.height = image.height;
  //       console.dir(canvas);
  //       const context = canvas.getContext('2d');
  //       context?.drawImage(image, 0, 0, image.width, image.height);
  //       const url = canvas.toDataURL('image/png'); //得到图片的base64编码数据
  //       const a = document.createElement('a'); // 生成一个a元素
  //       const event = new MouseEvent('click'); // 创建一个单击事件
  //       a.download = name; // 设置图片名称
  //       a.href = url; // 将生成的URL设置为a.href属性
  //       a.dispatchEvent(event); // 触发a的单击事件
  //     };
  //     image.src = downUrl;
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };
  const columns = creatColumns(state.pageName, {
    ShowInterger,
    downLoadINterger,
    TablePage: state.TablePage,
  });
  return (
    <div className={style.neutralWrapper}>
      <AppContact.Provider
        // eslint-disable-next-line react/jsx-no-constructed-context-values
        value={{
          state,
          setState,
        }}
      >
        <SearchTableList
          dataSource={state.tablList}
          page={state.TablePage}
          showLoading={showLoading}
          onchanage={e => {
            setState({ ...state, TablePage: e });
            setParmas({ ...parmas, size: e.pageSize, page: e.current });
            syncCallbackFn();
          }}
          columns={columns || []}
          rowKey='id'
        />
      </AppContact.Provider>
      <ModalBase
        footer={null}
        wrapClassName='carbon-neutral--main'
        className='carbon-neutral--main'
        zIndex={showImgs ? 20 : -2}
        closable={false}
        onCancel={() => setShowImg(false)}
        visible
        content={
          <img className='close' width={480} src={intergerPath} alt='' />
        }
      />
      {/* 图片查看功能 */}
      <ModalBase
        footer={null}
        wrapClassName='carbon-neutral--main'
        className='carbon-neutral--main'
        zIndex={showImg ? 20 : -2}
        closable={false}
        onCancel={() => changeShowImg(false)}
        visible
        content={
          <ul className='neutral-content'>
            <div ref={ref} id='img'>
              <img className='bgImg' src={bg1} alt='' />
              <img className='logoimg' src={logo} alt='' />
              <p className='show_modeltitle'>
                {I18N.carbonNeutral.carbonNeutralityCertificate}
              </p>
              {/* <div className='img-line'></div> */}
              <p className='img-number'>
                {I18N.template(I18N.carbonNeutral.certificateNumberC, {
                  val1: curentData.certNum,
                })}
              </p>
              <p className='img-text'>
                {I18N.carbonNeutral.carbonFootprintBasedOn}
              </p>
              <p className='img-text1'>
                {I18N.template(I18N.carbonNeutral.applicantCu, {
                  val1: curentData.companyName,
                })}
              </p>
              <p className='img-text2'>
                {I18N.template(I18N.carbonNeutral.sourceOfEmissionReduction, {
                  val1: curentData.goodsName,
                })}
              </p>
              <p className='img-text3'>
                {I18N.template(
                  I18N.carbonNeutral.carbonEmissionReductionCategory,
                  { val1: curentData.type },
                )}
              </p>
              <p className='img-text4'>
                {' '}
                {I18N.template(
                  I18N.carbonNeutral.carbonEmissionReductionInjection,
                  { val1: curentData.buyAmount },
                )}
              </p>
              <p className='img-text6'>
                {I18N.template(I18N.carbonNeutral.herebyCertifyThatC, {
                  val1: curentData.companyName,
                  val2: curentData.buyAmount,
                })}
              </p>
              {/* <img className='logoimg_bottom' src={require('./logo.png')} /> */}
              <p className='logoimg_bottom'>
                {I18N.carbonNeutral.authorizedRepresentativeSignature}
              </p>
              <p className='logoimg_bottom_right'>
                {I18N.template(I18N.carbonNeutral.certificateIssuanceTimeC, {
                  val1: curentData.payTime,
                })}
              </p>
              <img className='logoimg_bottom_1' src={coverPng} alt='' />
              {/*  eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
              <img
                className='close'
                src={closePng}
                onClick={() => {
                  changeShowImg(false);
                }}
                alt=''
              />
            </div>
          </ul>
        }
      />
    </div>
  );
};

export default GreenMeeting;
