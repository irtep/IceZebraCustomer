
const listenSend = document.getElementById('sendMsg').addEventListener('click', sMbuttonClicked);
const messageLine = document.getElementById('chatInput');
const messut = document.getElementById('chatWindow');
const customersName = document.getElementById('customersName');
const listenName = document.getElementById('submitName').addEventListener('click', subName);
const myChat = {
  docRefId: null,
  id: null,
  myName: null,
  messages: [],
  helperOnline: false,
  helperId: null
};
// event listener for enter:
messageLine.addEventListener("keydown", function (e) {
  if (e.keyCode === 13) {  //checks whether the pressed key is "Enter"
    if (myChat.myName === null) {
      subName();
    } else {
      if (messageLine.value !== '') {
        const freshMsg = sendMessage(myChat.myName, messageLine.value);
        messageLine.value = '';
        myChat.messages.push(freshMsg);
        db.collection('chats').doc(myChat.docRefId).update({
          messages: myChat.messages
        });
      }
    }
  }
});
// makes correct message line
function sendMessage(myName, myMessage){
  const d = new Date();
  const h = d.getHours();
  const m = d.getMinutes();
  const s = d.getSeconds();
  const newMsg = messageLine.value;
  const allMsg = `<br>${h}:${m}:${s} ${myName}: ${myMessage}`;
  return allMsg;
}
// sendMessageButton clicked
function sMbuttonClicked() {
  if (messageLine.value !== '') {
    const freshMsg = sendMessage(myChat.myName, messageLine.value);
    messageLine.value = '';
    myChat.messages.push(freshMsg);
    db.collection('chats').doc(myChat.docRefId).update({
      messages: myChat.messages
    });
  }
}
// submits customers name
function subName() {
  myChat.myName = customersName.value;
  if (customersName.value === '') {
    const rdNbr =  1 + Math.floor(Math.random() * 100);
    myChat.myName = 'tuntematon asiakas ' + rdNbr;
  }
  // show what need to show, and dont want dont
  document.getElementById('mainPart').classList.remove('noShow');
  document.getElementById('askName').classList.add('noShow');
  messageLine.focus();
  // create chat id stamp
  myChat.id = new Date().getTime() + myChat.myName;
  // sign in to firebase
  firebase.auth().signInAnonymously().catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
  // ...
  });
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in.
      console.log('logged in');
      const customerEnters = sendMessage(myChat.myName, 'avasi chatin.');
      myChat.messages.push(customerEnters);
      //  writeChatData(myChat.id, myChat.myName, myChat.messages);
      db.collection("chats").add({
        chatId: myChat.id,
        name: myChat.myName,
        messages: myChat.messages
      })
      .then(function(docRef) {
        console.log("Document written with ID: ", docRef.id);
        myChat.docRefId = docRef.id;
      })
      .catch(function(error) {
        console.error("Error adding document: ", error);
      });
    } else {
      console.log('error in logging in');
    }
  });
  messageLine.focus();
}
// real-time listener
db.collection("chats").orderBy("name").onSnapshot(snapshot => {
  let changes = snapshot.docChanges();
  changes.forEach(change => {
    //console.log(change.doc.data());
    if (change.type == "added") {
      if (change.doc.data().chatId === myChat.id) {
        messut.innerHTML += change.doc.data().messages;
      }
    } else if (change.type == "removed") {
      //console.log('change type removed');
    } else if (change.type === 'modified') {
      if (change.doc.data().chatId === myChat.id) {
        messut.innerHTML += change.doc.data().messages[change.doc.data().messages.length - 1];
      }
    }
  });
});
// when window is loaded
window.onload = ( ()=> {
  // focus on command line:
  customersName.focus();
});
// when window is closed
window.onbeforeunload = ( ()=> {
  // at this point if needed could save the chat to archives.
  // Delete old chat from database
  db.collection("chats").doc(myChat.docRefId).delete();
});
