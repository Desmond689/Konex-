/**
 * KONEX AdminTable Component
 * Billion Dollar Code - Production Ready
 * 
 * A reusable table component for admin data display
 * 
 * Usage:
 * <AdminTable
 *   columns={columns}
 *   data={data}
 *   onRowPress={handleRowPress}
 *   onSearch={handleSearch}
 * />
 */

import React, { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
    ViewStyle
} from 'react-native';
import Icon from '../../../components/atoms/Icon';
import Input from '../../../components/atoms/Input';
import EmptyState from '../../../components/molecules/EmptyState';
import Pagination from '../../../components/molecules/Pagination';
import { useTheme } from '../../../hooks/useTheme';

// ============================================
// 1. TYPES
// ============================================

export interface Column<T = any> {
  key: string;
  title: string;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  render?: (item: T, index: number) => React.ReactNode;
  sortable?: boolean;
}

export interface AdminTableProps<T = any> {
  /** Column definitions */
  columns: Column<T>[];
  /** Data rows */
  data: T[];
  /** Unique key extractor */
  keyExtractor: (item: T, index: number) => string;
  /** On row press handler */
  onRowPress?: (item: T, index: number) => void;
  /** On search handler */
  onSearch?: (query: string) => void;
  /** On refresh handler */
  onRefresh?: () => Promise<void>;
  /** On load more handler */
  onLoadMore?: () => Promise<void>;
  /** On sort handler */
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  /** Search placeholder */
  searchPlaceholder?: string;
  /** Is loading */
  loading?: boolean;
  /** Is refreshing */
  refreshing?: boolean;
  /** Has more data */
  hasMore?: boolean;
  /** Total items */
  totalItems?: number;
  /** Current page */
  currentPage?: number;
  /** Total pages */
  totalPages?: number;
  /** On page change handler */
  onPageChange?: (page: number) => void;
  /** Empty state configuration */
  emptyState?: {
    title: string;
    description?: string;
    actionText?: string;
    onAction?: () => void;
  };
  /** Custom style */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// 2. COMPONENT
// ============================================

export function AdminTable<T extends Record<string, any>>({
  columns,
  data,
  keyExtractor,
  onRowPress,
  onSearch,
  onRefresh,
  onLoadMore,
  onSort,
  searchPlaceholder = 'Search...',
  loading = false,
  refreshing = false,
  hasMore = false,
  totalItems,
  currentPage,
  totalPages,
  onPageChange,
  emptyState,
  style,
  testID,
}: AdminTableProps<T>): React.ReactElement {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (onSearch) {
      onSearch(text);
    }
  };

  const handleSort = (column: Column<T>) => {
    if (!column.sortable) return;

    let newDirection: 'asc' | 'desc' = 'asc';
    if (sortColumn === column.key) {
      newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    }

    setSortColumn(column.key);
    setSortDirection(newDirection);

    if (onSort) {
      onSort(column.key, newDirection);
    }
  };

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore || !onLoadMore) return;
    setIsLoadingMore(true);
    try {
      await onLoadMore();
    } finally {
      setIsLoadingMore(false);
    }
  };

  const renderHeader = () => (
    <View
      style={{
        flexDirection: 'row',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderBottomWidth: 2,
        borderBottomColor: colors.border,
        backgroundColor: colors.surface,
      }}
    >
      {columns.map((column) => {
        const width = column.width || 'auto';
        const align = column.align || 'left';

        return (
          <TouchableOpacity
            key={column.key}
            style={{
              flex: typeof width === 'number' ? width : 1,
              alignItems: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
              minWidth: 60,
            }}
            onPress={() => handleSort(column)}
            disabled={!column.sortable}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: colors.textMuted,
                }}
              >
                {column.title}
              </Text>
              {column.sortable && (
                <Icon
                  name={
                    sortColumn === column.key
                      ? sortDirection === 'asc'
                        ? 'chevron-up'
                        : 'chevron-down'
                      : 'chevron-up-down'
                  }
                  size={14}
                  color={colors.textMuted}
                  style={{ marginLeft: 4 }}
                />
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderRow = ({ item, index }: { item: T; index: number }) => {
    const isEven = index % 2 === 0;

    return (
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          paddingVertical: 10,
          paddingHorizontal: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          backgroundColor: isEven ? colors.surface : colors.surfaceSecondary,
        }}
        onPress={() => onRowPress?.(item, index)}
        activeOpacity={onRowPress ? 0.7 : 1}
        disabled={!onRowPress}
      >
        {columns.map((column) => {
          const width = column.width || 'auto';
          const align = column.align || 'left';

          const content = column.render
            ? column.render(item, index)
            : item[column.key]?.toString() || '—';

          return (
            <View
              key={column.key}
              style={{
                flex: typeof width === 'number' ? width : 1,
                alignItems: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
                minWidth: 60,
              }}
            >
              {typeof content === 'string' ? (
                <Text
                  style={{
                    fontSize: 13,
                    color: colors.text,
                  }}
                  numberOfLines={1}
                >
                  {content}
                </Text>
              ) : (
                content
              )}
            </View>
          );
        })}
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => {
    if (emptyState) {
      return (
        <EmptyState
          title={emptyState.title}
          description={emptyState.description}
          actionText={emptyState.actionText}
          onAction={emptyState.onAction}
        />
      );
    }
    return (
      <EmptyState
        title="No Data"
        description={searchQuery ? 'No results found for your search' : 'No data to display'}
        icon="📊"
        style={{ padding: 40 }}
      />
    );
  };

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={{ paddingVertical: 16, alignItems: 'center' }}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  const renderPagination = () => {
    if (!totalPages || !currentPage || !onPageChange) return null;

    return (
      <View style={{ paddingVertical: 12 }}>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
        {totalItems !== undefined && (
          <Text
            style={{
              fontSize: 12,
              color: colors.textMuted,
              textAlign: 'center',
              marginTop: 8,
            }}
          >
            Showing {data.length} of {totalItems} items
          </Text>
        )}
      </View>
    );
  };

  const containerStyle: ViewStyle = {
    flex: 1,
    ...style,
  };

  const searchContainerStyle: ViewStyle = {
    marginBottom: 12,
  };

  return (
    <View style={containerStyle} testID={testID}>
      {onSearch && (
        <View style={searchContainerStyle}>
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChangeText={handleSearch}
            leftIcon="search"
            rightIcon={searchQuery ? 'x' : undefined}
            onRightIconPress={() => handleSearch('')}
          />
        </View>
      )}

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 12, color: colors.textSecondary }}>
            Loading data...
          </Text>
        </View>
      ) : (
        <>
          {data.length > 0 ? (
            <FlatList
              data={data}
              keyExtractor={keyExtractor}
              renderItem={renderRow}
              ListHeaderComponent={renderHeader}
              ListFooterComponent={renderFooter}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.2}
              refreshControl={
                onRefresh ? (
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={[colors.primary]}
                    tintColor={colors.primary}
                  />
                ) : undefined
              }
              stickyHeaderIndices={[0]}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            renderEmpty()
          )}
          {renderPagination()}
        </>
      )}
    </View>
  );
}

export default AdminTable;