/**
 * @file 富文本编辑器
 */
import BraftEditor, {
  ControlType,
  BraftEditorProps as OriginalBraftEditorProps,
} from 'braft-editor';
import MaxLength from 'braft-extensions/dist/max-length';
import 'braft-editor/dist/index.css';
import { debounce } from 'lodash-es';

type BraftEditorProps = {
  onChange?: (value?: string) => void;
  /**
   * 最大可以输入的数量
   */
  max?: number;
  defaultValue?: string;
  changeControls?: (defaultControls: ControlType[]) => ControlType[];
} & Omit<OriginalBraftEditorProps, 'onChange' | 'defaultValue'>;

export const BraftEditorComponent = ({
  onChange,
  defaultValue,
  max,
  changeControls,
  ...props
}: BraftEditorProps) => {
  const editorProps = {
    contentFormat: 'html',
    style: { overflow: 'hidden' },
  };

  const defaultControls: ControlType[] = [
    'undo',
    'redo',
    'separator',
    'font-size',
    'superscript',
    'subscript',
    'remove-styles',
    'text-color',
    'bold',
    'italic',
    'underline',
    'strike-through',
    'separator',
    'text-align',
  ];
  const controls = changeControls?.(defaultControls) ?? defaultControls;
  BraftEditor.use(MaxLength({ defaultValue: max }));

  return (
    <BraftEditor
      key={defaultValue}
      {...{ ...editorProps, ...props }}
      controls={controls}
      // eslint-disable-next-line
      defaultValue={BraftEditor.createEditorState(defaultValue)}
      onChange={debounce(html => {
        // eslint-disable-next-line
        const val = html.toHTML() as string;
        onChange?.(val === '<p></p>' ? undefined : val);
      }, 500)}
    />
  );
};
