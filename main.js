(function(){
  // DOM refs
  const gridEl = document.getElementById('grid');
  const sizeSelect = document.getElementById('sizeSelect');
  const speedSelect = document.getElementById('speedSelect');
  const skinSelect = document.getElementById('skinSelect');
  const modeSelect = document.getElementById('modeSelect');
  const startBtn = document.getElementById('startBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const restartBtn = document.getElementById('restartBtn');

  const scoreBoard = document.getElementById('scoreBoard');
  const bestBoard = document.getElementById('bestBoard');
  const lengthBoard = document.getElementById('lengthBoard');
  const levelBoard = document.getElementById('levelBoard');
  const speedBoard = document.getElementById('speedBoard');
  const timeBoard = document.getElementById('timeBoard');

  const overlay = document.getElementById('overlay');
  const overlayScore = document.getElementById('overlayScore');
  const overlayBest = document.getElementById('overlayBest');
  const overlayRestart = document.getElementById('overlayRestart');
  const overlayClose = document.getElementById('overlayClose');

  let state = {
    size: Number(sizeSelect.value) || 20,
    speedMs: Number(speedSelect.value) || 100,
    mode: modeSelect.value || 'walls',
    skin: skinSelect.value || 'classic',
    snake: [],
    dir: {x:1,y:0},
    nextDir:{x:1,y:0},
    apple: null,
    obstacles: [],
    score: 0,
    best: Number(localStorage.getItem('snake_best') || 0),
    length: 1,
    level: 1,
    running: false,
    seconds: 0,
    timer: null
  };

  function idx(x,y){ return y*state.size + x; }
  function inside(x,y){ return x>=0 && x<state.size && y>=0 && y<state.size; }

  function generateGrid(n){
    state.size = n;
    gridEl.innerHTML = '';
    gridEl.style.gridTemplateColumns = `repeat(${n}, 1fr)`;
    gridEl.style.gridTemplateRows = `repeat(${n}, 1fr)`;
    for(let i=0;i<n*n;i++){
      const cell = document.createElement('div');
      cell.className = 'cell';
      gridEl.appendChild(cell);
    }
    placeDecorativeSnake(n);
  }

  function placeDecorativeSnake(n){
    const cells = gridEl.children;
    Array.from(cells).forEach(c=>{ c.classList.remove('snake-head','snake-body','apple'); c.textContent=''; });
    const mid = Math.floor(n/2);
    const headIdx = mid * n + mid;
    if(cells[headIdx]) cells[headIdx].classList.add('snake-head');
    const b1 = mid * n + (mid-1);
    const b2 = mid * n + (mid-2);
    if(cells[b1]) cells[b1].classList.add('snake-body');
    if(cells[b2]) cells[b2].classList.add('snake-body');
    const appleIdx = (mid * n + (mid+3)) % (n*n);
    if(cells[appleIdx]) cells[appleIdx].classList.add('apple');
    state.length = 3; state.score = 0; refreshHUD();
  }

  function refreshHUD(){
    scoreBoard.textContent = state.score;
    bestBoard.textContent = state.best;
    lengthBoard.textContent = state.length;
    levelBoard.textContent = state.level;
    speedBoard.textContent = state.speedMs + 'ms';
    const mm = String(Math.floor(state.seconds/60)).padStart(2,'0');
    const ss = String(state.seconds%60).padStart(2,'0');
    timeBoard.textContent = `${mm}:${ss}`;
  }

  function initPlayable(){
    state.snake = [];
    const mid = Math.floor(state.size/2);
    state.snake = [{x:mid,y:mid},{x:mid-1,y:mid},{x:mid-2,y:mid}];
    state.dir = {x:1,y:0}; state.nextDir = {x:1,y:0};
    state.score = 0; state.level = 1; state.seconds = 0; state.length = state.snake.length;
    generateObstacles(1); placeApple();
    drawBoard();
  }

  function generateObstacles(level){
    const obs = [];
    const max = Math.floor(state.size*state.size*0.1);
    const count = Math.min(Math.floor(level*1.5), max);
    for(let i=0;i<count;i++){
      let tries=0;
      while(tries<300){
        const x = Math.floor(Math.random()*state.size);
        const y = Math.floor(Math.random()*state.size);
        const conflict = state.snake.some(s=>s.x===x && s.y===y) || obs.some(o=>o.x===x && o.y===y);
        if(!conflict){ obs.push({x,y}); break; }
        tries++;
      }
    }
    state.obstacles = obs;
  }

  function placeApple(){
    const empties=[];
    for(let x=0;x<state.size;x++) for(let y=0;y<state.size;y++){
      if(state.snake.some(s=>s.x===x && s.y===y)) continue;
      if(state.obstacles.some(o=>o.x===x && o.y===y)) continue;
      empties.push({x,y});
    }
    state.apple = empties.length ? empties[Math.floor(Math.random()*empties.length)] : null;
  }

  function drawBoard(){
    const cells = gridEl.children;
    for(let i=0;i<cells.length;i++){ cells[i].className='cell'; cells[i].textContent=''; }
    state.obstacles.forEach(o=>{
      const i = idx(o.x,o.y);
      if(cells[i]) cells[i].classList.add('obstacle');
    });
    if(state.apple){
      const i = idx(state.apple.x,state.apple.y);
      if(cells[i]) cells[i].classList.add('apple');
    }
    state.snake.forEach((s, ind)=>{
      const i = idx(s.x,s.y);
      if(cells[i]) cells[i].classList.add(ind===0 ? 'snake-head' : 'snake-body');
    });
    refreshHUD();
  }

  function gameTick(){
    state.dir = state.nextDir;
    const head = {x: state.snake[0].x + state.dir.x, y: state.snake[0].y + state.dir.y};
    if(state.mode === 'wrap'){
      if(head.x < 0) head.x = state.size-1;
      if(head.x >= state.size) head.x = 0;
      if(head.y < 0) head.y = state.size-1;
      if(head.y >= state.size) head.y = 0;
    }
    if(state.mode === 'walls' && !inside(head.x, head.y)) return endGame();
    if(state.snake.some(s=>s.x===head.x && s.y===head.y)) return endGame();
    if(state.obstacles.some(o=>o.x===head.x && o.y===head.y)) return endGame();
    state.snake.unshift(head);
    if(state.apple && head.x===state.apple.x && head.y===state.apple.y){
      state.score += 10;
      state.speedMs = Math.max(40, Math.round(state.speedMs * 0.97));
      const newLevel = Math.floor(state.score / 50) + 1;
      if(newLevel > state.level){ state.level = newLevel; generateObstacles(state.level); }
      placeApple();
    } else {
      state.snake.pop();
    }
    state.length = state.snake.length;
    if(state.score > state.best){ state.best = state.score; localStorage.setItem('snake_best', state.best); }
    drawBoard();
  }

  function endGame(){
    state.running = false;
    overlay.classList.add('show');
    overlayScore.textContent = state.score;
    overlayBest.textContent = state.best;
    pause();
  }

  function start(){
    if(state.running) return;
    state.running = true;
    initPlayable();
    state.timer = setInterval(()=>{
      gameTick();
      state.seconds++;
      refreshHUD();
    }, state.speedMs);
    startBtn.disabled = true; pauseBtn.disabled = false;
  }
  function pause(){
    state.running = false;
    if(state.timer){ clearInterval(state.timer); state.timer = null; }
    startBtn.disabled = false; pauseBtn.disabled = true;
  }
  function restart(){
    pause();
    initPlayable();
    overlay.classList.remove('show');
  }

  window.addEventListener('keydown', e=>{
    const k = e.key.toLowerCase();
    if(['arrowup','w'].includes(k)) setDir(0,-1);
    if(['arrowdown','s'].includes(k)) setDir(0,1);
    if(['arrowleft','a'].includes(k)) setDir(-1,0);
    if(['arrowright','d'].includes(k)) setDir(1,0);
    if(k===' ') { if(state.running) pause(); else start(); }
    if(k==='r'){ restart(); }
  });

  function setDir(x,y){
    if(state.dir.x === -x && state.dir.y === -y) return;
    state.nextDir = {x,y};
  }

  let touchStart = null;
  gridEl.addEventListener('touchstart', e=>{ const t = e.touches[0]; touchStart = {x:t.clientX, y:t.clientY}; }, {passive:true});
  gridEl.addEventListener('touchend', e=>{
    if(!touchStart) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.x; const dy = t.clientY - touchStart.y;
    if(Math.abs(dx) > Math.abs(dy)){
      if(dx>20) setDir(1,0); else if(dx<-20) setDir(-1,0);
    } else {
      if(dy>20) setDir(0,1); else if(dy<-20) setDir(0,-1);
    }
    touchStart = null;
  }, {passive:true});

  if(startBtn) startBtn.addEventListener('click', ()=> start());
  if(pauseBtn) pauseBtn.addEventListener('click', ()=> { if(state.running) pause(); else start(); });
  if(restartBtn) restartBtn.addEventListener('click', ()=> restart());
  if(overlayRestart) overlayRestart.addEventListener('click', ()=> restart());
  if(overlayClose) overlayClose.addEventListener('click', ()=> overlay.classList.remove('show'));

  sizeSelect.addEventListener('change', e=>{ generateGrid(Number(e.target.value)); });
  speedSelect.addEventListener('change', e=>{ state.speedMs = Number(e.target.value); refreshHUD(); });
  skinSelect.addEventListener('change', e=>{ state.skin = e.target.value; refreshHUD(); });
  modeSelect.addEventListener('change', e=>{ state.mode = e.target.value; });

  generateGrid(state.size);
  refreshHUD();

  window.SNAKE = { state, generateGrid, initPlayable, start, pause, restart };
})();