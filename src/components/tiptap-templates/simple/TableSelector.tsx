import I18N from '@src/lang/I18N';
import React, { useState } from 'react';
import styles from './TableSelector.module.less';

interface TableSelectorProps {
  maxRows?: number;
  maxCols?: number;
  onSelect: (rows: number, cols: number) => void;
}

const TableSelector: React.FC<TableSelectorProps> = ({
  maxRows = 10,
  maxCols = 10,
  onSelect,
}) => {
  const [hoveredRow, setHoveredRow] = useState(1);
  const [hoveredCol, setHoveredCol] = useState(1);

  // 计算当前要渲染的行列数，比 hover 多一行一列，但不超过最大
  const renderRows = Math.min(hoveredRow + 2, maxRows);
  const renderCols = Math.min(hoveredCol + 2, maxCols);

  return (
    <div className={styles.tableSelectorWrapper}>
      <div className={styles.label}>{I18N.components.insertTable}</div>
      <div className={styles.gridWrapper}>
        <table className={styles.gridTable}>
          <tbody>
            {Array.from({ length: renderRows }).map((_, row) => (
              <tr key={row}>
                {Array.from({ length: renderCols }).map((_, col) => (
                  <td
                    key={col}
                    className={
                      row <= hoveredRow && col <= hoveredCol
                        ? styles.selected
                        : ''
                    }
                    onMouseEnter={() => {
                      setHoveredRow(row);
                      setHoveredCol(col);
                    }}
                    onClick={() => onSelect(row + 1, col + 1)}
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.sizeLabel}>{`${hoveredRow + 1} x ${
        hoveredCol + 1
      }`}</div>
    </div>
  );
};

export default TableSelector;
