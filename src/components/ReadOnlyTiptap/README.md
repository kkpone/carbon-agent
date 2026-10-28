# ReadOnlyTiptap 组件

一个基于 Tiptap 的只读 Markdown 渲染组件，用于在只读模式下展示 Markdown 格式的内容。

## 特性

- ✅ 只读模式，禁用所有编辑功能
- ✅ 支持完整的 Markdown 语法渲染
- ✅ 高性能，复用现有的 Tiptap 生态
- ✅ 继承父组件样式，保持 UI 一致性
- ✅ 支持占位符显示
- ✅ 禁用文本选择、拖拽等交互

## 使用方法

```tsx
import { ReadOnlyTiptap } from '@/components/ReadOnlyTiptap';

// 基础用法
<ReadOnlyTiptap content="# 标题\n这是 **粗体** 文本" />

// 带占位符
<ReadOnlyTiptap 
  content="" 
  showPlaceholder={true}
  placeholder="暂无内容"
/>

// 自定义样式
<ReadOnlyTiptap 
  content="Markdown 内容"
  className="custom-class"
/>
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| content | string | - | Markdown 内容 |
| className | string | - | 自定义样式类名 |
| showPlaceholder | boolean | false | 是否显示占位符 |
| placeholder | string | '暂无内容' | 占位符文本 |

## 支持的 Markdown 语法

- 标题 (h1-h6)
- 粗体、斜体、删除线
- 代码块和行内代码
- 列表（有序、无序、任务列表）
- 链接和图片
- 表格
- 引用块
- 分割线
- 高亮、上标、下标
- 文本对齐

## 性能优化

- 使用 `editable: false` 禁用编辑功能
- 复用现有的 Tiptap 扩展和配置
- 最小化 DOM 操作
- 支持内容缓存和更新优化 