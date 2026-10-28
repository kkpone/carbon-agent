import { createTheme, ThemeProvider } from '@mui/material/styles';
import { FC, PropsWithChildren } from 'react';

const theme = createTheme({
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          height: '48px', // 设置高度
          borderRadius: '8px', // 设置圆角
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#aaa', // 聚焦后的边框颜色
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          transform: 'translate(20px, 14px)', // 设置 label 的初始位置
          '&.Mui-focused': {
            color: '#aaa', // 聚焦后的 label 颜色
          },
        },
        shrink: {
          transform: 'translate(20px, -6px) scale(0.75)', // 设置 label 收缩时的位置和缩放
        },
      },
    },
  },
});

interface IMaterialProviderProps {}

export const MaterialProvider: FC<
  PropsWithChildren<IMaterialProviderProps>
> = props => <ThemeProvider theme={theme}>{props.children}</ThemeProvider>;
