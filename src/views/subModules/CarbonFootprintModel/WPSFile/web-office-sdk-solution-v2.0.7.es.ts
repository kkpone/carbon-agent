const WebOfficeSDK: any = {
  init: () => ({
    ready: () => Promise.resolve(),
    destroy: () => {},
    ApiEvent: { AddApiEventListener: () => {} },
  }),
};
export default WebOfficeSDK;
