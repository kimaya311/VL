import * as React from'react'
import {Text,View,TouchableOpacity,StyleSheet,TextInput,Image, KeyboardAvoidingView,ToastAndroid, Alert} from 'react-native'
import {BarCodeScanner} from 'expo-barcode-scanner'
import * as Permissions from 'expo-permissions'
import * as firebase from 'firebase'
import db from '../config.js'

export default class TransactionScreen extends React.Component {
 constructor(){
     super();
     this.state={
        hasCamPermissions:null,
        scanned:false,
        buttonState:'normal',
        scannedBookId:'',
        scannedStudentId:'',
        transactionmessage:''
     }
 } 
 checkStudentEligibiltyForBookIssue = async() =>{
     console.log(this.state.scannedStudentId)
     const studentRef = await db.collection('Students').where('Student Id','==',this.state.scannedStudentId.toString()).get();

 var isStudentEligible='';
 if(studentRef.docs.length===0){
     this.setState({
         scannedStudentId:'',
         scannedBookId:''
     })
     isStudentEligible=false;
     Alert.alert('The StudentId doesnt exist in the database')
 }else {
     studentRef.docs.map((doc)=>{
         var Student= doc.data();
         if(studentRef.BooksIssued<3){
             isStudentEligible=true;
         }else{
             isStudentEligible=false;
             Alert.alert("The student has already issued three books");
             this.setState({
                 scannedStudentId:'',
                 scannedBookId:''
             })
         }
     })
 }return isStudentEligible
}
checkStudentEligibiltyForBookReturn = async() =>{
    const transactionRef =  await db.collection('Transaction').where('Book Id','==', this.state.scannedBookId).limit(1).get();
    var isStudentEligible='';
    transactionRef.docs.map((doc)=>{
        var lastBookT=doc.data();
        if(lastBookT.StudentId===this.state.scannedStudentId){
            isStudentEligible=true;
        }else {
            isStudentEligible=false;
            Alert.alert('The book wasnt issued by this student');
            this.setState({
                scannedBookId:'',
                scannedStudentId:''
            })
        }
    }) 
    return isStudentEligible
}
checkBookEligibilty = async() =>{
    const bookRef = await db.collection('Books').where('Book Id','==',this.state.scannedBookId).get();
    var transactionType='';
    if(bookRef.docs.length===0){
        transactionType=false;
    }else {
    bookRef.docs.map((doc)=>{
        var book=doc.data();
        if(book.Availability){
    transactionType='issue';
        }else{
            transactionType='return';  
        }
    });
    }  
    
    return transactionType  
}
 initiateBookIssue = async() =>{
     db.collection('Transaction').add({
         'StudentId':this.state.scannedStudentId,
         'BookId': this.state.scannedBookId,
         'Date':firebase.firestore.Timestamp.now().toDate(),
         'TransactionType':'issue'
     })
     db.collection('Books').doc(this.state.scannedBookId).update({
         'Availability':false
     })
     db.collection('Students').doc(this.state.scannedStudentId).update({
         'BooksIssued':firebase.firestore.FieldValue.increment(1)
     })
 } 
 
