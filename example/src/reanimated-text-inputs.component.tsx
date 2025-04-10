import { useRef, useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  FlatList,
  type ViewToken,
  TextInput,
  ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
} from 'react-native-reanimated';
import { useRoute } from '@react-navigation/native';
import { useWebSocket } from './hooks/useWebSocket';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

export default function ReanimatedTextInputs() {
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

  // Ref to store shared text values, keyed by id
  const textValues = useRef(new Map<string, Animated.SharedValue<string>>());

  // State to keep track of currently visible item IDs
  const [visibleItemIds, setVisibleItemIds] = useState(new Set<string>());

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
          const sharedValue = textValues.current.get(id);
          if (sharedValue) {
            sharedValue.value = displayText;
          }
        });
      } else {
        initialData.forEach((item) => {
          const sharedValue = textValues.current.get(item.id);
          if (sharedValue) {
            sharedValue.value = displayText;
          }
        });
      }
    },
    [visibleItemIds, isVirtualized, initialData]
  );

  // Connect to WebSocket
  useWebSocket(handleUpdates, updateInterval);

  const renderItem = useCallback(
    ({ item }: { item: { id: string; text: string; color: string } }) => {
      return <ReanimatedTextInputItem item={item} textValuesRef={textValues} />;
    },
    []
  );

  const keyExtractor = (item: any) => item.id;

  if (!isVirtualized) {
    return (
      <ScrollView style={styles.flatListStyle}>
        {initialData.map((item) => (
          <ReanimatedTextInputItem
            key={item.id}
            item={item}
            textValuesRef={textValues}
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

const ReanimatedTextInputItem = ({
  item,
  textValuesRef,
}: {
  item: { id: string; text: string; color: string };
  textValuesRef: React.MutableRefObject<
    Map<string, Animated.SharedValue<string>>
  >;
}) => {
  const text = useSharedValue<string>(
    textValuesRef.current.get(item.id)?.value ?? item.text
  );

  if (!textValuesRef.current.has(item.id)) {
    textValuesRef.current.set(item.id, text);
  }

  const animatedProps = useAnimatedProps(() => {
    return {
      text: text.value,
      defaultValue: '',
    } as any;
  }, [text]);

  useEffect(() => {
    const currentMap = textValuesRef.current;
    const currentItemId = item.id;

    return () => {
      currentMap.delete(currentItemId);
    };
  }, [item.id, textValuesRef]);

  return (
    <AnimatedTextInput
      key={item.id}
      style={[styles.label, { color: item.color }]}
      animatedProps={animatedProps}
      editable={false}
      value={text.value}
    />
  );
};

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
