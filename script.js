// Inicializace Firebase
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
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore(app);

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

// Funkce na losování bojovníků pro každého uživatele
async function drawFighters() {
    let selectedFighters = [];
    let availableFighters = [...allFighters]; // Kopie původního seznamu bojovníků

    // Losujeme 8 bojovníků
    for (let i = 0; i < 8; i++) {
        const randomIndex = Math.floor(Math.random() * availableFighters.length);
        selectedFighters.push(availableFighters[randomIndex]);
        availableFighters.splice(randomIndex, 1); // Odstraníme vylosovaného bojovníka
    }

    // Ukládáme vylosované bojovníky do Firestore pro konkrétního uživatele
    const docRef = db.collection("game").doc(userRole); // Opraveno na "game/user1" nebo "game/user2"
    await docRef.set({ fighters: selectedFighters });
}

// Losování zápasů mezi user1 a user2
async function drawMatchups() {
    const docUser1 = await db.collection("game").doc("user1").get();
    const docUser2 = await db.collection("game").doc("user2").get();

    if (docUser1.exists && docUser2.exists) {
        const matchups = docUser1.data().fighters.map((fighter, index) => `${fighter} vs. ${docUser2.data().fighters[index]}`);
        await db.collection("game").doc("matchups").set({ matches: matchups });
    }
}

// Posluchače na aktualizaci dat v reálném čase
firebase.firestore().doc('game/user1').onSnapshot((doc) => {
    if (doc.exists) {
        document.getElementById('fighters1').innerText = doc.data().fighters.join(', ');
    }
});

firebase.firestore().doc('game/user2').onSnapshot((doc) => {
    if (doc.exists) {
        document.getElementById('fighters2').innerText = doc.data().fighters.join(', ');
    }
});

firebase.firestore().doc('game/matchups').onSnapshot((doc) => {
    if (doc.exists) {
        document.getElementById('matchup').innerText = doc.data().matches.join('\n');
    }
});

// Ujistíme se, že DOM je načtený, než přidáme event listener
document.addEventListener("DOMContentLoaded", () => {
    // Přidání posluchačů na tlačítka až po načtení stránky
    const drawFighterBtn2 = document.getElementById('drawFighterBtn2');
    if (drawFighterBtn2) {
        drawFighterBtn2.addEventListener('click', async () => {
            userRole = "user2";  // Pro uživatele 2
            await drawFighters();
        });
    }

    const drawFighterBtn = document.getElementById('drawFighterBtn');
    if (drawFighterBtn) {
        drawFighterBtn.addEventListener('click', async () => {
            userRole = "user1";  // Pro uživatele 1
            await drawFighters();
        });
    }

    const drawMatchupBtn = document.getElementById('drawMatchupBtn');
    if (drawMatchupBtn) {
        drawMatchupBtn.addEventListener('click', drawMatchups);
    }
});