 initiateBookReturn = async() =>{
    db.collection('Transaction').add({
        'StudentId':this.state.scannedStudentId,
        'BookId': this.state.scannedBookId,
        'Date':firebase.firestore.Timestamp.now().toDate(),
        'TransactionType':'return'
    })
    db.collection('Books').doc(this.state.scannedBookId).update({
        'Availability':true
    })
    db.collection('Students').doc(this.state.scannedStudentId).update({
        'BooksIssued':firebase.firestore.FieldValue.increment(-1)
    }) 
 }
getCamPermission = async(id) =>{
const {status}= await Permissions.askAsync(Permissions.CAMERA);
this.setState({
    hasCamPermissions:status==="granted",
    buttonState :id,
    scanned: false
});
}
handleBarcodeScanned = async({type,data})=>{
    const {buttonState}=this.state.buttonState();
    if(buttonState==='BookId'){
    this.setState({
scanned:true,
scannedBookId:data,
buttonState:'normal'
})
} else if(buttonState==='StudentId'){
    this.setState({
        scanned:true,
        scannedStudentId:data,
        buttonState:'normal'
        })
        }
}  
handleTransaction= async()=>{
var transactionType = await this.checkBookEligibilty();
if(!transactionType){
    Alert.alert('The book does not exist in the base');
    this.setState({
       scannedStudentId:'',
       scannedBookId:''
    })
}else if(transactionType==='issue'){
    var ifStudentEligible = await this.checkStudentEligibiltyForBookIssue();
    if(ifStudentEligible){
        this.initiateBookIssue();
        Alert.alert("Book Issued to Student")
    }
}else {var ifStudentEligible = await this.checkStudentEligibiltyForBookReturn();
    if(ifStudentEligible){
        this.initiateBookReturn();
        Alert.alert("Book returned by Student")
    }}
}

render(){
const hasCamPermissions = this.state.hasCamPermissions;
const scanned = this.state.scanned;
const buttonState = this.state.buttonState;
if(buttonState !=='normal'&& hasCamPermissions){
return (
    <BarCodeScanner 
    onBarCodeScanned={scanned?undefined:this.handleBarcodeScanned} 
    style={StyleSheet.absoluteFillObject}/>
   )
}else if (buttonState==='normal'){
    return( 
        <KeyboardAvoidingView style={styles.container} behaviour='padding' enabled>
            <View>
              <Image style={{width:200,height:200}} source={require("../assets/booklogo.jpg")}/>  
              <Text style={{textAlign:'center',fontSize:30}}> VILY  </Text>
            </View>
            <View style={styles.inputView}>
                <TextInput style={styles.inputBox} placeholder='Book Id' value={this.state.scannedBookId}
                onChangeText={text=>this.setState({
                    scannedBookId:text
                })}/>
                <TouchableOpacity style={styles.scanButton} 
          onPress={()=>{this.getCamPermission('BookId')}}>
              <Text style={styles.displayText}>
                Scan
              </Text>
          </TouchableOpacity>

        </View>
                <View style={styles.inputView}>
                    <TextInput style={styles.inputBox} placeholder='Student Id' value={this.state.scannedStudentId}
                    onChangeText={text=>this.setState({
                        scannedStudentId:text
                    })}/>
                    <TouchableOpacity style={styles.scanButton} 
          onPress={()=>{this.getCamPermission('StudentId')}}>
              <Text style={styles.displayText}>
            Scan QRcode
              </Text>
          </TouchableOpacity>
                </View>
                <View> 
                    <TouchableOpacity style={styles.submitButton} onPress={async()=>{
                        this.handleTransaction();
                        /*this.setState({
                            scannedBookId:'',
                            scannedStudentId:''
                        })*/
                        }}>
                        <Text style={styles.submitButtonText}> SUBMIT </Text>
                    </TouchableOpacity>
                </View>
                </KeyboardAvoidingView>
    )}
}}
const styles =StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center'
    },
    displayText: {
        textAlign: 'center',
        fontSize: 30,
        textDecorationLine: 'underline'
      },
      scanButton: {
          backgroundColor:'#66886a',
          width:50,
          borderWidth:1.5,
          borderLeftWidth:0
      },
      inputView: {
          flexDirection:'row',
          margin:20,
      },
      buttonText: {
          fontSize:15,
          textAlign:'center',
          marginTop:10
      },
      inputBox: {
        width:200,
        height:40,
        borderWidth:1.5,
        borderRightWidth:0,
        fontSize:20
      },
      submitButton: {
        backgroundColor:'orange'  ,
        width:100,
        height:80
      },
      submitButtonText: {
          padding:10,
          fontSize:20,
          textAlign:'center',
          fontWeight:'bold',
          color:'blue'
      }
})