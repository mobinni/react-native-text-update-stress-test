/* eslint-disable prettier/prettier */
import { useRef, useState, useCallback } from 'react';
import { StyleSheet, FlatList, type ViewToken, ScrollView } from 'react-native';
import { LabelView, Commands } from 'react-native-label';
import { useRoute } from '@react-navigation/native';
import { useWebSocket } from './hooks/useWebSocket';

export default function NativeLabelList() {
  const route = useRoute();
  const { numItems = '20000', updateInterval = '100', isVirtualized = true } = route.params as {
    numItems?: string;
    updateInterval?: string;
    isVirtualized?: boolean;
  };

  const initialData = Array(parseInt(numItems))
  .fill(0)
  .map((_, index) => ({
    id: index.toString(),
    text: 'Waiting for updates...', // Initial text
    color: `#${Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, '0')}`,
  }));

  // Ref to store LabelView component references, keyed by id
  const labelRefs = useRef(new Map());

  // State to keep track of currently visible item IDs
  const [visibleItemIds, setVisibleItemIds] = useState(new Set());

  // Update visible items based on FlatList callback
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: Array<ViewToken> }) => {
      const newVisibleItemIds = new Set();
      viewableItems.forEach((item) => {
        if (item.isViewable && item.index !== undefined) {
          newVisibleItemIds.add(`label-${item.index}`);
        }
      });
      setVisibleItemIds(newVisibleItemIds);
    },
    []
  );

  // Configuration for onViewableItemsChanged callback
  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 });

  // Handle WebSocket updates
  const handleUpdates = useCallback((update: { securityId: string; price: string; timestamp: string }) => {
    const displayText = `${update.securityId}: $${update.price} (${new Date(update.timestamp).toLocaleTimeString()})`;

    if (isVirtualized) {
      // Update only visible items in virtualized mode
      visibleItemIds.forEach((id) => {
        const labelRef = labelRefs.current.get(id);
        if (labelRef) {
          Commands.updateLabel(labelRef, displayText);
        }
      });
    } else {
      // Update all items in non-virtualized mode
      labelRefs.current.forEach((labelRef) => {
        Commands.updateLabel(labelRef, displayText);
      });
    }
  }, [visibleItemIds, isVirtualized]);

  // Connect to WebSocket
  useWebSocket(handleUpdates, updateInterval);

  const renderItem = useCallback(({ index }: { index: number }) => {
    const id = `label-${index}`;
    const color = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
    return (
      <LabelView
        key={id}
        text="Waiting for updates..."
        color={color}
        style={styles.label}
        ref={(el) => {
          if (el) {
            labelRefs.current.set(id, el);
          } else {
            labelRefs.current.delete(id);
          }
        }}
      />
    );
  }, []);

  const keyExtractor = (item: any) => item.id;

  if (!isVirtualized) {
    return (
      <ScrollView style={styles.flatListStyle}>
        {Array(parseInt(numItems))
          .fill(0)
          .map((_, index) => {
            const id = `label-${index}`;
            const color = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
            return (
              <LabelView
                key={id}
                text="Waiting for updates..."
                color={color}
                style={styles.label}
                ref={(el) => {
                  if (el) {
                    labelRefs.current.set(id, el);
                  }
                }}
              />
            );
          })}
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
  label: {
    height: 40,
    margin: 2,
  },
}); 