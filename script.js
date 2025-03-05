// Import Firebase SDK
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getFirestore, collection, doc, setDoc, getDoc, onSnapshot, deleteDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

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

// Seznam všech bojovníků
const allFighters = [
    'Omari Akhmedov', 'Michael Bisping', 'Derek Brunson', 'Jared Canonnier', 'Khamzat Chimaev',
    'Paulo Costa', 'Nick Diaz', 'Dricus Du Plessis', 'Kelvin Gastelum', 'Uriah Hall',
    'Jack Hermansson', 'Kevin Holland', 'Krzysztof Jotko', 'Lyoto Machida', 'Demian Maia',
    'Bo Nickal', 'Alex Pereira', 'Luke Rockhold', 'Yoel Romero', 'Thiago Santos',
    'Anderson Silva', 'Anthony Smith', 'G. St-Pierre', 'Sean Strickland', 'Darren Till',
    'Marvin Vettori', 'Robert Whittaker'
];

// Přidání posluchačů pro tlačítka
document.getElementById('drawFighterBtnUser1').addEventListener('click', () => drawFighters('user1'));
document.getElementById('drawFighterBtnUser2').addEventListener('click', () => drawFighters('user2'));
document.getElementById('drawMatchupBtn').addEventListener('click', drawMatchups);
document.getElementById('resetGameBtn').addEventListener('click', resetGame);

// Funkce pro losování zápasníků
async function drawFighters(user) {
    const selectedFighters = [];
    let availableFighters = [...allFighters];

    // Losování 8 různých zápasníků
    for (let i = 0; i < 8; i++) {
        const randomIndex = Math.floor(Math.random() * availableFighters.length);
        selectedFighters.push(availableFighters[randomIndex]);
        availableFighters.splice(randomIndex, 1);
    }

    await setDoc(doc(db, "game", user), { fighters: selectedFighters });
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

// Funkce pro resetování hry
async function resetGame() {
    await deleteDoc(doc(db, "game", "user1"));
    await deleteDoc(doc(db, "game", "user2"));
    await deleteDoc(doc(db, "game", "matchups"));
    await setDoc(doc(db, "game", "state"), { reset: true });  // Indikátor resetu
}

// Posluchače na aktualizaci dat v reálném čase
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
