/**
 * 文件下载，通过模拟A标签点击下载
 * @param fileName 文件名称
 * @param fileUrl 文件下载地址
 */
export const downloadFile = (fileName: string, fileUrl: string) => {
  const elink = document.createElement('a');
  elink.download = fileName;
  elink.style.display = 'none';
  elink.href = fileUrl;
  elink.target = '_blank';
  document.body.appendChild(elink);
  elink.click();
  URL.revokeObjectURL(elink.href);
  document.body.removeChild(elink);
};
