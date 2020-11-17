import * as React from 'react'
import {Text,View, FlatList,TouchableOpacity ,TextInput} from 'react-native'
import db from '../config';
import TransactionScreen from './BookTransactionScreen';
export default class SearchScreen extends React.Component{
 constructor(){
    super();
    this.state=({
         allTransactions:[],
         lastVisibleTransaction:null,
         search:""
     })
 } 
 componentDidMount = async () =>{
    const query = await db.collection('Transactions').get();
    query.docs.map((doc)=>{
        this.setState({
            allTransactions:[...this.state.allTransactions,doc.data()]
        })
    })
 }

 fetchMoreTransactions = async () =>{
     var text=this.state.search.toUpperCase();
     var enteredText = text.split("");
    if(enteredText[0].toUpperCase==='B'){
        const transaction = await db.collection('Transactions').where('Book Id','==',text).startAfter(this.state.lastVisibleTransaction).limit(10).get();
        transaction.docs.map((doc)=>{
            this.setState({
             allTransactions:[...this.state.allTransactions,doc.data()],
             lastVisibleTransaction:doc
            })
        })}
    else if (enteredText[0].toUpperCase==='S'){ 
    const query = await db.collection('Transactions').startAfter(this.state.lastVisibleTransaction).limit(10).get();
    query.docs.map((doc)=>{
    this.setState({
        allTransactions:[...this.state.allTransactions,doc.data()],
        lastVisibleTransaction : doc   
    })
    })
    }
};

searchTransactions = async (text) =>{
var enteredText = text.split("");
var text= toUpperCase();
if(enteredText[0].toUpperCase==='B'){
const transaction = await db.collection('Transactions').where('Book Id','==',text).get();
transaction.docs.map((doc)=>{
    this.setState({
     allTransactions:[...this.state.allTransactions,doc.data()],
     lastVisibleTransaction:doc
    })
})
}else if(enteredText[0].toUpperCase==='S'){
    const transaction = await db.collection('Transactions').where('Student Id','==',text).get();
    transaction.docs.map((doc)=>{
        this.setState({
         allTransactions:[...this.state.allTransactions,doc.data()],
         lastVisibleTransaction:doc
        })
    })  
}
}
    render(){
        return( 
            <View style={styles.container}>
                <View style={styles.searchBar}> 
                    <TextInput style={styles.bar} 
                    placeholder='Enter BookId or StudentId' 
                    onChangeText={async=(text)=>{
                                    this.setState({
                                        search:text
                    })}}/>
                    <TouchableOpacity style={styles.searchButton} 
                        onPress={()=>{this.searchTransactions(this.state.search);}}> 
                        <Text> Search </Text>
                    </TouchableOpacity>
                </View>
                
            <FlatList data = {this.state.allTransactions}
             renderItem = {({item})=>(
                <View style={{borderBottomWidth:2}} key={index}>
                <Text>
                {'Transaction Type:'+ transaction.TransactionType}
                </Text>
                <Text>
                {'Book Id:'+ transaction.BookId}
                </Text>
                <Text>
                {'Student Id:'+ transaction.StudentId}
                </Text>
                <Text>
                {'Date:'+ transaction.Date.toDate()}
                </Text>
            </View>   
             )} 
             keyExtractor = {(item,index)=>{
                index.toString();
             }}
             onEndReachedThreshold={0.7}
             onEndReached={this.fetchMoreTransactions}>
                <Text> Search </Text>

            </FlatList>
            </View>
        )
    }
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      marginTop: 20
    },
    searchBar:{
      flexDirection:'row',
      height:40,
      width:'auto',
      borderWidth:0.5,
      alignItems:'center',
      backgroundColor:'grey',
  
    },
    bar:{
      borderWidth:2,
      height:30,
      width:300,
      paddingLeft:10,
    },
    searchButton:{
      borderWidth:1,
      height:30,
      width:50,
      alignItems:'center',
      justifyContent:'center',
      backgroundColor:'green'
    }
  })

