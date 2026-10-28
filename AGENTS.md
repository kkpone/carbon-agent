禁止使用 npm run build 来校验代码。而是使用 npm run lint 来校验代码。

复制文本统一使用 `src/utils/clipboard.ts` 导出的 `copyToClipboard`，禁止直接引入
`copy-to-clipboard` 包或使用 `window.prompt` 作为复制兜底。

如果复制内容需要先通过接口异步获取，必须在用户点击事件的同步调用栈内把
`Promise<string>` 直接传给 `copyToClipboard`，不要先 `await` 接口再调用，以兼容
Safari 的剪贴板权限限制。

测试环境登录可以直接使用手机号 18602353734 ，发送验证码以后使用验证码 000000 登录。

项目中禁止在页面直接写中文，必须使用现有的 i18n 方案进行国际化。