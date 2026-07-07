const socket = io();
let myRole = null;

const cs = ['r', 'y', 'g', 'b', 'p'];

const els = {    
    role: document.getElementById('role'),
    turn: document.getElementById('turn'),
    deckSize: document.getElementById('deck-size'),
    playerHand: document.getElementById('player-hand'),
    otherHand: document.getElementById('other-hand'),
    discard: document.getElementById('discard'),
    firework: document.getElementById('firework'),
    log: document.getElementById('log'),
    btnNewGame: document.getElementById('btn-new-game')
}

socket.on('role', (role) => {
    myRole = role;
    els.role.textContent = role;
});

socket.on('gameState', (view) => {
    // Indicateur de tour
    const turnEl = els.turn;
    turnEl.textContent = view.turn;
    turnEl.classList.toggle('my-turn', view.turn === myRole);

    els.deckSize.textContent = view.deckSize;

    // Ma main (uniquement si je suis joueur)
    if (myRole < 3) {
        const myHandEl = els.playerHand;
        myHandEl.innerHTML = '';
        view.myHand.forEach((card, pos) => {
            const div = document.createElement('div');
            div.className = 'card';
            div.textContent = '.';
            div.onclick = () => socket.emit('playCard', pos);
            myHandEl.appendChild(div);
        });

        const otherHandEl = els.otherHand;
        otherHandEl.innerHTML = '';
        view.otherHand.forEach((card) => {
            const div = document.createElement('div');
            div.className = 'card';
            div.textContent = card.x + card.c;
            otherHandEl.appendChild(div);
        });
    }

    // Défausse (visible par tous)
    const discardEl = els.discard;
    discardEl.innerHTML = '';
    view.discard.forEach((card) => {
        const div = document.createElement('div');
        div.className = 'card';
        div.textContent = card.x + card.c;
        div.style.cursor = 'default';
        discardEl.appendChild(div);
    });

    // Cartes jouées (visible par tous)
    const fireworkEl = els.firework;
    fireworkEl.innerHTML = '';
    cs.forEach(c => {
        const div = document.createElement('div');
        div.className = 'card';
        div.textContent = view.firework[c] + c;
        div.style.cursor = 'default';
        fireworkEl.appendChild(div);
    });

    // Historique
    const logEl = els.log;
    logEl.innerHTML = view.log.map(l => `<div>${l}</div>`).join('');
    logEl.scrollTop = logEl.scrollHeight;
});

els.btnNewGame.onclick = () => {
    console.log("yoo")
    socket.emit('newGame');
};

/* DEBUG afac */
window.debugGame = () => fetch('/debug').then(r => r.json()).then(g => { window.game = g; console.log(g); return g; });
