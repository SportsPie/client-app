import React, { memo, useEffect } from 'react';
import DefaultHeader from './DefaultHeader';
import HomeHeader from './HomeHeader';
import SearchHeader from './SearchHeader';
import { setHeaderProps } from '../SPHeader';
import BackHandlerUtils from '../../utils/BackHandlerUtils';

function Header({
  title,
  hideLeftIcon,
  closeIcon,
  rightContent,
  onLeftIconPress,
  headerType, // HOME, SEARCH, DEFAULT
  value, // only for SEARCH header
  onChangeText, // only for SEARCH header
  headerContainerStyle,
  headerTextStyle,
  leftIconColor,
  placeholder,
  onSubmitEditing,
}) {
  setHeaderProps({
    noLeftButton: hideLeftIcon,
    onPressLeftBtn: onLeftIconPress,
  });

  if (headerType === 'HOME') {
    return <HomeHeader />;
  }

  if (headerType === 'SEARCH') {
    return (
      <SearchHeader
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
      />
    );
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    BackHandlerUtils.addDefaultBackHandlerEvent();
  }, []);

  return (
    <DefaultHeader
      title={title}
      hideLeftIcon={hideLeftIcon}
      closeIcon={closeIcon}
      rightContent={rightContent}
      onLeftIconPress={onLeftIconPress}
      headerContainerStyle={headerContainerStyle}
      headerTextStyle={headerTextStyle}
      leftIconColor={leftIconColor}
    />
  );
}

export default memo(Header);
