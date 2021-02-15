import React, {useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ActivityIndicator, FlatList } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

//Creating the home screen with text "CityPop" and two buttons, each refer to a new screen.
function HomeScreen({navigation}) {
  return (
    <View style={styles.container}>
      <Text style = {styles.info}>
        CityPop
      </Text>
      <TouchableOpacity
        onPress = {() => navigation.navigate('Search by city')} 
        style = {styles.button}>
          <Text style = {styles.button_text}> Search by city</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress = {() => navigation.navigate('Search by country')} 
        style = {styles.button}>
          <Text style = {styles.button_text}> Search by country</Text>
      </TouchableOpacity>
    </View>
  );
}

//Creating screen "for search by city"
function SearchByCity({navigation}) {
  const [value, onChangeText] = React.useState(''); //creates a state which can be updated
  return (
    <View style={styles.container}>
      <Text style = {styles.info}>
        Search by city
      </Text>
      <TextInput // creates a input block where user can type in a city
       style = {styles.input}
       placeholder = 'Enter a city'
       onChangeText = {text => onChangeText(text)} // Updates the state
       value = {value}
      />
      <TouchableOpacity // Button that refers to the City screen, brings text input value to next screen too
        onPress = {() => navigation.navigate('City',{
          save_search: value
        }
        )} 
        style = {styles.button}>
          <Text style = {styles.button_text}> Search </Text>
      </TouchableOpacity>
    </View>
  )
}

function SearchByCountry ({navigation}) {
  const [value, onChangeText] = React.useState(''); //creates a state which can be updated
  return (
    <View style={styles.container}>
      <Text style = {styles.info}>
        Search by country
      </Text>
      <TextInput
       style = {styles.input}
       placeholder = 'Enter a country'
       onChangeText = {text => onChangeText(text)} //Updates the state
       value = {value}
      />
      <TouchableOpacity // Button that refers to the country screen, brings text input value to next screen too
        onPress = {() => navigation.navigate('Country',{
          save_search: value
        }
        )} 
        style = {styles.button}>
          <Text style = {styles.button_text}> Search </Text>
      </TouchableOpacity>
    </View>
  )
  
 
}

