import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  setDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

const cardTitleInputNode = document.querySelector(".js-film-title-input");
const addCardBtn = document.querySelector(".js-add-film");
const cardsListNode = document.querySelector(".js-cards");
const resetFilmTitleBtn = document.querySelector(".js-card-check");
const resetFilmCardBtn = document.querySelector(".js-card-button");
const cardListTitle = document.querySelector(".card__title");
const cardItem = document.querySelector(".js-card-item");

const cards = JSON.parse(localStorage.getItem("cards")) || [];

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

async function deleteDataFromFirestore(cardId) {
  try {
    await deleteDoc(doc(db, "movies", cardId));
    console.log("Document deleted with ID: ", cardId);
  } catch (e) {
    console.error("Error deleting document: ", e);
  }
}

async function getDataFromFirestore() {
  const querySnapshot = await getDocs(
    query(collection(db, "movies"), orderBy("createdAt", "desc"))
  );
  querySnapshot.forEach((doc) => {
    const card = {
      id: doc.data().id,
      title: doc.data().title,
      done: doc.data().done,
      createdAt: doc.data().createdAt.toDate(),
    };
    cards.push(card);
    card.done = localStorage.getItem(`checkbox-${card.id}`) === 'true';
  });
  renderCards();
}

getDataFromFirestore();

addCardBtn.addEventListener("click", function () {
  const card = getCardFromUser();

  addDataToFirestore(card);

  cards.unshift(card); //добавляем карточку в начало массива cards.
  cards[0].done = card.done;
  renderCards(); //обновляем отображение списка карточек.
  localStorage.setItem(`checkbox-${card.id}`, card.done);
  restoreCheckboxStateFromLocalStorage();
  updateLocalStorage();
});

//получаем данные из поля ввода.
function getCardFromUser() {
  const title = cardTitleInputNode.value.trim();
  if (!title) {
    alert("Please, write the movies name");
    return;
  }

  const newCardIndex = uuidv4();

  clearInput();

  return {
    id: newCardIndex,
    title: title,
    done: false,
  };
}

const clearInput = () => {
  cardTitleInputNode.value = "";
};

//отображаем карточку.
function renderCards() {
  let cardsHTML = "";

  //обращаемся к переменной card.
  for (let i = 0; i < cards.length; i++) {
    const cssClass = cards[i].done ? "checked" : "";
    cardsHTML += ` 
          <li id="${cards[i].id}" class="js-card-item card__item ${cssClass}">
            <div class="card__elements">
            <input id="checkbox-${cards[i].id}" class="card__check" type="checkbox" data-action="done"${cssClass}> 
            <span class="fake__checkbox"></span>
            <label class="card__title" for="checkbox-${cards[i].id}">${cards[i].title}</label> 
            <div id="${cards[i].id}" class="js-card-button card__button"></div>
            </div>
          </li>
   `;
  }

  cardsListNode.innerHTML = cardsHTML;

  //добавляем сохраненные значения из local storage.
  for (let i = 0; i < cards.length; i++) {
    const checkbox = document.getElementById(`checkbox-${cards[i].id}`);
    const isChecked =
      localStorage.getItem(`checkbox-${cards[i].id}`) === "true";
    checkbox.checked = isChecked;

    if (isChecked) {
      checkbox.closest(".card__item").classList.add("checked");
      checkbox.classList.add("card__check:checked");
    }
  }
}

function deleteCard(cardId) {
  const cardIndex = cards.findIndex((card) => card.id === cardId);
  if (cardIndex !== -1) {
    deleteDataFromFirestore(cardId);
    const cardNode = document.getElementById(cardId);
    if (cardNode) {
      cardNode.remove();
    }

    cards.splice(cardIndex, 1);
    renderCards();
  }
}

cardsListNode.addEventListener("click", (event) => {
  if (event.target.className === "js-card-button card__button") {
    const cardId = event.target.parentNode.parentNode.id; //используем parentNode два раза, чтобы получить родительский элемент списка .js-card-item, а затем его id.
    deleteCard(cardId);
    renderCards();
  }
});

function updateLocalStorage() {
  const checkboxes = document.querySelectorAll(".card__check");
  checkboxes.forEach((checkbox) => {
    const cardId = checkbox.id.split("-")[1];
    const isChecked = checkbox.checked;
    localStorage.setItem(`checkbox-${cardId}-checked`, isChecked ? 'true' : 'false');
  });
}

function restoreCheckboxStateFromLocalStorage() {
  const checkboxes = document.querySelectorAll(".card__check");
  checkboxes.forEach((checkbox) => {
    const cardId = checkbox.id.split("-")[1];
    const isChecked = localStorage.getItem(`checkbox-${cardId}-checked`) === 'true';
    checkbox.checked = isChecked;
  });
  updateLocalStorage();

  //восстанавливаем состояние checked для новой карточки.
  const newCardCheckbox = document.querySelector(`#checkbox-${cards.id}`);
  if (newCardCheckbox) {
    const isChecked = localStorage.getItem(`checkbox-${cardId}-checked`) === 'true';
    newCardCheckbox.checked = isChecked;
  }
}

//вызов функции для сохранения состояния чекбоксов в localStorage.
updateLocalStorage();

//вызов функции для восстановления состояния чекбоксов из localStorage при загрузке страницы.
restoreCheckboxStateFromLocalStorage();

//обновление состояния чекбокса в Firebase.
async function doneHandler(event) {
  if (event.target.dataset.action === "done") {
    const parentNode = event.target.closest(".card__item");
    parentNode.classList.toggle("checked");
    const cardId = parentNode.id;
    const checkboxValue = event.target.checked;
    saveCheckboxStateToLocalStorage(cardId, checkboxValue);
    updateCheckboxValueInFirestore(cardId, checkboxValue);
    updateLocalStorage();
  }
}

cardsListNode.addEventListener("click", doneHandler);

async function updateCheckboxValueInFirestore(cardId, checkboxValue) {
  try {
    const cardRef = doc(db, "movies", cardId);
    await setDoc(cardRef, { done: checkboxValue }, { merge: true });
    console.log("Checkbox value updated in Firestore");
  } catch (e) {
    console.error("Error updating checkbox value in Firestore: ", e);
  }
}

function saveCheckboxStateToLocalStorage(cardId, isChecked) {
  localStorage.setItem(`checkbox-${cardId}`, isChecked);
}