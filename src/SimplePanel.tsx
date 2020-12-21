import React from 'react';
import { PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';
import { css, cx } from 'emotion';
import { stylesFactory, useTheme } from '@grafana/ui';
import Chart from 'react-google-charts';

interface Props extends PanelProps<SimpleOptions> {}

export const SimplePanel: React.FC<Props> = ({ options, data, width, height }) => {
  const theme = useTheme();
  const styles = getStyles();
  let color: string;
  switch (options.color) {
    case 'red':
      color = theme.palette.redBase;
      break;
    case 'green':
      color = theme.palette.greenBase;
      break;
    case 'blue':
      color = theme.palette.blue95;
      break;
  }
  console.log(color);
  let graphData = [];
  let primariHeader = [];
  //console.log('fields', data.series[0]);

  let sourceIp: any;
  let sourceIpFlag = false;
  let destinationIp: any;
  let destinationIpFlag = false;
  let count: any;
  let countFlag = false;
  let extraSeries: any[] = [];

  data.series[0].fields.forEach((element, index) => {
    if (element.name === 'source.ip') {
      primariHeader[0] = element.name;
      sourceIp = element.values;
      sourceIpFlag = true;
    } else if (element.name === 'destination.ip') {
      primariHeader[1] = element.name;
      destinationIp = element.values;
      destinationIpFlag = true;
    } else if (element.name === 'Count') {
      primariHeader[2] = element.name;
      count = element.values;
      countFlag = true;
    } else {
      extraSeries.push(element);
    }
  });
  if (sourceIpFlag && destinationIpFlag && countFlag) {
    primariHeader[3] = { type: 'string', role: 'tooltip' };
    graphData.push(primariHeader);
    for (let index = 0; index < data.series[0].fields[0].values.length; index++) {
      const si = sourceIp.get(index);
      const di = destinationIp.get(index);
      const cn = count.get(index);
      const defdata = [si, di, cn];
      let tooltipText = '<div style="color:#000000; padding: 20px 15px; width:100%"><table style="border:none">';
      tooltipText +=
        '<tr><td style="white-space: nowrap;">From</td><td style="white-space: nowrap;"> : <b>' + si + '</b></td></tr>';
      tooltipText +=
        '<tr><td style="white-space: nowrap;">To</td><td  style="white-space: nowrap;"> : <b>' + di + '</b></td></tr>';
      tooltipText +=
        '<tr><td style="white-space: nowrap;">Count</td><td  style="white-space: nowrap;"> : <b>' +
        cn +
        '</b></td></tr>';
      extraSeries.forEach(element => {
        //console.log(element);
        tooltipText +=
          '<tr><td style="white-space: nowrap;">' +
          element.name +
          '</td><td style="white-space: nowrap;"> : <b>' +
          element.values.get(index) +
          '</b></td></tr>';
      });
      tooltipText += '</table></div>';

      graphData.push([...defdata, tooltipText]);
    }
  }
  console.log('data dari mana tak tahu', graphData);

  // const radii = data.series
  //   .map(series => series.fields.find(field => field.type === 'number'))
  //   .map(field => field?.values.get(field.values.length - 1));
  return (
    <div
      className={cx(
        styles.wrapper,
        css`
          width: ${width}px;
          height: ${height}px;
        `
      )}
    >
      {sourceIpFlag && destinationIpFlag && countFlag && (
        <Chart
          chartType="Sankey"
          loader={<div>Loading Chart</div>}
          data={graphData}
          options={{ tooltip: { isHtml: true } }}
          rootProps={{ 'data-testid': '2' }}
        />
      )}
      {!sourceIpFlag && (
        <div className={styles.textBox}>
          Source IP tidak ditemukan, mohon menambahkan source.ip pada group by pencarian
        </div>
      )}
      {!destinationIpFlag && (
        <div className={styles.textBox}>
          Destination IP tidak ditemukan, mohon menambahkan destination.ip pada group by pencarian
        </div>
      )}
      {!countFlag && (
        <div className={styles.textBox}>
          Metric Count tidak ditemukan, mohon menambahkan Count pada metric pencarian
        </div>
      )}
      {/*
      <div className={styles.textBox}>
        {options.showSeriesCount && (
          <div
            className={css`
              font-size: ${theme.typography.size[options.seriesCountSize]};
            `}
          >
            Number of series: {data.series.length}
          </div>
        )}
        <div>Text option value: {options.text}</div>
      </div>

    */}
    </div>
  );
};

const getStyles = stylesFactory(() => {
  return {
    wrapper: css`
      position: relative;
    `,
    svg: css`
      position: absolute;
      top: 0;
      left: 0;
    `,
    textBox: css`
      position: absolute;
      bottom: 0;
      left: 0;
      padding: 10px;
    `,
  };
});
