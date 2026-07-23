import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React from 'react';

const screenWidth = Dimensions.get('screen').width;

const CardComponent = ({
  item,
}: {
  item: { name: string; number: string; ccv: string; expiry: number };
}) => {
  return (
    <Pressable
      style={styles.movieItem}
      onPress={() => {
        console.log('Card pressed:', item.name);
      }}>
      <View style={styles.movieDetails}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.description}>{item.number}</Text>
        <Text style={styles.description}>{item.ccv}</Text>
        <Text style={styles.description}>
          {new Date(item.expiry).toLocaleDateString()}
        </Text>
      </View>
    </Pressable>
  );
};

const ListEmptyComponent = () => {
  return (
    <View style={styles.center}>
      <Text style={styles.demoTitle}>FlatList Empty</Text>
    </View>
  );
};

const CardsScreen = () => {
  const data = [
    {
      name: 'Tugdual de Revieres',
      number: '1234 5678 9012 3456',
      ccv: '123',
      expiry: Date.now(),
    },
    {
      name: 'Aron Herrera',
      number: '9876 5432 1098 7654',
      ccv: '456',
      expiry: Date.now(),
    },
  ];

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        renderItem={CardComponent}
        keyExtractor={item => item?.name}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={ListEmptyComponent}
      />
    </View>
  );
};

export default CardsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  movieItem: {
    marginVertical: 10,
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 10,
    borderColor: '#00A9F1',
    borderWidth: 1,
    borderRadius: 15,
  },
  poster: {
    width: screenWidth * 0.9,
    height: 220,
    resizeMode: 'cover',
    marginVertical: 10,
    borderRadius: 10,
  },
  movieDetails: {
    padding: 5,
    paddingHorizontal: 7,
    alignItems: 'flex-start',
    width: screenWidth * 0.85,
  },
  title: {
    fontSize: 20,
    marginBottom: 5,
    fontFamily: 'Pangram-Bold',
    lineHeight: 26,
    color: 'black',
  },
  demoTitle: {
    fontSize: 22,
    marginBottom: 5,
    fontFamily: 'Pangram-Bold',
    lineHeight: 26,
    marginVertical: 10,
    color: 'black',
  },
  description: {
    fontSize: 17,
    fontFamily: 'Pangram-Regular',
    lineHeight: 26,
    marginBottom: 10,
    textAlign: 'left',
    color: 'black',
  },
  about: {
    fontSize: 17,
    fontFamily: 'Pangram-Regular',
    lineHeight: 30,
    marginVertical: 10,
    marginHorizontal: 20,

    color: 'black',
  },
  searchDescription: {
    fontSize: 22,
    fontFamily: 'Pangram-Regular',
    marginBottom: 10,
  },
  searchLoader: {
    paddingTop: 30,
    marginTop: 20,
    marginBottom: 30,
  },
  searchMovies: {
    width: screenWidth * 0.8,
    height: 300,
  },
});
