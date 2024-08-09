import { useFocusEffect } from '@react-navigation/native';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { apiGetFaq, apiGetFAQCategoryList } from '../../api/RestAPI';
import Loading from '../../components/SPLoading';
import { handleError } from '../../utils/HandleError';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';
import QNAItem from '../../components/qna/QNAItem';
import Header from '../../components/header';
import { SafeAreaView } from 'react-native-safe-area-context';

function MoreQuestion() {
  const [displayedQuestions, setDisplayedQuestions] = useState([]); // 개별 질문 상태 관리
  const [selectedCategory, setSelectedCategory] = useState(''); // 선택된 카테고리 상태
  const [faqData, setFaqData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLast, setIsLast] = useState(false);
  const [categories, setCategories] = useState([]);

  const getType = async () => {
    try {
      const response = await apiGetFAQCategoryList();

      if (response) {
        const qnaType = response.data.data;
        setCategories(qnaType);
        if (qnaType.length > 0) {
          setSelectedCategory(qnaType[0].codeSub);
        }
      }
    } catch (error) {
      handleError(error);
    }
  };

  const getFaqData = async () => {
    const params = {
      size: pageSize,
      page: currentPage,
      categoryCode: selectedCategory,
    };
    try {
      const { data } = await apiGetFaq(params);

      if (Array.isArray(data.data.list)) {
        const newList = data.data.list;
        setIsLast(data.data.isLast); // 현재 페이지가 마지막 페이지임을 설정
        setFaqData(prevFaqData =>
          currentPage === 1 ? newList : [...prevFaqData, ...newList],
        );
      }
    } catch (error) {
      setIsLast(true);
      handleError(error);
    } finally {
      setLoading(false); // 로딩 완료 후 로딩 상태 false로 설정
    }
  };

  const handleEndReached = () => {
    if (!isLast) {
      setTimeout(() => {
        setCurrentPage(prevPage => prevPage + 1);
      }, 0);
    }
  };

  const onRefresh = useCallback(async () => {
    setLoading(true);
    setFaqData([]);
    setCurrentPage(1);
    setIsLast(false);
    setRefreshing(true);
  }, []);

  const selectCategory = codeSub => {
    // 이미 선택된 카테고리와 동일하면 아무 작업도 하지 않음
    if (codeSub === selectedCategory) {
      return;
    }
    setSelectedCategory(codeSub); // 선택된 카테고리의 codeSub 값을 설정
    setCurrentPage(1); // 현재 페이지를 1로 설정
    setFaqData([]); // faqData 초기화
    setIsLast(false); // 마지막 페이지 상태 초기화
  };
  const renderFaqItem = useCallback(({ item }) => {
    return <QNAItem item={item} />;
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (selectedCategory) {
        onRefresh();
      }
    }, [selectedCategory]),
  );

  useEffect(() => {
    getType();
  }, []);

  useEffect(() => {
    if (refreshing || (!refreshing && currentPage > 1)) {
      setRefreshing(false);
      getFaqData();
    }
  }, [currentPage, refreshing]);

  const renderHeaderFilter = useMemo(() => {
    const backgroundStyle = codeSub => {
      if (codeSub === selectedCategory) {
        return {
          backgroundColor: COLORS.orange,
          borderColor: COLORS.orange,
        };
      }
      return {
        backgroundColor: COLORS.fillStrong,
        borderColor: 'rgba(135, 141, 150, 0.16)',
      };
    };

    const textColor = codeSub => {
      if (codeSub === selectedCategory) {
        return {
          color: COLORS.white,
        };
      }

      return {
        color: COLORS.labelNeutral,
      };
    };

    return (
      <View>
        <ScrollView
          contentContainerStyle={styles.filterWrapper}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          horizontal>
          {categories.map(category => (
            <Pressable
              key={category.codeSub} // codeSub가 고유하다고 가정
              style={[
                styles.filterItemWrapper,
                backgroundStyle(category.codeSub),
              ]}
              onPress={() => selectCategory(category.codeSub)}>
              <Text
                style={[
                  fontStyles.fontSize14_Medium,
                  textColor(category.codeSub),
                ]}>
                {category.codeName}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    );
  }, [categories, selectedCategory]);

  const renderEmptyList = useCallback(() => {
    return (
      <View style={styles.emptyViewWrapper}>
        <Text
          style={[
            fontStyles.fontSize12_Medium,
            {
              color: COLORS.labelAlternative,
              textAlign: 'center',
            },
          ]}>
          질문이 존재하지 않습니다.
        </Text>
      </View>
    );
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Header title="자주 묻는 질문" />

      {renderHeaderFilter}

      {loading ? (
        <Loading />
      ) : (
        <FlatList
          data={faqData}
          renderItem={renderFaqItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={renderEmptyList}
        />
      )}
    </SafeAreaView>
  );
}

export default memo(MoreQuestion);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterWrapper: {
    paddingHorizontal: 16,
    columnGap: 8,
    paddingVertical: 16,
  },
  filterItemWrapper: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
  emptyViewWrapper: {
    justifyContent: 'center',
    paddingTop: 24,
  },
});
