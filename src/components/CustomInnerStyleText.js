/* eslint-disable react/no-array-index-key */
import React, { memo } from 'react';
import { Text } from 'react-native';

function CustomInnerStyleText({ children, keyword, style, numberOfLines }) {
  if (!keyword) {
    return (
      <Text numberOfLines={numberOfLines} style={style}>
        {children}
      </Text>
    );
  }

  const parts = children.split(keyword);

  return (
    <Text style={style} numberOfLines={numberOfLines}>
      {parts.map((part, index) => (
        <React.Fragment key={index}>
          {part}
          {index < parts.length - 1 && (
            <Text style={{ fontWeight: 'bold' }}>{keyword}</Text>
          )}
        </React.Fragment>
      ))}
    </Text>
  );
}

export default memo(CustomInnerStyleText);
