import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Pressable,
} from 'react-native';
import { navName } from '../../common/constants/navName';
import NavigationService from '../../navigation/NavigationService';
import { handleError } from '../../utils/HandleError';
import { apiGetAcademyConfigMngReports } from '../../api/RestAPI';
import { useFocusEffect } from '@react-navigation/native';
import SPLoading from '../../components/SPLoading';
import { REPORT_STATE } from '../../common/constants/reportState';
import { REPORT_TYPE } from '../../common/constants/reportType';
import moment from 'moment/moment';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/header';

const tabs = {
  feed: {
    value: REPORT_TYPE.FEED,
    desc: '게시글',
  },
  comment: {
    value: REPORT_TYPE.FEED_COMMENT,
    desc: '댓글',
  },
};
// 탭 컴포넌트 (게시글, 댓글)
function TabButton({ tab, activeTab, setActiveTab }) {
  return (
    <TouchableOpacity
      style={[
        styles.tabButton,
        activeTab === tab.value ? styles.activeTab : styles.inactiveTab,
      ]}
      onPress={() => setActiveTab(tab.value)}>
      <Text
        style={[
          styles.tabText,
          activeTab === tab.value ? styles.activeTabText : null,
        ]}>
        {tab.desc}
      </Text>
    </TouchableOpacity>
  );
}

