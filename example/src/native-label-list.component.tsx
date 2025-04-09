import { useRef, useEffect, useState, useCallback } from 'react';
import { StyleSheet, FlatList, type ViewToken, ScrollView } from 'react-native';
import { LabelView, Commands } from 'react-native-label';
import { useRoute } from '@react-navigation/native';

export default function NativeLabelList() {
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
      text: index.toString(), // Initial text, will be updated via commands
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

  // Effect to update visible labels periodically via commands
  useEffect(() => {
    const interval = setInterval(() => {
      if (isVirtualized) {
        visibleItemIds.forEach((id) => {
          const labelRef = labelRefs.current.get(id);
          if (labelRef) {
            const newText = (Math.random() * 100).toFixed(0);
            Commands.updateLabel(labelRef, newText);
          }
        });
      } else {
        // Update all items when not virtualized
        initialData.forEach((item) => {
          const labelRef = labelRefs.current.get(item.id);
          if (labelRef) {
            const newText = (Math.random() * 100).toFixed(0);
            Commands.updateLabel(labelRef, newText);
          }
        });
      }
    }, parseInt(updateInterval)); // Update interval

    // Clear interval on unmount
    return () => clearInterval(interval);
  }, [visibleItemIds, updateInterval, isVirtualized]);

  const renderItem = useCallback(({ item }: { item: any }) => {
    return (
      <LabelView
        key={item.id} // Key is important for FlatList
        text={item.text} // Pass initial text
        color={item.color}
        style={styles.label}
        ref={(el) => {
          // Store or remove ref when component mounts/unmounts or is recycled
          if (el) {
            labelRefs.current.set(item.id, el);
          } else {
            labelRefs.current.delete(item.id);
          }
        }}
      />
    );
  }, []); // Empty dependency array because renderItem doesn't depend on component state/props

  const keyExtractor = (item: any) => item.id;

  if (!isVirtualized) {
    return (
      <ScrollView style={styles.flatListStyle}>
        {initialData.map((item) => (
          <LabelView
            key={item.id}
            text={item.text}
            color={item.color}
            style={styles.label}
            ref={(el) => {
              if (el) {
                labelRefs.current.set(item.id, el);
              }
            }}
          />
        ))}
      </ScrollView>
    );
  }

  return (
    <FlatList
      data={initialData} // Use the static initial data
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