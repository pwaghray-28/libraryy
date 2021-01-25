import  firebase from 'firebase'
var firebaseConfig = {
    apiKey: "AIzaSyAFmZAEVK8cMLjklCbPtjp5MdeQVBOCOaY",
    authDomain: "library-21651.firebaseapp.com",
    projectId: "library-21651",
    storageBucket: "library-21651.appspot.com",
    messagingSenderId: "686114170524",
    appId: "1:686114170524:web:83020b23f03a46521aef59"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  export default firebase.firestore()