function AcademyReportDetails({ route }) {
  /**
   * state
   */
  const flatListRef = useRef();
  const academyIdx = route?.params?.academyIdx;
  const [activeTab, setActiveTab] = useState(tabs.feed.value);

  const buttons = [
    { label: '전체', value: null },
    { label: REPORT_STATE.WAIT.desc, value: REPORT_STATE.WAIT.code },
    { label: REPORT_STATE.FINISH.desc, value: REPORT_STATE.FINISH.code },
  ];
  const [selectedState, setSelectedState] = useState(buttons[0].value);

  // list
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(30);
  const [loading, setLoading] = useState(true);
  const [totalCnt, setTotalCnt] = useState(0);
  const [isLast, setIsLast] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isFocus, setIsFocus] = useState(true);
  const [reportList, setReportList] = useState([]);

  /**
   * api
   */

  const getReport = async () => {
    try {
      const params = {
        academyIdx,
        reportType: activeTab,
        state: selectedState,
        page,
        size,
      };
      const { data } = await apiGetAcademyConfigMngReports(params);
      setTotalCnt(data.data.totalCnt);
      setIsLast(data.data.isLast);
      if (page === 1) {
        setReportList(data.data.list);
      } else {
        setReportList(prev => [...prev, ...data.data.list]);
      }
    } catch (error) {
      handleError(error);
    }
    setIsFocus(false);
    setLoading(false);
  };

  /**
   * function
   */

  const loadMoreProjects = () => {
    setTimeout(() => {
      if (!isLast) {
        setPage(prevPage => prevPage + 1);
        setRefreshing(true);
      }
    }, 0);
  };

  const onRefresh = async () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ animated: false, offset: 0 });
    }
    setPage(1);
    setIsLast(false);
    setReportList([]);
    setLoading(true);
    setRefreshing(true);
  };

  const onFocus = async () => {
    try {
      setIsFocus(false);
    } catch (error) {
      handleError(error);
    }
  };

  /**
   * useEffect
   */

  useFocusEffect(
    useCallback(() => {
      onFocus();
      return () => {
        setPage(1);
        setLoading(true);
        setIsLast(false);
        setRefreshing(false);
        setReportList([]);
      };
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      if (!isFocus) {
        onRefresh(true);
      }
    }, [activeTab]),
  );

  useFocusEffect(
    useCallback(() => {
      if (!isFocus) {
        onRefresh();
      }
    }, [selectedState, isFocus]),
  );

  useEffect(() => {
    if (!isFocus && refreshing) {
      setRefreshing(false);
      getReport();
    }
  }, [page, isFocus, refreshing]);

  /**
   * render
   */

  // 신고내역 컴포넌트
  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        NavigationService.navigate(navName.academyReportDetailsView, {
          reportIdx: item.reportIdx,
          reportType: item.reportType,
        });
      }}>
      <View style={styles.contentItem}>
        <View style={styles.contentSubBox}>
          <Text style={styles.contentDateText}>
            {moment(item.regDate).format('YYYY.MM.DD HH:mm:ss')}
          </Text>
          <View
            style={[
              styles.statusBox,
              item.state === REPORT_STATE.WAIT.code ||
              item.state === REPORT_STATE.DELETE.code
                ? styles.unresolvedStatusBox
                : styles.resolvedStatusBox,
            ]}>
            <Text
              style={[
                styles.statusText,
                item.state === REPORT_STATE.WAIT.code ||
                item.state === REPORT_STATE.DELETE.code
                  ? styles.unresolvedStatusText
                  : styles.resolvedStatusText,
              ]}>
              {REPORT_STATE[item.state].desc}
            </Text>
          </View>
        </View>
        <Text style={styles.contentTitle}>{item.reason}</Text>
        <View style={styles.contentSubGroup}>
          <View style={[styles.contentSubBox, { gap: 8 }]}>
            <Text style={styles.contentSubTilte}>작성자</Text>
            <Text style={styles.contentSubText}>{item.reportUserName}</Text>
          </View>
          <View
            style={[
              styles.contentSubBox,
              { alignItems: 'flex-start', gap: 8 },
            ]}>
            <Text style={styles.contentSubTilte}>내용</Text>
            <Text
              style={styles.contentSubText}
              numberOfLines={2}
              ellipsizeMode="tail">
              {item.contents}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="신고내역 관리" />
      <View style={styles.tabButtonBox}>
        <TabButton
          tab={tabs.feed}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        <TabButton
          tab={tabs.comment}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </View>

      <View style={[styles.tabDetailBox, { flex: 1 }]}>
        {/* 게시글 Tab */}
        {activeTab === tabs.feed.value && (
          <View style={styles.tabContent}>
            <View style={styles.buttonBox}>
              {buttons.map((item, index) => (
                <Pressable
                  /* eslint-disable-next-line react/no-array-index-key */
                  hitSlop={{
                    top: 13,
                    bottom: 13,
                    left: 4,
                    right: 4,
                  }}
                  key={index}
                  style={[
                    styles.button,
                    selectedState === item.value && styles.activeButton,
                  ]}
                  onPress={() => {
                    setSelectedState(item.value);
                  }}>
                  <Text
                    style={[
                      styles.buttonText,
                      selectedState === item.value && styles.activeButtonText,
                    ]}>
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            {reportList && reportList.length > 0 ? (
              <FlatList
                data={reportList}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={styles.contentList}
                ListFooterComponent={
                  loading
                    ? () => {
                        return (
                          <ActivityIndicator
                            size="small"
                            style={{ marginVertical: 20 }}
                          />
                        );
                      }
                    : null
                }
                refreshControl={
                  <RefreshControl refreshing={false} onRefresh={onRefresh} />
                }
                onEndReached={() => {
                  loadMoreProjects();
                }}
                onEndReachedThreshold={0.5}
              />
            ) : loading ? (
              <SPLoading />
            ) : (
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text>신고 내역이 없습니다.</Text>
              </View>
            )}
          </View>
        )}
        {/* 댓글 Tab */}
        {activeTab === tabs.comment.value && (
          <View style={styles.tabContent}>
            <View style={styles.buttonBox}>
              {buttons.map((item, index) => (
                <TouchableOpacity
                  /* eslint-disable-next-line react/no-array-index-key */
                  key={index}
                  style={[
                    styles.button,
                    selectedState === item.value && styles.activeButton,
                  ]}
                  onPress={() => {
                    setSelectedState(item.value);
                  }}>
                  <Text
                    style={[
                      styles.buttonText,
                      selectedState === item.value && styles.activeButtonText,
                    ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {reportList && reportList.length > 0 ? (
              <FlatList
                data={reportList}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={styles.contentList}
                ListFooterComponent={
                  loading
                    ? () => {
                        return (
                          <ActivityIndicator
                            size="small"
                            style={{ marginVertical: 20 }}
                          />
                        );
                      }
                    : null
                }
                refreshControl={
                  <RefreshControl refreshing={false} onRefresh={onRefresh} />
                }
                onEndReached={() => {
                  loadMoreProjects();
                }}
                onEndReachedThreshold={0.5}
              />
            ) : loading ? (
              <SPLoading />
            ) : (
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text>신고 내역이 없습니다.</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

export default memo(AcademyReportDetails);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  tabButtonBox: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(135, 141, 150, 0.16)',
  },
  tabButton: {
    flex: 1,
    // paddingVertical: 8,
    paddingTop: 18,
    paddingBottom: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 20,
    letterSpacing: 0.203,
    textAlign: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FB8225',
  },
  activeTabText: {
    color: '#FF671F',
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  buttonBox: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  button: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: 'rgba(135, 141, 150, 0.16)',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.22)',
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(167, 172, 179, 0.60)',
    lineHeight: 18,
    letterSpacing: 0.252,
  },
  activeButton: {
    backgroundColor: '#FF671F',
  },
  activeButtonText: {
    color: '#FFF',
  },
  contentList: {
    flexDirection: 'column',
    gap: 16,
  },
  contentItem: {
    flexDirection: 'column',
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.22)',
    borderRadius: 16,
    padding: 16,
  },
  contentSubGroup: {
    flexDirection: 'column',
    gap: 8,
  },
  contentSubBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  contentDateText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 16,
    letterSpacing: 0.302,
  },
  statusBox: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  unresolvedStatusBox: {
    backgroundColor: 'rgba(255, 103, 31, 0.08)',
  },
  resolvedStatusBox: {
    backgroundColor: 'rgba(49, 55, 121, 0.08)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    letterSpacing: 0.302,
  },
  unresolvedStatusText: {
    color: '#FF671F',
  },
  resolvedStatusText: {
    color: '#313779',
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1C1E',
    lineHeight: 24,
    letterSpacing: 0.091,
  },
  contentSubTilte: {
    minWidth: 40,
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 20,
    letterSpacing: 0.203,
  },
  contentSubText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1C1E',
    lineHeight: 20,
    letterSpacing: 0.203,
    textAlign: 'right',
  },
});
