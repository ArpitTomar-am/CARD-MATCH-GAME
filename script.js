// Emoji set for cards 
const EMOJIS = [ 
"🦊"," 🐼","🐸","🦁 "," 🐵 "," 🐯 "," 🐺 "," 🐨 ", " 🦄 "," 🐙 "," 🐝 "," 🐞 "," 🐢 "," 🦋 "," 🐳 "," 🐬 ", " 🌵 "," 🍉 "," 🍓 ","🍩 ","⚽","🏀","🎸","🎧", "🚀","🏝 "," 🧩 "," 🎲","🎯","🛸" ];
const boardEl = document.getElementById('board'); 
const movesEl = document.getElementById('moves'); 
const pairsFoundEl = document.getElementById('pairsFound'); 
const totalPairsEl = document.getElementById('totalPairs'); 
const timerEl = document.getElementById('timer'); 
const restartBtn = document.getElementById('restartBtn'); 
const sizeSelector = document.getElementById('sizeSelector'); 
const overlay = document.getElementById('overlay'); 
const dialogText = document.getElementById('dialogText'); 
const playAgain = document.getElementById('playAgain'); 
const closeDialog = document.getElementById('closeDialog'); 
const hintBtn = document.getElementById('hintBtn'); 
let totalPairs = 8; 
let cards = []; 
let firstCard = null; 
let secondCard = null; 
let lockBoard = false; 
let moves = 0; 
let pairsFound = 0; 
let timerInterval = null; 
let secondsElapsed = 0; 
// Initialize 
function init(){ 
totalPairs = parseInt(sizeSelector.value, 10); 
totalPairsEl.textContent = totalPairs; 
resetState(); 
buildDeck(totalPairs); 
renderBoard(); 
startTimer(); 
} 
function resetState(){ 
cards = []; 
firstCard = null; 
  secondCard = null; 
  lockBoard = false; 
  moves = 0; 
  pairsFound = 0; 
  secondsElapsed = 0; 
  clearInterval(timerInterval); 
  movesEl.textContent = moves; 
  pairsFoundEl.textContent = pairsFound; 
  timerEl.textContent = "00:00"; 
  boardEl.classList.remove('disabled'); 
  overlay.classList.remove('show'); 
} 
 
function buildDeck(nPairs){ 
  const chosen = EMOJIS.slice(0, nPairs); 
  let deck = []; 
  chosen.forEach((emoji, idx) => { 
    deck.push({ id: `${idx}-A`, value: emoji, matched:false }); 
    deck.push({ id: `${idx}-B`, value: emoji, matched:false }); 
  }); 
  cards = shuffle(deck); 
} 
 
function shuffle(array){ 
  const a = array.slice(); 
  for(let i = a.length - 1; i > 0; i--){ 
    const j = Math.floor(Math.random() * (i + 1)); 
    [a[i], a[j]] = [a[j], a[i]]; 
  } 
  return a; 
} 
 
function renderBoard(){ 
  boardEl.innerHTML = ''; 
  cards.forEach(card => { 
    const cardEl = document.createElement('button'); 
    cardEl.className = 'card'; 
    cardEl.setAttribute('data-id', card.id); 
    cardEl.innerHTML = ` 
      <div class="card-inner"> 
        <div class="card-face card-front">?</div> 
        <div class="card-face card-back">${card.value}</div> 
      </div> 
    `; 
    cardEl.addEventListener('click', onCardClick); 
    boardEl.appendChild(cardEl); 
  }); 
} 
 
function onCardClick(e){ 
  if(lockBoard) return; 
  const btn = e.currentTarget; 
  const id = btn.dataset.id; 
  const cardObj = cards.find(c => c.id === id); 
  if(!cardObj || cardObj.matched) return; 
  if(firstCard && firstCard.id === cardObj.id) return; 
 
  flip(btn); 
 
  if(!firstCard){ 
    firstCard = { id: cardObj.id, value: cardObj.value, el: btn }; 
    return; 
  } 
 
  secondCard = { id: cardObj.id, value: cardObj.value, el: btn }; 
  moves++; 
  movesEl.textContent = moves; 
 
  if(firstCard.value === secondCard.value){ 
    markMatched(firstCard.el); 
    markMatched(secondCard.el); 
    pairsFound++; 
    pairsFoundEl.textContent = pairsFound; 
    cards.forEach(c => { if(c.value === firstCard.value) c.matched = true; }); 
    resetTurn(); 
    if(pairsFound === totalPairs){ endGame(); } 
  } else { 
    lockBoard = true; 
    setTimeout(() => { 
      unflip(firstCard.el); 
      unflip(secondCard.el); 
      resetTurn(); 
    }, 900); 
  } 
} 
 
function flip(btn){ btn.classList.add('is-flipped'); } 
function unflip(btn){ btn.classList.remove('is-flipped'); } 
function markMatched(btn){ btn.classList.add('disabled'); } 
function resetTurn(){ [firstCard, secondCard] = [null, null]; lockBoard = false; } 
 
function startTimer(){ 
  clearInterval(timerInterval); 
  secondsElapsed = 0; 
  timerEl.textContent = formatTime(secondsElapsed); 
  timerInterval = setInterval(() => { 
    secondsElapsed++; 
    timerEl.textContent = formatTime(secondsElapsed); 
  }, 1000); 
} 
function stopTimer(){ clearInterval(timerInterval); } 
function formatTime(sec){ 
  const m = Math.floor(sec / 60).toString().padStart(2,'0'); 
  const s = (sec % 60).toString().padStart(2,'0'); 
  return `${m}:${s}`; 
} 
 
function endGame(){ 
  stopTimer(); 
  boardEl.classList.add('disabled'); 
  dialogText.innerHTML = `You finished in <strong>${formatTime(secondsElapsed)}</strong> 
with <strong>${moves}</strong> moves.`; 
  overlay.classList.add('show'); 
} 
 
// Event listeners 
restartBtn.addEventListener('click', init); 
sizeSelector.addEventListener('change', init); 
playAgain.addEventListener('click', () => { overlay.classList.remove('show'); init(); }); 
closeDialog.addEventListener('click', () => { overlay.classList.remove('show'); }); 
hintBtn.addEventListener('click', () => { 
  const unMatchedBtns = Array.from(boardEl.querySelectorAll('.card:not(.disabled)')); 
  if(unMatchedBtns.length === 0) return; 
  lockBoard = true; 
  const revealCount = Math.min(4, unMatchedBtns.length); 
  for(let i=0;i<revealCount;i++){ flip(unMatchedBtns[i]); } 
  setTimeout(() => { 
    for(let i=0;i<revealCount;i++){ 
      if(!unMatchedBtns[i].classList.contains('disabled')) unflip(unMatchedBtns[i]); 
    } 
    lockBoard = false; 
  }, 1400); 
}); 
// Start game 
init(); 