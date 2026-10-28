/**
 * 活动数据的查看页面的详情
 * @returns
 */
import { checkPermissions } from '@src/components/Permission/utils';
import I18N from '@src/lang/I18N';
import { Toast } from '@src/utils/Toast';
import { Input, Image, Button, Modal } from 'antd';
import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import '../../../index.less';
import { RouteMaps } from '@/router/route-paths';

import {
  ApicarbonAccountActiveDataRecordingDetailGet,
  ApicarbonAccountRevocation,
} from '../service';
import { CarbonAccountActiveDataItemDetail } from '../type';

const { TextArea } = Input;
const CarbonAccountActiveDataRecordingDetail = () => {
  const history = useHistory();

  const { id } = useParams<{ id: string }>();
  /** 撤销碳币的弹框 */
  const [revocationModel, setRevocationModel] = useState<boolean>(false);
  /** 撤销框当前输入的值 */
  const [revocationInput, setRevocationInput] = useState<string>();
  /** 撤销碳币弹框的点击确认事件loading状态 */
  const [revocationBtnLoading, setRevocationBtnLoading] =
    useState<boolean>(false);
  /** 撤销和查看当前选中的数据 */
  const [editModelItem, setEditModelItem] =
    useState<CarbonAccountActiveDataItemDetail>();
  /** 确认撤销按钮点击 */
  const revocationOk = async () => {
    if (!editModelItem) return;
    setRevocationBtnLoading(true);
    const res = await ApicarbonAccountRevocation({
      id: editModelItem.id,
      reason: revocationInput,
    });
    if (res.data.code === 200) {
      Toast('success', I18N.carbonAccount.revokeCarbonCoins2);
      setRevocationModel(false);
      history.push(RouteMaps.CarbonAccountActiveDataRecording);
    }
    setRevocationBtnLoading(false);
  };
  /** 根据id获取详情信息 */
  const initDetail = async () => {
    const res = await ApicarbonAccountActiveDataRecordingDetailGet({ id });
    if (res.data.code === 200) {
      setEditModelItem(res.data.data);
    }
  };
  /** 初始化 */
  const init = async () => {
    await initDetail();
  };
  useEffect(() => {
    init();
  }, []);
  return (
    <div style={{ marginBottom: 60 }} className='carbonAccount'>
      <div className='activeDataRecordingDeatil'>
        <div className='title'>{I18N.carbonAccount.userName}</div>
        <div className='mt10'>
          <Input
            value={editModelItem?.realName || I18N.carbonFootprint.unknown}
            disabled
          />
        </div>
        <div className='title'>{I18N.carbonFootprint.uploadImages}</div>
        <div className='mt10'>
          <Image.PreviewGroup>
            {editModelItem?.checkUrl && editModelItem?.checkUrl.length > 0 ? (
              editModelItem?.checkUrl.map(item => (
                <Image width={90} src={item} />
              ))
            ) : (
              <span>{I18N.DomesticVersion.nothing}</span>
            )}
          </Image.PreviewGroup>
        </div>

        <div className='title'>{I18N.carbonAccount.completionTime}</div>
        <div className='mt10'>
          <Input
            value={editModelItem?.behaviorTime || I18N.carbonFootprint.unknown}
            disabled
          />
        </div>
        <div className='title'>{I18N.carbonAccount.sceneName}</div>
        <div className='mt10'>
          <Input
            value={editModelItem?.sceneName || I18N.carbonFootprint.unknown}
            disabled
          />
        </div>
        <div className='title'>{I18N.carbonFootprint3.activityData}</div>
        <div className='mt10'>
          <Input
            value={
              `${editModelItem?.changeValue}${editModelItem?.sceneUnitName}` ||
              I18N.carbonFootprint.unknown
            }
            disabled
          />
        </div>
        <div className='title'>{I18N.carbonFootprint.state}</div>
        <div className='mt10'>
          {editModelItem?.behaviorStatus === 0 ? (
            <>
              <span>{I18N.carbonAccount.unremoved}</span>
              {checkPermissions(
                <Button
                  style={{ marginLeft: 20 }}
                  type='primary'
                  onClick={() => setRevocationModel(true)}
                >
                  {I18N.carbonAccount.revoke}
                </Button>,
                'carbonAccount:behavior:rollback',
              )}
            </>
          ) : (
            <span>{I18N.carbonAccount.rescinded}</span>
          )}
        </div>
      </div>
      <div className='footerbtn'>
        <Button
          onClick={() => {
            history.push(RouteMaps.CarbonAccountActiveDataRecording);
          }}
        >
          {I18N.carbonFootprint.return}
        </Button>
      </div>
      <div>
        <Modal
          title={I18N.carbonAccount.revokeCarbonCoins}
          open={revocationModel}
          maskClosable={false}
          okButtonProps={{ loading: revocationBtnLoading }}
          onOk={revocationOk}
          onCancel={() => {
            setRevocationInput('');
            setRevocationModel(false);
          }}
        >
          <div>
            <div>{I18N.carbonAccount.afterRevocationThisTime}</div>
            <div style={{ marginTop: 10 }}>
              {I18N.carbonAccount.reasonForRevocation}
            </div>
            <div style={{ marginTop: 10 }}>
              <TextArea
                onChange={val => {
                  setRevocationInput(val.target.value);
                }}
                rows={4}
                placeholder={I18N.carbonAccount.pleaseEnterUndo}
              />
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default CarbonAccountActiveDataRecordingDetail;
