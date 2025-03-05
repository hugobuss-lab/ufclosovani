// Import Firebase SDK
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getFirestore, collection, doc, setDoc, getDoc, deleteDoc, onSnapshot } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

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

// Funkce na resetování všech dat ve Firestore
async function resetAllData() {
    const docRef1 = doc(db, "game", "user1");
    const docRef2 = doc(db, "game", "user2");
    const docRef3 = doc(db, "game", "matchups");

    // Vymažeme všechna data
    await deleteDoc(docRef1);
    await deleteDoc(docRef2);
    await deleteDoc(docRef3);

    console.log("All previous data has been reset.");
}

// Přidělení role uživatele (user1 nebo user2)
async function assignUserRole() {
    const docRef = doc(db, "game", "state");
    const docSnap = await getDoc(docRef);

    // Pokud ještě není žádná role, přiřadíme uživateli první volnou roli
    if (!docSnap.exists()) {
        await setDoc(docRef, { user1: true });
        userRole = "user1";
    } else {
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
    }

    // Pokud má uživatel roli, umožníme mu losovat
    if (userRole) {
        document.getElementById('drawFighterBtn').disabled = false;
        document.getElementById('drawMatchupBtn').disabled = false;
    }
}

// Funkce na losování bojovníků
async function drawFighters() {
    // Pokud klikneme na "Losovat zápasníky", resetujeme stará data
    const docRef = doc(db, "game", userRole);
    await deleteDoc(docRef); // Smažeme staré zápasníky

    let selectedFighters = [];
    let availableFighters = [...allFighters]; // Kopie původního seznamu bojovníků

    // Pokud už má uživatel nějaké vylosované zápasníky, odstraníme je z dostupné nabídky
    if (userRole === "user1") {
        const docUser2 = await getDoc(doc(db, "game", "user2"));
        if (docUser2.exists()) {
            const user2Fighters = docUser2.data().fighters;
            availableFighters = availableFighters.filter(fighter => !user2Fighters.includes(fighter));
        }
    } else if (userRole === "user2") {
        const docUser1 = await getDoc(doc(db, "game", "user1"));
        if (docUser1.exists()) {
            const user1Fighters = docUser1.data().fighters;
            availableFighters = availableFighters.filter(fighter => !user1Fighters.includes(fighter));
        }
    }

    // Losujeme 8 unikátních bojovníků pro daného uživatele
    while (selectedFighters.length < 8) {
        const randomIndex = Math.floor(Math.random() * availableFighters.length);
        const fighter = availableFighters[randomIndex];

        if (!selectedFighters.includes(fighter)) {  // Kontrola, že tento zápasník ještě nebyl vylosován
            selectedFighters.push(fighter);
            availableFighters.splice(randomIndex, 1); // Odstraníme vylosovaného bojovníka
        }
    }

    // Ukládáme vylosované bojovníky do Firestore pro konkrétního uživatele
    await setDoc(doc(db, "game", userRole), { fighters: selectedFighters });
}

// Losování zápasů mezi user1 a user2
async function drawMatchups() {
    const docUser1 = await getDoc(doc(db, "game", "user1"));
    const docUser2 = await getDoc(doc(db, "game", "user2"));

    if (docUser1.exists() && docUser2.exists()) {
        const matchups = docUser1.data().fighters.map((fighter, index) => `${fighter} vs. ${docUser2.data().fighters[index]}`);
        await setDoc(doc(db, "game", "matchups"), { matches: matchups });
    }
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

// Přidání posluchačů na tlačítka
document.getElementById('drawFighterBtn').addEventListener('click', drawFighters);
document.getElementById('drawMatchupBtn').addEventListener('click', drawMatchups);

// Inicializace role pro uživatele
assignUserRole();

// Resetování dat při načtení stránky
window.addEventListener('beforeunload', () => {
    resetAllData();
});
