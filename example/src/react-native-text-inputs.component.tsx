import { useRef, useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  FlatList,
  type ViewToken,
  TextInput,
  ScrollView,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useWebSocket } from './hooks/useWebSocket';

export default function ReactNativeTextInputs() {
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

  // Ref to store TextInput component references, keyed by id
  const inputRefs = useRef(new Map());

  // State to keep track of currently visible item IDs
  const [visibleItemIds, setVisibleItemIds] = useState(new Set());

  // Update visible items based on FlatList callback
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: Array<ViewToken> }) => {
      const newVisibleItemIds = new Set();
      viewableItems.forEach((item) => {
        if (item.isViewable && item.item) {
          newVisibleItemIds.add(item.item.id);
        }
      });
      setVisibleItemIds(newVisibleItemIds);
    },
    []
  );

  // Configuration for onViewableItemsChanged callback
  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 });

  // Handle WebSocket updates
  const handleUpdates = useCallback(
    (update: { securityId: string; price: string; timestamp: string }) => {
      const displayText = `${update.securityId}: $${update.price} (${new Date(update.timestamp).toLocaleTimeString()})`;

      if (isVirtualized) {
        visibleItemIds.forEach((id) => {
          const inputRef = inputRefs.current.get(id);
          if (inputRef) {
            inputRef.setNativeProps({ text: displayText });
          }
        });
      } else {
        initialData.forEach((item) => {
          const inputRef = inputRefs.current.get(item.id);
          if (inputRef) {
            inputRef.setNativeProps({ text: displayText });
          }
        });
      }
    },
    [visibleItemIds, isVirtualized, initialData]
  );

  // Connect to WebSocket
  useWebSocket(handleUpdates, updateInterval);

  const renderItem = useCallback(({ item }: { item: any }) => {
    return (
      <TextInput
        key={item.id}
        defaultValue={item.text}
        style={[styles.input, { color: item.color }]}
        ref={(el) => {
          if (el) {
            inputRefs.current.set(item.id, el);
          } else {
            inputRefs.current.delete(item.id);
          }
        }}
      />
    );
  }, []);

  const keyExtractor = (item: any) => item.id;

  if (!isVirtualized) {
    return (
      <ScrollView style={styles.flatListStyle}>
        {initialData.map((item) => (
          <TextInput
            key={item.id}
            defaultValue={item.text}
            style={[styles.input, { color: item.color }]}
            ref={(el) => {
              if (el) {
                inputRefs.current.set(item.id, el);
              }
            }}
          />
        ))}
      </ScrollView>
    );
  }

  return (
    <FlatList
      data={initialData}
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
  input: {
    height: 40,
    margin: 2,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
  },
});
