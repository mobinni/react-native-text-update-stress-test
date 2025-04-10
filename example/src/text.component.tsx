import { useCallback, useState, useRef } from 'react';
import {
  StyleSheet,
  FlatList,
  Text,
  type ViewToken,
  ScrollView,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useWebSocket } from './hooks/useWebSocket';

export default function TextComponent() {
  const route = useRoute();
  const { numItems = '20000', updateInterval = '100', isVirtualized = true } = route.params as {
    numItems?: string;
    updateInterval?: string;
    isVirtualized?: boolean;
  };

  // Generate initial data structure only once
  const initialData = Array(parseInt(numItems))
    .fill(0)
    .map((_, index) => ({
      id: index.toString(),
      text: 'Waiting for updates...', // Initial text
      color: `#${Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, '0')}`,
    }));

  // State to hold the list data, initialized with initialData
  const [data, setData] = useState(initialData);
  // Keep a mutable reference to the data
  const dataRef = useRef(data);

  // State to keep track of currently visible item IDs
  const [visibleItemIds, setVisibleItemIds] = useState(new Set());
  const visibleItemIdsRef = useRef(visibleItemIds);

  // Update visible items based on FlatList callback
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: Array<ViewToken> }) => {
      const newVisibleItemIds = new Set<string>();
      viewableItems.forEach((item) => {
        if (item.isViewable && item.item) {
          newVisibleItemIds.add(item.item.id);
        }
      });
      setVisibleItemIds(newVisibleItemIds);
      visibleItemIdsRef.current = newVisibleItemIds;
    },
    []
  );

  // Configuration for onViewableItemsChanged callback
  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 });

  // Handle WebSocket updates
  const handleUpdates = useCallback(
    (update: { securityId: string; price: string; timestamp: string }) => {
      const displayText = `${update.securityId}: $${update.price} (${new Date(update.timestamp).toLocaleTimeString()})`;

      // Only update if there are visible items in virtualized mode
      if (isVirtualized && visibleItemIdsRef.current.size === 0) return;

      // Create a new array reference to trigger re-render
      const newData = [...dataRef.current];
      let hasChanges = false;

      // Update only visible items when virtualized, or all items when not
      const itemsToUpdate = isVirtualized
        ? visibleItemIdsRef.current
        : new Set(newData.map((item) => item.id));

      itemsToUpdate.forEach((id) => {
        const index = parseInt(id as string);
        const item = newData[index];
        if (index >= 0 && index < newData.length && item) {
          if (item.text !== displayText) {
            newData[index] = {
              id: item.id,
              text: displayText,
              color: item.color,
            };
            hasChanges = true;
          }
        }
      });

      // Only update state if there were actual changes
      if (hasChanges) {
        dataRef.current = newData;
        setData(newData);
      }
    },
    [isVirtualized]
  );

  // Connect to WebSocket
  useWebSocket(handleUpdates, updateInterval);

  const renderItem = useCallback(({ item }: { item: (typeof data)[0] }) => {
    return (
      <Text key={item.id} style={[styles.label, { color: item.color }]}>
        {item.text}
      </Text>
    );
  }, []);

  const keyExtractor = (item: any) => item.id;

  if (!isVirtualized) {
    return (
      <ScrollView style={styles.flatListStyle}>
        {data.map((item) => (
          <Text key={item.id} style={[styles.label, { color: item.color }]}>
            {item.text}
          </Text>
        ))}
      </ScrollView>
    );
  }

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      style={styles.flatListStyle}
      contentContainerStyle={styles.container}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={21}
      getItemLayout={(_data, index) => {
        return { length: 40 + 4, offset: (40 + 4) * index, index };
      }}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig.current}
    />
  );
}

const styles = StyleSheet.create({
  flatListStyle: {
    flex: 1,
  },
  container: {},
  label: {
    height: 40,
    margin: 2,
    textAlignVertical: 'center',
    fontSize: 16,
  },
});
