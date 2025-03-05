// Import Firebase moduly
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

// Firebase konfigurace
const firebaseConfig = {
    apiKey: "AIzaSyBchdjFEa0njLG5xpXWhPMJqq4O34gysNg",
    authDomain: "ufclosovani.firebaseapp.com",
    projectId: "ufclosovani",
    storageBucket: "ufclosovani.firebasestorage.app",
    messagingSenderId: "138751202363",
    appId: "1:138751202363:web:71fcefa92e79a90c9fb81e",
    measurementId: "G-Q4MZ39CYVD"
};

// Inicializace Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Seznam bojovníků
const allFighters = [
    'Omari Akhmedov', 'Michael Bisping', 'Derek Brunson', 'Jared Canonnier', 'Khamzat Chimaev',
    'Paulo Costa', 'Nick Diaz', 'Dricus Du Plessis', 'Kelvin Gastelum', 'Uriah Hall',
    'Jack Hermansson', 'Kevin Holland', 'Krzysztof Jotko', 'Lyoto Machida', 'Demian Maia',
    'Bo Nickal', 'Alex Pereira', 'Luke Rockhold', 'Yoel Romero', 'Thiago Santos',
    'Anderson Silva', 'Anthony Smith', 'G. St-Pierre', 'Sean Strickland', 'Darren Till',
    'Marvin Vettori', 'Robert Whittaker'
];

let userRole = "";

// Funkce pro přiřazení role uživatele (user1 nebo user2)
async function assignUserRole() {
    const docRef = doc(db, "game", "state");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        if (!data.user1) {
            await setDoc(docRef, { user1: true }, { merge: true });
            userRole = "user1";
        } else if (!data.user2) {
            await setDoc(docRef, { user2: true }, { merge: true });
            userRole = "user2";
        } else {
            alert("Hra je již obsazena!");
        }
    } else {
        await setDoc(docRef, { user1: true });
        userRole = "user1";
    }
}

// Funkce pro losování bojovníků
async function drawFighters() {
    let selectedFighters = [];
    let availableFighters = [...allFighters]; // Kopie seznamu bojovníků

    // Losování 8 bojovníků
    for (let i = 0; i < 8; i++) {
        const randomIndex = Math.floor(Math.random() * availableFighters.length);
        selectedFighters.push(availableFighters[randomIndex]);
        availableFighters.splice(randomIndex, 1); // Odstranit vylosovaného bojovníka
    }

    // Uložení vylosovaných bojovníků do Firestore
    const docRef = doc(db, "game", userRole); 
    await setDoc(docRef, { fighters: selectedFighters });
}

// Funkce pro losování zápasů
async function drawMatchups() {
    const docUser1 = await getDoc(doc(db, "game", "user1"));
    const docUser2 = await getDoc(doc(db, "game", "user2"));

    if (docUser1.exists() && docUser2.exists()) {
        const matchups = docUser1.data().fighters.map((fighter, index) => `${fighter} vs. ${docUser2.data().fighters[index]}`);
        await setDoc(doc(db, "game", "matchups"), { matches: matchups });
    }
}

// Posluchače pro aktualizaci UI v reálném čase
onSnapshot(doc(db, "game", "user1"), (doc) => {
    if (doc.exists()) {
        document.getElementById('fighters1').innerText = doc.data().fighters.join(', ');
    }
});

onSnapshot(doc(db, "game", "user2"), (doc) => {
    if (doc.exists()) {
        document.getElementById('fighters2').innerText = doc.data().fighters.join(', ');
    }
});

onSnapshot(doc(db, "game", "matchups"), (doc) => {
    if (doc.exists()) {
        document.getElementById('matchup').innerText = doc.data().matches.join('\n');
    }
});

// Přidání posluchačů na tlačítka
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('drawFighterBtn').addEventListener('click', async () => {
        userRole = "user1";
        await drawFighters();
    });

    document.getElementById('drawFighterBtn2').addEventListener('click', async () => {
        userRole = "user2";
        await drawFighters();
    });

    document.getElementById('drawMatchupBtn').addEventListener('click', drawMatchups);
});
