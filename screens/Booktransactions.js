import React from 'react';
import { Text, View, TouchableOpacity, TextInput, Image, StyleSheet } from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import db from '../config'
import firebase from 'firebase'

export default class TransactionScreen extends React.Component {
    constructor(){
      super();
      this.state = {
        hasCameraPermissions: null,
        scanned: false,
        scannedBookId: '',
        scannedStudentId:'',
        buttonState: 'normal',
        transactionmessage: ""
      }
    }

    getCameraPermissions = async (id) =>{
      const {status} = await Permissions.askAsync(Permissions.CAMERA);
      
      this.setState({
        /*status === "granted" is true when user has granted permission
          status === "granted" is false when user has not granted the permission
        */
        hasCameraPermissions: status === "granted",
        buttonState: id,
        scanned: false
      });
    }

    handleBarCodeScanned = async({type, data})=>{
      const {buttonState} = this.state

      if(buttonState==="BookId"){
        this.setState({
          scanned: true,
          scannedBookId: data,
          buttonState: 'normal'
        });
      }
      else if(buttonState==="StudentId"){
        this.setState({
          scanned: true,
          scannedStudentId: data,
          buttonState: 'normal'
        });
      }
      
    }
    checkbookeligibility(){
      var ref = db.collection("Books").doc(this.state.scannedBookId).get()
  var transactiontype = ""
  if(ref.docs.length === 0){
    transactiontype = false
  }
  else{
    ref.docs.map(doc=>{
      var book  = doc.data()
      if(book.bookavailability){transactiontype = "issue"}
      else{transactiontype = "return"}
      
    })
  }
  return transactiontype
  }
  checkeleigibilityforissue(){
    var ref = db.collection("Students").where("studentid","==", this.state.scannedBookId).get()
  }
handleTransaction = async()=>{
var transactiontype = await this.checkbookeligibility()
if(!transactiontype){alert("Book not present in the library");
this.setState({scannedStudentId:"",scannedBookId:""})}
else if (transactiontype === "issue"){var isstudenteligible = await this.checkeleigibilityforissue();
if(isstudenteligible){
  this.initiatebookissue()
  alert ("Book has been issued") 
}
}
else{
  var isstudenteligible = await this.checkeleigibilityforreturn();
    if(isstudenteligible){
      this.initiatebookreturn()
      alert ("Book has been returned") 
    }
}
  
}
initiatebookissue = async()=>{
  alert("bookissue")
  db.collection("transactions").add({
    studentid:this.state.scannedStudentId,
    bookid:this.state.scannedBookId,date:firebase.firestore.Timestamp.now().toDate(),
    transactiontype:"issue"
  })
  db.collection("Books").doc(this.state.scannedBookId).update({
    bookavailability:false
  })
  db.collection("students").doc(this.state.scannedStudentId).update({
    noofbooks:firebase.firestore.FieldValue.increment(1)
  })
  this.setState({
    scannedBookId:"",
    scannedStudentId:""
  })
}
initiatebookreturn = async()=>{
  alert("bookreturn")
  db.collection("transactions").add({
    studentid:this.state.scannedStudentId,
    bookid:this.state.scannedBookId,date:firebase.firestore.Timestamp.now().toDate(),
    transactiontype:"return"
  })
  db.collection("Books").doc(this.state.scannedBookId).update({
    bookavailability:true
  })
  db.collection("students").doc(this.state.scannedStudentId).update({
    noofbooks:firebase.firestore.FieldValue.increment(-1)
  })
  this.setState({
    scannedBookId:"",
    scannedStudentId:""
  })
}
    render() {
      const hasCameraPermissions = this.state.hasCameraPermissions;
      const scanned = this.state.scanned;
      const buttonState = this.state.buttonState;

      if (buttonState !== "normal" && hasCameraPermissions){
        return(
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
        );
      }

      else if (buttonState === "normal"){
        return(
          <View style={styles.container}>
            <View>
              <Image
                source={require("../assets/booklogo.jpg")}
                style={{width:200, height: 200}}/>
              <Text style={{textAlign: 'center', fontSize: 30}}>Wily</Text>
            </View>
            <View style={styles.inputView}>
            <TextInput 
              style={styles.inputBox}
              placeholder="Book Id"
              onChangeText = {(Text)=>{this.setState({scannedBookId:Text})}}
              value={this.state.scannedBookId}/>
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions("BookId")
              }}>
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
            </View>
            <View style={styles.inputView}>
            <TextInput 
              style={styles.inputBox}
              placeholder="Student Id"
              onChangeText = {(Text)=>{this.setState({scannedStudentId:Text})}}
              value={this.state.scannedStudentId}/>
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions("StudentId")
              }}>
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
            </View>
            <TouchableOpacity style = {styles.scanButton} onPress = {()=>{this.handleTransaction()}}>
            <Text style = {styles.buttonText}>
            Submit
            </Text>
            </TouchableOpacity>
          </View>
        );
      }
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    displayText:{
      fontSize: 15,
      textDecorationLine: 'underline'
    },
    scanButton:{
      backgroundColor: '#2196F3',
      padding: 10,
      margin: 10
    },
    buttonText:{
      fontSize: 15,
      textAlign: 'center',
      marginTop: 10
    },
    inputView:{
      flexDirection: 'row',
      margin: 20
    },
    inputBox:{
      width: 200,
      height: 40,
      borderWidth: 1.5,
      borderRightWidth: 0,
      fontSize: 20
    },
    scanButton:{
      backgroundColor: '#66BB6A',
      width: 50,
      borderWidth: 1.5,
      borderLeftWidth: 0
    }
  });