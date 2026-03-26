import './style.css'; // Adjust the path if your css file is somewhere else
import { connect, sendMessage, onMessage } from './net/socket';

// ... rest of your code ...

// --- DOM Elements ---
const screens = {
  home: document.getElementById('home-screen') as HTMLDivElement,
  waiting: document.getElementById('waiting-screen') as HTMLDivElement,
  join: document.getElementById('join-screen') as HTMLDivElement,
  game: document.getElementById('game-screen') as HTMLDivElement,
};

const btns = {
  create: document.getElementById('btn-create') as HTMLButtonElement,
  showJoin: document.getElementById('btn-show-join') as HTMLButtonElement,
  submitJoin: document.getElementById('btn-submit-join') as HTMLButtonElement,
  back: document.getElementById('btn-back') as HTMLButtonElement,
};

const inputs = {
  code: document.getElementById('room-code-input') as HTMLInputElement,
};

const displays = {
  code: document.getElementById('room-code-display') as HTMLHeadingElement,
};

// --- Screen Management ---
function showScreen(screenKey: keyof typeof screens) {
  Object.values(screens).forEach(screen => screen.classList.add('hidden'));
  screens[screenKey].classList.remove('hidden');
}

// --- Event Listeners ---
btns.create.addEventListener('click', () => {
  console.log('[UI] Create Game button clicked!');
  sendMessage({ type: 'create-lobby' });
});

btns.showJoin.addEventListener('click', () => {
  showScreen('join');
});

btns.back.addEventListener('click', () => {
  showScreen('home');
});

btns.submitJoin.addEventListener('click', () => {
  const code = inputs.code.value.trim().toUpperCase();
  if (code.length === 5) {
    sendMessage({ type: 'join-lobby', code: code });
  } else {
    alert("Please enter a valid 5-character code.");
  }
});

// --- Network Message Handling ---
onMessage((msg) => {
  switch (msg.type) {
    case 'lobby-created':
      // Server responds to Host with the new code
      displays.code.innerText = msg.code;
      showScreen('waiting');
      break;
      
    case 'guest-joined': // <--- Handled by the HOST
    case 'joined-lobby': // <--- Handled by the GUEST
      // Both cases will trigger the code below!
      showScreen('game');
      console.log("Game is starting! Initialize canvas here.");
      break;

    case 'opponent-disconnected':
      alert("Your opponent has disconnected!");
      // Send them back to the main menu
      showScreen('home'); 
      break;

    case 'error':
      alert(`Error: ${msg.message}`);
      break;
  }
});

// Initialize connection on load
connect();