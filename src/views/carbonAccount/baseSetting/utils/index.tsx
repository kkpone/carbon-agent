import I18N from '@src/lang/I18N';
import { ThemeDto } from '@src/sdks/java/carbonAccount';
import { addEllipsisToColumn } from '@src/utils';
import { ColumnsType } from 'antd/es/table';
import { Image } from 'antd';
import { Tags } from '@src/components/UI/Tags';

/** //是否开启二维码 0 否 1 是 */
const codeStatus = {
  0: I18N.carbonNeutral.no,
  1: I18N.carbonNeutral.yes,
};

/** 主题  */
export const themeColumns = (): ColumnsType<ThemeDto> =>
  addEllipsisToColumn([
    {
      title: I18N.carbonAccount.topicName,
      dataIndex: 'themeTitle',
    },
    {
      title: I18N.carbonAccount.sharingBackground,
      dataIndex: 'themeUrl',
      render(src) {
        return <Image src={src} height={60} />;
      },
    },
    {
      // "codeStatus": 0, //是否开启二维码 0 否 1 是
      title: I18N.carbonAccount.isTheSecondOptionEnabled,
      dataIndex: 'codeStatus',
      render(t) {
        return codeStatus[t] || '-';
      },
    },
    {
      title: I18N.carbonFootprint.state,
      dataIndex: 'checkStatus',
      render(t) {
        return +t === 1 ? (
          <Tags color='blue' tagText={I18N.carbonAccount.inUse} />
        ) : (
          <Tags color='default' tagText={I18N.carbonAccount.notUsed} />
        );
      },
    },
  ]);
