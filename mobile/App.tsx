import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ListScreen from './src/screens/ListScreen';
import FormScreen from './src/screens/FormScreen';
import ViewScreen from './src/screens/ViewScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TouchableOpacity, Text } from 'react-native';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="StudentForm">
          <Stack.Screen name="Students" component={ListScreen} options={{ title: 'Students' }} />
          <Stack.Screen
            name="StudentForm"
            component={FormScreen}
            options={({ navigation }) => ({
              title: 'New student',
              headerRight: () => (
                <TouchableOpacity onPress={() => navigation.navigate('Students')} style={{ paddingHorizontal: 8 }}>
                  <Text style={{ color: '#0a7', fontWeight: '700' }}>Show list</Text>
                </TouchableOpacity>
              ),
            })}
          />
          <Stack.Screen name="StudentView" component={ViewScreen} options={{ title: 'Details' }} />
        </Stack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
