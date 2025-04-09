import { useRef, useEffect, useState, useCallback } from 'react';
import { StyleSheet, FlatList, type ViewToken, TextInput, ScrollView } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
} from 'react-native-reanimated';
import { useRoute } from '@react-navigation/native';

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
      text: index.toString(), // Initial text, will be updated via commands
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
      const newVisibleItemIds = new Set<string>(); // Explicit type
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
          const sharedValue = textValues.current.get(id);
          if (sharedValue) {
            const newText = (Math.random() * 100).toFixed(0);
            // Update the shared value directly, triggering the animated prop update
            sharedValue.value = newText;
          }
        });
      } else {
        // Update all items when not virtualized
        initialData.forEach((item) => {
          const sharedValue = textValues.current.get(item.id);
          if (sharedValue) {
            const newText = (Math.random() * 100).toFixed(0);
            // sharedValue.value = newText;
          }
        });
      }
    }, parseInt(updateInterval)); // Update interval

    // Clear interval on unmount
    return () => clearInterval(interval);
  }, [visibleItemIds, updateInterval, isVirtualized, initialData]);

  // Update renderItem to use the new ReanimatedTextInputItem component
  const renderItem = useCallback(
    ({ item }: { item: { id: string; text: string; color: string } }) => {
      // Pass the item data and the ref containing shared values to each item component
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

// New component for rendering each item using Reanimated
const ReanimatedTextInputItem = ({
  item,
  textValuesRef,
}: {
  item: { id: string; text: string; color: string }; // Explicit item type
  textValuesRef: React.MutableRefObject<
    Map<string, Animated.SharedValue<string>>
  >;
}) => {
  // Get or create the shared value for this item's text
  // Initialize with item.text, subsequent updates come from the shared value
  const text = useSharedValue<string>(
    textValuesRef.current.get(item.id)?.value ?? item.text
  );

  // Store the shared value in the ref if it wasn't already there
  // This ensures the value persists across renders/recycling
  if (!textValuesRef.current.has(item.id)) {
    textValuesRef.current.set(item.id, text);
  }

  // Define animated props to link the shared value to the TextInput's text prop
  const animatedProps = useAnimatedProps(() => {
    return {
      text: text.value, // Animate the 'text' prop
      defaultValue: '',
    } as any; // Type assertion needed for animating 'text' prop
  }, [text]); // Dependency array includes the shared value

  useEffect(() => {
    // Capture current values for cleanup
    const currentMap = textValuesRef.current;
    const currentItemId = item.id;

    // Clean up the shared value from the map when the component unmounts
    // This helps manage memory for items scrolled out of view
    return () => {
      currentMap.delete(currentItemId);
    };
  }, [item.id, textValuesRef]); // Dependencies remain the same

  return (
    <AnimatedTextInput
      key={item.id} // Key remains important for FlatList
      style={[styles.label, { color: item.color }]} // Apply style and color
      animatedProps={animatedProps} // Apply animated props
      editable={false} // Text is controlled by animation, not user input
      value={text.value} // Set initial value directly for SSR or non-JS environments
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