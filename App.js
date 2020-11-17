import { StatusBar } from 'expo-status-bar';
import React, { Component } from 'react';
import { StyleSheet, Text, View ,Image} from 'react-native';
import TransactionScreen from './Screens/BookTransactionScreen'
import SearchScreen from './Screens/SearchScreen' 
import {createAppContainer} from 'react-navigation'
import {createBottomTabNavigator} from 'react-navigation-tabs'
export default class App extends Component {
render(){ 
   return (
  <AppContainer/>
          )
}
};
const tabNavigator=createBottomTabNavigator({
  Transaction:{screen:TransactionScreen},
  search:{screen:SearchScreen}},
  {defaultNavigationOptions:({navigation})=>({
    tabBarIcon:({})=>{
      const routeName=navigation.state.routeName
      if(routeName==='Transaction'){
        return(
          <Image style={{width:30,height:20}} source={require('./assets/book.png')}/>
        )
      }
      else if(routeName==='search'){
        return(
          <Image style={{width:30,height:20}} source={require('./assets/searchingbook.png')}/>
        )
      }
    }
  })
  
  }
  );
const AppContainer=createAppContainer(tabNavigator);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
