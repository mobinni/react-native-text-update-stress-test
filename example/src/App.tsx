import * as React from 'react';
import { View, Button, StyleSheet, TextInput, Text, Switch } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import screens
import NativeLabelList from './native-label-list.component';
import ReanimatedTextInputs from './reanimated-text-inputs.component';
import ReactNativeTextInputs from './react-native-text-inputs.component';
import TextComponent from './text.component'; // Renamed import to avoid conflict with RN Text

type RootStackParamList = {
  Main: undefined;
  NativeLabels: undefined;
  ReanimatedTextInputs: undefined;
  ReactNativeTextInputs: undefined;
  Text: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function MainScreen({ navigation }: { navigation: any }) {
  const [numItems, setNumItems] = React.useState('20000');
  const [updateInterval, setUpdateInterval] = React.useState('100');
  const [isVirtualized, setIsVirtualized] = React.useState(true);

  return (
    <View style={styles.container}>
      <View style={styles.configContainer}>
        <Text style={styles.label}>Number of Items:</Text>
        <TextInput
          style={styles.input}
          value={numItems}
          onChangeText={setNumItems}
          keyboardType="numeric"
          placeholder="Enter number of items"
        />
        <Text style={styles.label}>Update Interval (ms):</Text>
        <TextInput
          style={styles.input}
          value={updateInterval}
          onChangeText={setUpdateInterval}
          keyboardType="numeric"
          placeholder="Enter update interval"
        />
        <View style={styles.switchContainer}>
          <Text style={styles.label}>Virtualization:</Text>
          <Switch
            value={isVirtualized}
            onValueChange={setIsVirtualized}
          />
        </View>
      </View>
      <Button
        title="Native Labels"
        onPress={() =>
          navigation.navigate('NativeLabels', {
            numItems,
            updateInterval,
            isVirtualized,
          })
        }
      />
      <Button
        title="Reanimated Text Inputs"
        onPress={() =>
          navigation.navigate('ReanimatedTextInputs', {
            numItems,
            updateInterval,
            isVirtualized,
          })
        }
      />
      <Button
        title="React Native Text Inputs"
        onPress={() =>
          navigation.navigate('ReactNativeTextInputs', {
            numItems,
            updateInterval,
            isVirtualized,
          })
        }
      />
      <Button
        title="Text Component"
        onPress={() =>
          navigation.navigate('Text', {
            numItems,
            updateInterval,
            isVirtualized,
          })
        }
      />
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Main">
        <Stack.Screen name="Main" component={MainScreen} />
        <Stack.Screen name="NativeLabels" component={NativeLabelList} />
        <Stack.Screen
          name="ReanimatedTextInputs"
          component={ReanimatedTextInputs}
        />
        <Stack.Screen
          name="ReactNativeTextInputs"
          component={ReactNativeTextInputs}
        />
        <Stack.Screen name="Text" component={TextComponent} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  configContainer: {
    width: '80%',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
});
