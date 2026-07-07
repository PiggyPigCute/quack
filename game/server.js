const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(express.static('public'));

const cs = ['r', 'y', 'g', 'b', 'p'];
const xs = ['1', '2', '3', '4', '5'];
const occurences = {'1':3, '2':2, '3':2, '4':2, '5':1};
const next = {'Ø':'1', '1':'2', '2':'3', '3':'4', '4':'5'};
const handSize = 6;

function createDeck() {
  const deck = [];

  cs.forEach(c =>
    xs.forEach(x => {
      for (let i=1; i<=occurences[x]; i++) {
        deck.push({x:x,c:c})
      }
    })
  )

  // mélange
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function newGame() {
  console.log("yo")
  const deck = createDeck();
  return {
    deck,
    hands: {
      1: deck.splice(0, handSize),
      2: deck.splice(0, handSize),
    },
    discard: [],
    firework : Object.fromEntries(cs.map(c => [c,'1'])),
    turn: 1,
    log: ['start'],
  };
}

let game = newGame();

// Association socket.id -> rôle ('player1' | 'player2' | 'spectateur')
const roles = new Map();
let player1Taken = false;
let player2Taken = false;

// ============================================================
// Construit une vue de l'état FILTRÉE selon le rôle du
// destinataire : un joueur ne voit jamais la main de l'autre.
// ============================================================
function viewFor(role) {
  return {
    myHand: game.hands[role] || null,
    otherHand: game.hands[3-role] || null,
    discard: game.discard,
    firework: game.firework,
    turn: game.turn,
    deckSize: game.deck.length,
    log: game.log,
    myRole: role,
  };
}

// Envoie à CHAQUE client sa propre vue filtrée (pas un broadcast unique)
function spreadState() {
  for (const [socketId, role] of roles.entries()) {
    io.to(socketId).emit('gameState', viewFor(role));
  }
}

io.on('connection', (socket) => {
  // --- Attribution du rôle à la connexion ---
  let role;
  if (!player1Taken) {
    role = 1;
    player1Taken = true;
  } else if (!player2Taken) {
    role = 2;
    player2Taken = true;
  } else {
    role = 3;
  }
  roles.set(socket.id, role);
  socket.emit('role', role);
  if (role == 1) {
    console.log(`Connexion Joueur·euse 1 ${socket.id}`);
  } else if (role == 2) {
    console.log(`Connexion Joueur·euse 2 ${socket.id}`);
  } else {
    console.log(`Connexion Spectateur·ice ${socket.id}`);
  } 

  // Envoie l'état initial (filtré) juste à ce client
  socket.emit('gameState', viewFor(role));

  // --- Action : jouer une card de sa main ---
  socket.on('playCard', (pos) => {
    if (role !== game.turn) return;

    const [playedCard] = hand.splice(pos, 1);
    if (next[game.firework[playedCard.c]] == playedCard.x) {
      game.firework[playedCard.c] = playedCard.x
      game.log.push(`Joueur·euse ${role} joue ${playedCard.x}${playedCard.c}.`);
    } else {
      game.discard.push(playedCard)
      game.log.push(`Joueur·euse ${role} défausse ${playedCard.x}${playedCard.c}.`);
    }

    if (game.deck.length != 0) {
      const newCard = game.deck.pop();
      game.hands[role].push(card);
    }

    game.turn = 3 - game.turn;
    spreadState();
  });

  // --- Redémarrer la partie (pratique pour tester) ---
  socket.on('newGame', () => {
    console.log("coucou")
    game = newGame();
    spreadState();
  });

  socket.on('disconnect', () => {
    const r = roles.get(socket.id);
    if (r === 1) player1Taken = false;
    if (r === 2) player2Taken = false;
    roles.delete(socket.id);
    console.log(`Déconnexion ${socket.id} (rôle ${r})`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
