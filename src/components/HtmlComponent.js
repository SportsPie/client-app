import React from 'react';
import { StyleSheet } from 'react-native';
import RenderHTML from 'react-native-render-html';
import tableRenderers from '@native-html/heuristic-table-plugin';

import WebView from 'react-native-webview';

const renderers = {
  ...tableRenderers,
};

const htmlProps = {
  WebView,
  renderers,
  tagsStyles: {
    html: {
      width: '100%',
      padding: 0,
      margin: 0,
    },
    body: {
      width: '100%',
      padding: 0,
      margin: 0,
    },
    figure: {
      width: '100%',
      padding: 0,
      margin: 0,
    },
    table: {
      width: '100%',
      padding: 0,
      margin: 0,
    },
    tbody: {
      width: '100%',
      // width,
      padding: 0,
      margin: 0,
    },
    tr: {
      width: '100%',
      // width,
      padding: 0,
      margin: 0,
    },
    // th: {
    //   width: '100%',
    //   // width,
    //   padding: 0,
    //   margin: 0,
    // },
    td: {
      minWidth: 10,
      padding: 0,
      margin: 0,
    },
  },
  renderersProps: {
    table: {
      // Put the table config here
      // forceStretch: true,
      getStyleForCell: cell => {
        return {
          borderWidth: 1,
        };
      },
    },
  },
  defaultWebViewProps: {},
};

function HtmlComponent({ html, width, baseStyle, ...props }) {
  return (
    <RenderHTML
      contentWidth={width}
      source={{ html }}
      {...htmlProps}
      baseStyle={baseStyle}
      {...props}
    />
  );
}

const styles = StyleSheet.create({});

export default HtmlComponent;
