const socket = io();
let myRole = null;

socket.on('role', (role) => {
    myRole = role;
    document.getElementById('role').textContent = role;

    if (role === 'spec') {
        document.getElementById('game-area').style.display = 'none';
        document.getElementById('spec-area').style.display = 'block';
    } else {
        document.getElementById('game-area').style.display = 'block';
        document.getElementById('spec-area').style.display = 'none';
    }
});

socket.on('gameState', (etat) => {
    // Indicateur de tour
    const turnEl = document.getElementById('turn');
    turnEl.textContent = etat.turn;
    turnEl.classList.toggle('my-turn', etat.turn === myRole);

    document.getElementById('deck-size').textContent = etat.deckSize;

    // Ma main (uniquement si je suis joueur)
    if (etat.myHand) {
        const handEl = document.getElementById('player-hand');
        handEl.innerHTML = '';
        etat.myHand.forEach((card) => {
            const div = document.createElement('div');
            div.className = 'card';
            div.textContent = card.x + card.c;
            div.onclick = () => socket.emit('playCard', card);
            handEl.appendChild(div);
        });
    }

    // Défausse (visible par tous)
    const discardEl = document.getElementById('discard');
    discardEl.innerHTML = '';
    etat.discard.forEach((card) => {
        const div = document.createElement('div');
        div.className = 'card';
        div.textContent = card;
        div.style.cursor = 'default';
        discardEl.appendChild(div);
    });

    // Vue spec
    if (myRole === 3) {
        document.getElementById('spec-p1').textContent = 6;
        document.getElementById('spec-p2').textContent = 6;
    }

    // Historique
    const logEl = document.getElementById('log');
    logEl.innerHTML = etat.log.map(l => `<div>${l}</div>`).join('');
    logEl.scrollTop = logEl.scrollHeight;
});

document.getElementById('btn-draw').onclick = () => {
    socket.emit('drawCard');
};

document.getElementById('btn-new-game').onclick = () => {
    console.log("yoo")
    socket.emit('newGame');
};