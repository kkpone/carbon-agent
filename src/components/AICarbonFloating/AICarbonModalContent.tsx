import I18N from '@src/lang/I18N';
import {
  MessageOutlined,
  BarChartOutlined,
  EnvironmentOutlined,
  BulbOutlined,
  FileTextOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  List,
  Avatar,
  Space,
  Typography,
  Divider,
  Drawer,
} from 'antd';
import { FC } from 'react';
import styles from './modal.module.less';

const { Title, Paragraph } = Typography;

interface AICarbonModalContentProps {
  onStartChat?: () => void;
  onViewHelp?: () => void;
}

const AICarbonModalContent: FC<AICarbonModalContentProps> = ({
  onStartChat,
  onViewHelp,
}) => {
  const features = [
    {
      icon: <BarChartOutlined style={{ fontSize: 20, color: '#1890ff' }} />,
      title: I18N.components.carbonFootprintAnalysis,
      description: I18N.components.intelligentAnalysisOfYou,
    },
    {
      icon: <EnvironmentOutlined style={{ fontSize: 20, color: '#52c41a' }} />,
      title: I18N.carbonFootprint3.emissionReductionSuggestions,
      description: I18N.components.basedOnDataAnalysis,
    },
    {
      icon: <FileTextOutlined style={{ fontSize: 20, color: '#faad14' }} />,
      title: I18N.components.dataReport,
      description: I18N.components.generateProfessional,
    },
    {
      icon: <BulbOutlined style={{ fontSize: 20, color: '#722ed1' }} />,
      title: I18N.components.questionAnswering,
      description: I18N.components.onlineAnswerToCarbon,
    },
  ];

  return (
    <div className={styles.modalContent}>
      <Drawer
        title='Basic Drawer'
        placement='left'
        closable={false}
        width={346}
        // onClose={onClose}
        open={false}
        getContainer={false}
      >
        <p>Some contents...</p>
      </Drawer>
      {/* 头部介绍 */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Avatar
          size={64}
          style={{ backgroundColor: '#4FC3F7', marginBottom: 16 }}
          icon={<MessageOutlined style={{ fontSize: 32 }} />}
        />
        <Title level={3} style={{ marginBottom: 8 }}>
          {I18N.components.aiSmallCarbonAssistance}
        </Title>
        <Paragraph type='secondary'>
          {I18N.components.yourExclusiveCarbon}
        </Paragraph>
      </div>

      <Divider />

      {/* 功能列表 */}
      <Card title={I18N.components.coreFunctions} style={{ marginBottom: 24 }}>
        <List
          dataSource={features}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                avatar={item.icon}
                title={item.title}
                description={item.description}
              />
            </List.Item>
          )}
        />
      </Card>

      {/* 操作按钮 */}
      <Space direction='vertical' style={{ width: '100%' }}>
        <Button
          type='primary'
          size='large'
          block
          icon={<MessageOutlined />}
          onClick={onStartChat}
        >
          {I18N.components.startIntelligent}
        </Button>
        <Button
          size='large'
          block
          icon={<SettingOutlined />}
          onClick={onViewHelp}
        >
          {I18N.components.viewUsageHelp}
        </Button>
      </Space>

      {/* 底部信息 */}
      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <Paragraph type='secondary' style={{ fontSize: 12 }}>
          {I18N.components.versionBasedOnA}
        </Paragraph>
      </div>
    </div>
  );
};

export default AICarbonModalContent;
