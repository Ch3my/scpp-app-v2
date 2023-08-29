import AsyncStorage from '@react-native-async-storage/async-storage';

export const StoreData = async (key: string, value: string) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (e) {
    // saving error
  }
};

export const GetData = async (key: string): Promise<string | null> => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value; // Return the retrieved value
  } catch (e) {
    // Handle error reading value
    console.error('Error reading value:', e);
    return null;
  }
};