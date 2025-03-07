import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, FlatList, View, Text, Keyboard, TouchableOpacity } from 'react-native';
import { firestore } from './firebase/Config';
import { collection, addDoc, deleteDoc, doc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function App() {
  const [newItem, setNewItem] = useState('');
  const [items, setItems] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(firestore, 'shoppingList'), (snapshot) => {
      const fetchedItems = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const sortedItems = fetchedItems.sort((a, b) => {
        const aTimestamp = a.createdAt ? a.createdAt.toMillis() : 0;
        const bTimestamp = b.createdAt ? b.createdAt.toMillis() : 0;
        return bTimestamp - aTimestamp;
      });
      setItems(sortedItems);
    });

    return unsubscribe;
  }, []);

  const handleAddItem = async () => {
    if (newItem.trim()) {
      await addDoc(collection(firestore, 'shoppingList'), {
        name: newItem,
        createdAt: serverTimestamp(),
      });
      setNewItem('');
      Keyboard.dismiss();
    }
  };

  const handleDeleteItem = async (id) => {
    await deleteDoc(doc(firestore, 'shoppingList', id));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shopping list</Text>
      <TextInput
        style={styles.input}
        placeholder="Add new item..."
        value={newItem}
        onChangeText={setNewItem}
        onSubmitEditing={handleAddItem}
      />
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View>
            <View style={styles.itemContainer}>
              <Text style={styles.itemText}>{item.name}</Text>
              <TouchableOpacity onPress={() => handleDeleteItem(item.id)}>
                <MaterialCommunityIcons name="trash-can" size={24} color="#000000" />
              </TouchableOpacity>
            </View>
            <View style={styles.divider} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'left',
    color: '#333',
  },
  input: {
    fontSize: 16,
    borderWidth: 0,
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
    backgroundColor: '#f5f5f5',
    alignSelf: 'stretch',
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  itemText: {
    fontSize: 16,
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
  },
});
