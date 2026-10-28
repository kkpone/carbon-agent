/**
 * @file 标签
 */

import { Tag, TagProps, Typography } from 'antd';
import classNames from 'classnames';

import styles from './index.module.less';

type OtherTagProps = {
  kind?: 'raduis' | 'badge' | 'delete' | 'overlength';
  tagText: string;
};

type BaseTagProps = TagProps & OtherTagProps;
const { Text } = Typography;
export const Tags = ({ kind, className, ...props }: BaseTagProps) => {
  const getKind = (tagKinds: OtherTagProps['kind']) => {
    switch (tagKinds) {
      case 'raduis':
        return styles.radiusTags;
      case 'badge':
        return styles.badgeTags;
      case 'delete':
        return styles.deleteTags;
      default:
        return styles.baseTags;
    }
  };
  return (
    <Tag {...props} className={classNames(getKind(kind), className)}>
      <Text
        className={
          kind === 'overlength' ? styles.overlengthTags : styles.tagWord
        }
        ellipsis={kind === 'overlength' ? { tooltip: props.tagText } : false}
      >
        {props.tagText}
      </Text>
    </Tag>
  );
};
