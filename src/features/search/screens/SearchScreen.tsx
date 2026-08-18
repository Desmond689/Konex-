/**
 * KONEX SearchScreen
 * Billion Dollar Code - Production Ready
 * 
 * Main search screen with search bar, filters, and results
 * 
 * Usage:
 * <SearchScreen navigation={navigation} route={route} />
 */

import React, { useEffect, useState } from 'react';
import {
    FlatList,
    Keyboard,
    SafeAreaView,
    Text,
    TouchableOpacity,
    View,
    ViewStyle
} from 'react-native';
import Icon from '../../../components/atoms/Icon';
import LoadingSpinner from '../../../components/atoms/LoadingSpinner';
import EmptyState from '../../../components/molecules/EmptyState';
import NavigationHeader from '../../../components/navigation/NavigationHeader';
import { trackEvent } from '../../../config/analytics';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../hooks/useTheme';
import SearchBar from '../components/SearchBar';
import SearchFilter, { SearchFilterType } from '../components/SearchFilter';
import SearchResult, { SearchResultData } from '../components/SearchResult';
import { useSearch } from '../hooks/useSearch';

// ============================================
// 1. TYPES
// ============================================

export interface SearchScreenProps {
  navigation: any;
  route: any;
}

// ============================================
// 2. COMPONENT
// ============================================

export const SearchScreen: React.FC<SearchScreenProps> = ({
  navigation,
  route,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const { user } = useAuth();
  const { communityId, initialQuery } = route.params || {};

  const [activeFilter, setActiveFilter] = useState<SearchFilterType>('all');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const {
    results,
    query,
    isLoading,
    isSearching,
    hasResults,
    error,
    recentSearches,
    search,
    clear,
    clearRecent,
    getRecentSearches,
    getResultCount,
    setQuery,
  } = useSearch({
    communityId,
    autoSearch: true,
    delay: 300,
  });

  // Set initial query from route params
  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      search(initialQuery);
    }
  }, [initialQuery]);

  // Load recent searches on mount
  useEffect(() => {
    getRecentSearches();
  }, []);

  // Keyboard listeners
  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handleSearch = (text: string) => {
    search(text);
    if (text.trim().length > 0) {
      trackEvent('search_query', { query: text, communityId });
    }
  };

  const handleResultPress = (result: SearchResultData) => {
    trackEvent('search_result_click', {
      type: result.type,
      id: result.id,
      query: query,
    });

    switch (result.type) {
      case 'user':
        navigation.push('Profile', { userId: result.id });
        break;
      case 'squad':
        navigation.push('SquadDetail', { squadId: result.id });
        break;
      case 'post':
        navigation.push('PostDetail', { postId: result.id });
        break;
      case 'community':
        navigation.push('Community', { communityId: result.id });
        break;
      case 'hashtag':
        // Navigate to hashtag results
        navigation.push('HashtagResults', { hashtag: result.hashtag });
        break;
      default:
        break;
    }
  };

  const handleFilterChange = (filter: SearchFilterType) => {
    setActiveFilter(filter);
    trackEvent('search_filter_change', { filter, query });
  };

  const handleClearRecent = () => {
    clearRecent();
  };

  const handleRecentPress = (recent: any) => {
    setQuery(recent.query);
    search(recent.query);
    trackEvent('search_recent_click', { query: recent.query });
  };

  // Get filtered results based on active filter
  const getFilteredResults = () => {
    switch (activeFilter) {
      case 'users':
        return results.users;
      case 'squads':
        return results.squads;
      case 'posts':
        return results.posts;
      case 'communities':
        return results.communities;
      case 'hashtags':
        return results.hashtags;
      case 'all':
      default:
        // Combine all results with type
        const allResults: SearchResultData[] = [
          ...results.users.map(r => ({ ...r, type: 'user' as const })),
          ...results.squads.map(r => ({ ...r, type: 'squad' as const })),
          ...results.posts.map(r => ({ ...r, type: 'post' as const })),
          ...results.communities.map(r => ({ ...r, type: 'community' as const })),
          ...results.hashtags.map(r => ({ ...r, type: 'hashtag' as const })),
        ];
        return allResults;
    }
  };

  const filteredResults = getFilteredResults();

  // Get counts for filter badges
  const getCounts = () => ({
    all: getResultCount(),
    users: results.users.length,
    squads: results.squads.length,
    posts: results.posts.length,
    communities: results.communities.length,
    hashtags: results.hashtags.length,
  });

  const renderEmpty = () => {
    if (query.trim().length === 0) {
      // Show recent searches
      return (
        <View style={{ padding: 16 }}>
          {recentSearches.length > 0 && (
            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
                  Recent Searches
                </Text>
                <TouchableOpacity onPress={handleClearRecent}>
                  <Text style={{ fontSize: 12, color: colors.primary }}>Clear All</Text>
                </TouchableOpacity>
              </View>
              {recentSearches.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 10,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  }}
                  onPress={() => handleRecentPress(item)}
                >
                  <Icon name="clock" size={16} color={colors.textMuted} />
                  <Text style={{ fontSize: 14, color: colors.text, marginLeft: 12 }}>
                    {item.query}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {recentSearches.length === 0 && (
            <EmptyState
              title="Search for anything"
              description="Find users, squads, posts, and more"
              icon="🔍"
            />
          )}
        </View>
      );
    }

    if (isLoading) {
      return (
        <View style={{ padding: 40, alignItems: 'center' }}>
          <LoadingSpinner size="large" />
        </View>
      );
    }

    if (error) {
      return (
        <EmptyState
          title="Search Error"
          description={error.message || 'Something went wrong'}
          icon="❌"
          actionText="Retry"
          onAction={() => handleSearch(query)}
        />
      );
    }

    if (!hasResults) {
      return (
        <EmptyState
          title="No Results Found"
          description={`No results found for "${query}"`}
          icon="🔍"
        />
      );
    }

    return null;
  };

  const renderItem = ({ item }: { item: SearchResultData }) => (
    <SearchResult
      result={item}
      type={item.type}
      onPress={handleResultPress}
    />
  );

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background,
  };

  const contentStyle: ViewStyle = {
    flex: 1,
  };

  return (
    <SafeAreaView style={containerStyle}>
      <NavigationHeader
        title="Search"
        showBack={false}
        rightActions={[
          {
            icon: 'x',
            onPress: () => navigation.goBack(),
          },
        ]}
      />

      <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
        <SearchBar
          value={query}
          onChangeText={handleSearch}
          placeholder="Search users, squads, posts..."
          autoFocus={true}
        />
      </View>

      {query.trim().length > 0 && (
        <SearchFilter
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
          counts={getCounts()}
        />
      )}

      <View style={contentStyle}>
        {query.trim().length > 0 ? (
          <FlatList
            data={filteredResults}
            keyExtractor={(item) => `${item.type}-${item.id}`}
            renderItem={renderItem}
            ListEmptyComponent={renderEmpty}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        ) : (
          renderEmpty()
        )}
      </View>
    </SafeAreaView>
  );
};

export default SearchScreen;