//Creates screen that visualizes the population for the searched city
function City ({route, navigation}){
  const [isLoading, setLoading] = useState(true); //creates state for loading page
  const [data, setData] = useState([]); //creates state for data
  const { save_search} = route.params; // saves the input from earlier in variable save_search
  //create string that will be used to perform the search through API
  let first_part_string = 'http://api.geonames.org/searchJSON?q=';
  let second_part_string = save_search;
  let third_part_string = '&maxRows=10&username=weknowit';
  let complete_string = first_part_string+second_part_string+third_part_string;

  //Fetching the information from API by fetch method and catches error if it does not work
  useEffect(() => {
  fetch(complete_string)
      .then((response) => response.json())
      .then((json) => setData(json.geonames))
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, []);

  //Show loading icon if information from API not has loaded yet
  if (isLoading == true ){
    return (
      <View style= {styles.container}>
      <ActivityIndicator/>
      </View>
    );
    // When API has loaded, if search in API is equal to what was typed in -> show results
  } else if (data[0]){ // checks that data is not null, undefined, NaN, false or anything else that throws an error
    if ( save_search == data[0].toponymName || (save_search == data[0].toponymName + " ")){
      numb = data[0].population.toLocaleString()
      return (
      <View style= {styles.container}>
      <Text style = {styles.info}> {data[0].toponymName}</Text>
      <Text style={styles.pop}> Population</Text>
      <Text style = {styles.numb}> {numb} </Text>
      </View>
    );
    }else{ // If search in API was different from user type in, probably because could not find that city -> show could not find city
      return (
      <View style= {styles.container}>
      {isLoading ? <ActivityIndicator/> : (
      <Text style = {styles.err_mess}>
       Could not find {save_search} as a city, please go back and search again
      </Text>
      )}
      </View>);
    }
  }else{ // If search in API was undefined, probably because API could not find city
    return (
    <View style= {styles.container}>
    {isLoading ? <ActivityIndicator/> : (
    <Text style = {styles.err_mess}>
     Could not find {save_search} as a city, please go back and search again
    </Text>
    )}
    </View>);
  }
}
//Creates page with the 3 largest cities the country typed in in search by country   
function Country ({route,navigation}){
  const [isLoading, setLoading] = useState(true); //creates state for loading page
  const [data, setData] = useState([]); //creates state for data
  const { save_search} = route.params; // saves the input from earlier in variable save_search
  //create string that will be used to perform the search through API
  let first_part_string = 'http://api.geonames.org/searchJSON?q=';
  let second_part_string = save_search;
  let third_part_string = '&maxRows=20&cities=cities5000&username=weknowit'; // Tidigare 500
  let complete_string = first_part_string+second_part_string+third_part_string;

  //Fetching the information from API by fetch method and catches error if it does not work
  useEffect(() => {
  fetch(complete_string)
      .then((response) => response.json())
      .then((json) => setData(json.geonames))
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, []);

  //Show loading icon if information from API not has loaded yet
  if (isLoading == true){
    return (
      <View style= {styles.container}>
      <ActivityIndicator/>
      </View>
    );
  // If the data has loaded, organise it by filtering out all cities that do not belong to same coutry as first one
  }else if (data[0]){ // checks that data is not undefined
    var cities = new Array();
    cities.push(data[0])
    var country_id = data[0].countryId;
    for (i = 1; i< data.length; i++){
      if (data[i].countryId == country_id){
        cities.push(data[i]);
      }
    }
    //Sort the cities in order according to population size, largest number first
    cities.sort(function (a,b){
    return b.population-a.population;
      });
      //If first country found was the same as the searched one,to see that country exists , and we have found more than 3 cities
      // --> crate 3 buttons each containing one of the 3 largest cities in country
    if ((save_search == data[0].countryName || save_search == (data[0].countryName + " "))  && cities.length > 2 ){
      return(
        <View style= {styles.container}>
        <Text style = {styles.info}>
          {save_search}
        </Text>
        <TouchableOpacity
            onPress = {() => navigation.navigate('City',{
              save_search: cities[0].toponymName
            }
            )} 
            style = {styles.button}>
              <Text style = {styles.button_text}> {cities[0].toponymName} </Text>
        </TouchableOpacity>
        <TouchableOpacity
            onPress = {() => navigation.navigate('City',{
              save_search: cities[1].toponymName
            }
            )} 
            style = {styles.button}>
              <Text style = {styles.button_text}> {cities[1].toponymName} </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress = {() => navigation.navigate('City',{
              save_search: cities[2].toponymName
            }
            )} 
            style = {styles.button}>
              <Text style = {styles.button_text}> {cities[2].toponymName} </Text>
          </TouchableOpacity>

        </View>);
    //If country from API was not hte same as the one typed in, assumes it does not exist
    // -> tell user that that country was not found
    }else{
      return(
        <View style = {styles.container}>
          <Text style = {styles.err_mess}> Could not find {save_search} as a country, please go back and search again</Text>
        </View>
      );
    }
  //If data is undefined, assumes that country could not be found
  // -> tell user that that country was not found
  }else{
    return(
      <View style = {styles.container}>
        <Text style = {styles.err_mess}> Could not find {save_search} as a country, please go back and search again</Text>
      </View>
    );

  }
}


//Layout for Texts, buttons, etc
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    color: '#888',
    fontSize: 58,
    marginHorizontal: 15,
    marginBottom: 10,
    bottom: 150,
  },
  button: {
    backgroundColor: '#888',
    padding: 20,
    borderRadius: 5,
    margin: 10,
    bottom: 110
  },
  button_text: {
    fontSize: 20,
    color: '#fff',
  },
  input: {
    borderWidth: 2,
    borderColor: '#888',
    padding: 14,
    margin: 30,
    width: 280,
    bottom: 80
  },
  pop:{
    color: '#888',
    fontSize: 16,
    marginHorizontal: 15,
    marginBottom: 10,
    bottom: 50,
  },
  numb: {
    color: '#888',
    fontSize: 30,
    marginHorizontal: 15,
    marginBottom: 10,
    bottom: 50,
  },
  err_mess: {
    color: '#888',
    fontSize: 20,
    marginHorizontal: 15,
    marginBottom: 10,

  }

});

const Stack = createStackNavigator();

//Creates the app and organizes the screens with stack navigator
function App(){
  return(
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name = "Home" component={HomeScreen}/>
        <Stack.Screen name = "Search by city" component={SearchByCity}/>
        <Stack.Screen name = "Search by country" component={SearchByCountry}/>
        <Stack.Screen name = "City" component={City}/>
        <Stack.Screen name = "Country" component={Country}/>
      </Stack.Navigator>
    </NavigationContainer>

  );
}

export default App;




