const socket = io();
let myRole = null;

const cs = ['r', 'y', 'g', 'b', 'p'];

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

socket.on('gameState', (view) => {
    // Indicateur de tour
    const turnEl = document.getElementById('turn');
    turnEl.textContent = view.turn;
    turnEl.classList.toggle('my-turn', view.turn === myRole);

    document.getElementById('deck-size').textContent = view.deckSize;

    // Ma main (uniquement si je suis joueur)
    if (myRole < 3) {
        const myHandEl = document.getElementById('player-hand');
        myHandEl.innerHTML = '';
        view.myHand.forEach((card, pos) => {
            const div = document.createElement('div');
            div.className = 'card';
            div.textContent = '.';
            div.onclick = () => socket.emit('playCard', pos);
            myHandEl.appendChild(div);
        });

        const otherHandEl = document.getElementById('other-hand');
        otherHandEl.innerHTML = '';
        view.otherHand.forEach((card) => {
            const div = document.createElement('div');
            div.className = 'card';
            div.textContent = card.x + card.c;
            otherHandEl.appendChild(div);
        });
    }

    // Défausse (visible par tous)
    const discardEl = document.getElementById('discard');
    discardEl.innerHTML = '';
    view.discard.forEach((card) => {
        const div = document.createElement('div');
        div.className = 'card';
        div.textContent = card;
        div.style.cursor = 'default';
        discardEl.appendChild(div);
    });

    // Cartes jouées (visible par tous)
    const fireworkEl = document.getElementById('firework');
    fireworkEl.innerHTML = '';
    cs.forEach(c => {
        const div = document.createElement('div');
        div.className = 'card';
        div.textContent = view.firework[c] + c;
        div.style.cursor = 'default';
        fireworkEl.appendChild(div);
    });

    // Vue spec
    if (myRole === 3) {
        document.getElementById('spec-p1').textContent = 6;
        document.getElementById('spec-p2').textContent = 6;
    }

    // Historique
    const logEl = document.getElementById('log');
    logEl.innerHTML = view.log.map(l => `<div>${l}</div>`).join('');
    logEl.scrollTop = logEl.scrollHeight;
});

document.getElementById('btn-new-game').onclick = () => {
    console.log("yoo")
    socket.emit('newGame');
};