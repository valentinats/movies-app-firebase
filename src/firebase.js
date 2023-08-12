import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { collection, setDoc, getDocs, deleteDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA3Tj7zktzxkMQHyHTtVllmiwe9h3offbk",
  authDomain: "moviesapp-f90af.firebaseapp.com",
  projectId: "moviesapp-f90af",
  storageBucket: "moviesapp-f90af.appspot.com",
  messagingSenderId: "429761830873",
  appId: "1:429761830873:web:5309f587666163338843c8",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addDataToFirestore(card) {
  try {
    const newCard = {
      ...card,
      createdAt: serverTimestamp(),
    };

    await setDoc(doc(db, "movies", card.id), newCard);
    //console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

async function getDataToFirestore() {
  const querySnapshot = await getDocs(collection(db, "movies"));
  querySnapshot.forEach((doc) => {
    console.log(`${doc.id} => ${doc.data().title}`);
  });
}

async function deleteDataFromFirestore(cardId) {
  try {
    await deleteDoc(doc(db, "movies", cardId));
    console.log("Document deleted with ID: ", cardId);
  } catch (e) {
    console.error("Error deleting document: ", e);
  }
}

addDataToFirestore();
getDataToFirestore();
deleteDataFromFirestore();