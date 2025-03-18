// App Templates
function createTicTacToeGame() {
    const html = `
        <div class="flex flex-col items-center">
            <div class="grid grid-cols-3 gap-4 mb-4" id="tictactoe">
                ${Array(9).fill('<div class="w-24 h-24 bg-white border-4 border-gray-300 rounded-lg flex items-center justify-center text-4xl font-bold cursor-pointer hover:bg-gray-50"></div>').join('')}
            </div>
            <div class="text-xl font-bold mb-4" id="status">Your turn (X)</div>
            <button class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600" id="resetGame">Reset Game</button>
        </div>
    `;

    const css = `
        #tictactoe > div {
            transition: all 0.3s ease;
        }
        #tictactoe > div:hover {
            transform: scale(1.05);
        }
    `;

    const js = `
        const cells = document.querySelectorAll('#tictactoe > div');
        const status = document.getElementById('status');
        const resetBtn = document.getElementById('resetGame');
        let currentPlayer = 'X';
        let gameBoard = Array(9).fill('');
        let gameActive = true;

        cells.forEach((cell, index) => {
            cell.addEventListener('click', () => handleCellClick(index));
        });

        resetBtn.addEventListener('click', resetGame);

        function handleCellClick(index) {
            if (!gameBoard[index] && gameActive) {
                gameBoard[index] = currentPlayer;
                cells[index].textContent = currentPlayer;
                cells[index].classList.add(currentPlayer === 'X' ? 'text-blue-500' : 'text-red-500');
                
                if (checkWinner()) {
                    status.textContent = \`\${currentPlayer} wins!\`;
                    gameActive = false;
                    return;
                }
                
                if (gameBoard.every(cell => cell)) {
                    status.textContent = "It's a draw!";
                    gameActive = false;
                    return;
                }
                
                currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
                status.textContent = \`\${currentPlayer}'s turn\`;
                
                if (currentPlayer === 'O') {
                    setTimeout(makeAIMove, 500);
                }
            }
        }

        function makeAIMove() {
            if (!gameActive) return;
            
            let availableMoves = gameBoard.map((cell, index) => cell === '' ? index : null).filter(cell => cell !== null);
            if (availableMoves.length > 0) {
                let randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
                handleCellClick(randomMove);
            }
        }

        function checkWinner() {
            const winPatterns = [
                [0,1,2], [3,4,5], [6,7,8], // Rows
                [0,3,6], [1,4,7], [2,5,8], // Columns
                [0,4,8], [2,4,6]           // Diagonals
            ];
            
            return winPatterns.some(pattern => {
                return pattern.every(index => {
                    return gameBoard[index] === currentPlayer;
                });
            });
        }

        function resetGame() {
            gameBoard = Array(9).fill('');
            gameActive = true;
            currentPlayer = 'X';
            status.textContent = "X's turn";
            cells.forEach(cell => {
                cell.textContent = '';
                cell.classList.remove('text-blue-500', 'text-red-500');
            });
        }
    `;

    return { html, css, js };
}

function createTodoApp() {
    const html = `
        <div class="max-w-md mx-auto">
            <div class="flex gap-2 mb-4">
                <input type="text" id="todoInput" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg" placeholder="Add a new task...">
                <button id="addTodo" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Add</button>
            </div>
            <div id="todoList" class="space-y-2"></div>
        </div>
    `;

    const css = `
        .todo-item {
            transition: all 0.3s ease;
        }
        .todo-item.completed {
            opacity: 0.5;
            text-decoration: line-through;
        }
    `;

    const js = `
        const todoInput = document.getElementById('todoInput');
        const addTodo = document.getElementById('addTodo');
        const todoList = document.getElementById('todoList');
        
        addTodo.addEventListener('click', addTodoItem);
        todoInput.addEventListener('keypress', e => {
            if (e.key === 'Enter') addTodoItem();
        });
        
        function addTodoItem() {
            const text = todoInput.value.trim();
            if (text) {
                const item = document.createElement('div');
                item.className = 'todo-item flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-lg';
                item.innerHTML = \`
                    <input type="checkbox" class="w-5 h-5">
                    <span class="flex-1">\${text}</span>
                    <button class="text-red-500 hover:text-red-600"><i class="fas fa-trash"></i></button>
                \`;
                
                const checkbox = item.querySelector('input');
                checkbox.addEventListener('change', () => {
                    item.classList.toggle('completed');
                });
                
                const deleteBtn = item.querySelector('button');
                deleteBtn.addEventListener('click', () => {
                    item.remove();
                });
                
                todoList.appendChild(item);
                todoInput.value = '';
            }
        }
    `;

    return { html, css, js };
}

function createPomodoroTimer() {
    const html = `
        <div class="max-w-md mx-auto text-center">
            <div class="text-6xl font-bold mb-4" id="timer">25:00</div>
            <div class="flex gap-2 justify-center mb-4">
                <button id="startTimer" class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">Start</button>
                <button id="resetTimer" class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Reset</button>
            </div>
            <div id="phase" class="text-xl font-medium">Work Time</div>
        </div>
    `;

    const css = `
        #timer {
            font-variant-numeric: tabular-nums;
        }
    `;

    const js = `
        let timeLeft = 25 * 60;
        let timerId = null;
        let isWorkPhase = true;
        
        const timerDisplay = document.getElementById('timer');
        const startBtn = document.getElementById('startTimer');
        const resetBtn = document.getElementById('resetTimer');
        const phaseDisplay = document.getElementById('phase');
        
        startBtn.addEventListener('click', toggleTimer);
        resetBtn.addEventListener('click', resetTimer);
        
        function toggleTimer() {
            if (timerId) {
                clearInterval(timerId);
                timerId = null;
                startBtn.textContent = 'Start';
                startBtn.classList.replace('bg-red-500', 'bg-green-500');
                startBtn.classList.replace('hover:bg-red-600', 'hover:bg-green-600');
            } else {
                timerId = setInterval(updateTimer, 1000);
                startBtn.textContent = 'Pause';
                startBtn.classList.replace('bg-green-500', 'bg-red-500');
                startBtn.classList.replace('hover:bg-green-600', 'hover:bg-red-600');
            }
        }
        
        function updateTimer() {
            timeLeft--;
            if (timeLeft < 0) {
                isWorkPhase = !isWorkPhase;
                timeLeft = (isWorkPhase ? 25 : 5) * 60;
                phaseDisplay.textContent = isWorkPhase ? 'Work Time' : 'Break Time';
            }
            
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerDisplay.textContent = \`\${minutes.toString().padStart(2, '0')}:\${seconds.toString().padStart(2, '0')}\`;
        }
        
        function resetTimer() {
            clearInterval(timerId);
            timerId = null;
            isWorkPhase = true;
            timeLeft = 25 * 60;
            startBtn.textContent = 'Start';
            startBtn.classList.replace('bg-red-500', 'bg-green-500');
            startBtn.classList.replace('hover:bg-red-600', 'hover:bg-green-600');
            phaseDisplay.textContent = 'Work Time';
            timerDisplay.textContent = '25:00';
        }
    `;

    return { html, css, js };
}

function createAnalyticsDashboard() {
    const html = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-white p-4 rounded-lg shadow">
                <h3 class="text-lg font-semibold mb-2">Daily Visitors</h3>
                <div class="h-40 bg-gray-50 rounded flex items-end p-2 space-x-2">
                    ${Array(7).fill('').map(() => 
                        `<div class="bg-blue-500 w-full" style="height: ${Math.random() * 100}%"></div>`
                    ).join('')}
                </div>
                <div class="flex justify-between mt-2 text-sm text-gray-600">
                    ${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => 
                        `<span>${day}</span>`
                    ).join('')}
                </div>
            </div>
            <div class="bg-white p-4 rounded-lg shadow">
                <h3 class="text-lg font-semibold mb-2">Statistics</h3>
                <div class="space-y-4">
                    <div class="flex justify-between items-center">
                        <span>Total Users</span>
                        <span class="font-semibold">1,234</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span>Active Users</span>
                        <span class="font-semibold">789</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span>Conversion Rate</span>
                        <span class="font-semibold">23%</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    const css = `
        .bg-blue-500 {
            transition: height 1s ease-in-out;
        }
    `;

    const js = `
        // Update chart bars randomly every 3 seconds
        setInterval(() => {
            document.querySelectorAll('.bg-blue-500').forEach(bar => {
                bar.style.height = \`\${Math.random() * 100}%\`;
            });
        }, 3000);
    `;

    return { html, css, js };
}

function createCommentSection() {
    const html = `
        <div class="max-w-2xl mx-auto">
            <div class="mb-4">
                <textarea id="commentInput" class="w-full px-4 py-2 border border-gray-300 rounded-lg" rows="3" placeholder="Write a comment..."></textarea>
                <button id="addComment" class="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Post Comment</button>
            </div>
            <div id="commentsList" class="space-y-4"></div>
        </div>
    `;

    const css = `
        .comment {
            transition: all 0.3s ease;
        }
        .comment:hover {
            transform: translateX(8px);
        }
    `;

    const js = `
        const commentInput = document.getElementById('commentInput');
        const addComment = document.getElementById('addComment');
        const commentsList = document.getElementById('commentsList');
        
        addComment.addEventListener('click', () => {
            const text = commentInput.value.trim();
            if (text) {
                const comment = document.createElement('div');
                comment.className = 'comment bg-white p-4 rounded-lg shadow';
                
                const now = new Date();
                comment.innerHTML = \`
                    <div class="flex items-center mb-2">
                        <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <i class="fas fa-user text-gray-500"></i>
                        </div>
                        <div class="ml-2">
                            <div class="font-semibold">Anonymous</div>
                            <div class="text-sm text-gray-500">\${now.toLocaleString()}</div>
                        </div>
                    </div>
                    <div class="text-gray-700">\${text}</div>
                    <div class="mt-2 flex gap-4">
                        <button class="text-gray-500 hover:text-blue-500"><i class="fas fa-thumbs-up"></i> Like</button>
                        <button class="text-gray-500 hover:text-blue-500"><i class="fas fa-reply"></i> Reply</button>
                    </div>
                \`;
                
                commentsList.insertBefore(comment, commentsList.firstChild);
                commentInput.value = '';
            }
        });
    `;

    return { html, css, js };
}

function createProductCard() {
    const html = `
        <div class="max-w-sm mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
            <div class="relative">
                <img src="https://picsum.photos/400/300" class="w-full h-48 object-cover" alt="Product">
                <div class="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm">Sale!</div>
            </div>
            <div class="p-4">
                <h3 class="text-xl font-semibold mb-2">Premium Product</h3>
                <p class="text-gray-600 mb-4">High-quality premium product with amazing features.</p>
                <div class="flex items-center mb-4">
                    <span class="text-2xl font-bold">$99.99</span>
                    <span class="ml-2 text-sm text-gray-500 line-through">$149.99</span>
                </div>
                <div class="flex items-center mb-4">
                    ${Array(5).fill('').map((_, i) => 
                        `<i class="fas fa-star ${i < 4 ? 'text-yellow-400' : 'text-gray-300'}"></i>`
                    ).join('')}
                    <span class="ml-2 text-sm text-gray-600">(4.0)</span>
                </div>
                <button id="addToCart" class="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">
                    Add to Cart
                </button>
            </div>
        </div>
    `;

    const css = `
        #addToCart {
            transition: all 0.3s ease;
        }
        #addToCart:active {
            transform: scale(0.95);
        }
    `;

    const js = `
        const addToCartBtn = document.getElementById('addToCart');
        let isInCart = false;
        
        addToCartBtn.addEventListener('click', () => {
            isInCart = !isInCart;
            addToCartBtn.innerHTML = isInCart ? 
                '<i class="fas fa-check mr-2"></i>Added to Cart' : 
                'Add to Cart';
            addToCartBtn.classList.toggle('bg-green-500');
            addToCartBtn.classList.toggle('bg-blue-500');
            
            // Animation
            addToCartBtn.classList.add('scale-110');
            setTimeout(() => addToCartBtn.classList.remove('scale-110'), 200);
        });
    `;

    return { html, css, js };
}

function createImageGallery() {
    const html = `
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            ${Array(6).fill('').map((_, i) => `
                <div class="relative group cursor-pointer">
                    <img src="https://picsum.photos/400/300?random=${i}" class="w-full h-48 object-cover rounded-lg" alt="Gallery Image ${i + 1}">
                    <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 rounded-lg flex items-center justify-center">
                        <i class="fas fa-search text-white opacity-0 group-hover:opacity-100 transform scale-0 group-hover:scale-100 transition-all duration-300"></i>
                    </div>
                </div>
            `).join('')}
        </div>
        <div id="lightbox" class="fixed inset-0 bg-black bg-opacity-90 hidden items-center justify-center z-50">
            <button id="closeLightbox" class="absolute top-4 right-4 text-white text-2xl"><i class="fas fa-times"></i></button>
            <button id="prevImage" class="absolute left-4 text-white text-2xl"><i class="fas fa-chevron-left"></i></button>
            <button id="nextImage" class="absolute right-4 text-white text-2xl"><i class="fas fa-chevron-right"></i></button>
            <img id="lightboxImage" class="max-h-[80vh] max-w-[80vw] object-contain" src="" alt="Lightbox Image">
        </div>
    `;

    const css = `
        #lightbox {
            transition: all 0.3s ease;
        }
        #lightboxImage {
            transition: all 0.3s ease;
        }
    `;

    const js = `
        const images = document.querySelectorAll('.group img');
        const lightbox = document.getElementById('lightbox');
        const lightboxImage = document.getElementById('lightboxImage');
        const closeLightbox = document.getElementById('closeLightbox');
        const prevImage = document.getElementById('prevImage');
        const nextImage = document.getElementById('nextImage');
        let currentImageIndex = 0;
        
        images.forEach((img, index) => {
            img.addEventListener('click', () => {
                currentImageIndex = index;
                updateLightboxImage();
                lightbox.classList.remove('hidden');
                lightbox.classList.add('flex');
            });
        });
        
        closeLightbox.addEventListener('click', () => {
            lightbox.classList.add('hidden');
            lightbox.classList.remove('flex');
        });
        
        prevImage.addEventListener('click', () => {
            currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
            updateLightboxImage();
        });
        
        nextImage.addEventListener('click', () => {
            currentImageIndex = (currentImageIndex + 1) % images.length;
            updateLightboxImage();
        });
        
        function updateLightboxImage() {
            lightboxImage.src = images[currentImageIndex].src;
            lightboxImage.classList.add('scale-95');
            setTimeout(() => lightboxImage.classList.remove('scale-95'), 50);
        }
        
        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('hidden')) {
                if (e.key === 'Escape') {
                    lightbox.classList.add('hidden');
                    lightbox.classList.remove('flex');
                } else if (e.key === 'ArrowLeft') {
                    currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
                    updateLightboxImage();
                } else if (e.key === 'ArrowRight') {
                    currentImageIndex = (currentImageIndex + 1) % images.length;
                    updateLightboxImage();
                }
            }
        });
    `;

    return { html, css, js };
}

function createCalculator() {
    const html = `
        <div class="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
            <div class="mb-4">
                <input type="text" id="display" class="w-full px-4 py-2 text-right text-2xl font-mono bg-gray-100 rounded" readonly>
            </div>
            <div class="grid grid-cols-4 gap-2">
                <button class="calc-btn col-span-2 bg-red-500 hover:bg-red-600 text-white">C</button>
                <button class="calc-btn bg-gray-300 hover:bg-gray-400">/</button>
                <button class="calc-btn bg-gray-300 hover:bg-gray-400">*</button>
                
                <button class="calc-btn bg-gray-200 hover:bg-gray-300">7</button>
                <button class="calc-btn bg-gray-200 hover:bg-gray-300">8</button>
                <button class="calc-btn bg-gray-200 hover:bg-gray-300">9</button>
                <button class="calc-btn bg-gray-300 hover:bg-gray-400">-</button>
                
                <button class="calc-btn bg-gray-200 hover:bg-gray-300">4</button>
                <button class="calc-btn bg-gray-200 hover:bg-gray-300">5</button>
                <button class="calc-btn bg-gray-200 hover:bg-gray-300">6</button>
                <button class="calc-btn bg-gray-300 hover:bg-gray-400">+</button>
                
                <button class="calc-btn bg-gray-200 hover:bg-gray-300">1</button>
                <button class="calc-btn bg-gray-200 hover:bg-gray-300">2</button>
                <button class="calc-btn bg-gray-200 hover:bg-gray-300">3</button>
                <button class="calc-btn bg-blue-500 hover:bg-blue-600 text-white row-span-2">=</button>
                
                <button class="calc-btn bg-gray-200 hover:bg-gray-300 col-span-2">0</button>
                <button class="calc-btn bg-gray-200 hover:bg-gray-300">.</button>
            </div>
        </div>
    `;

    const css = `
        .calc-btn {
            padding: 1rem;
            font-size: 1.25rem;
            border-radius: 0.5rem;
            transition: all 0.2s;
        }
        .calc-btn:active {
            transform: scale(0.95);
        }
    `;

    const js = `
        const display = document.getElementById('display');
        const buttons = document.querySelectorAll('.calc-btn');
        let currentValue = '';
        let operator = '';
        let previousValue = '';

        buttons.forEach(button => {
            button.addEventListener('click', () => {
                const value = button.textContent;
                
                if (value === 'C') {
                    currentValue = '';
                    operator = '';
                    previousValue = '';
                    display.value = '';
                }
                else if ('+-*/'.includes(value)) {
                    operator = value;
                    previousValue = currentValue;
                    currentValue = '';
                }
                else if (value === '=') {
                    if (previousValue && operator && currentValue) {
                        currentValue = String(eval(previousValue + operator + currentValue));
                        display.value = currentValue;
                        operator = '';
                        previousValue = '';
                    }
                }
                else {
                    currentValue += value;
                    display.value = currentValue;
                }
            });
        });
    `;

    return { html, css, js };
}

// Export all templates
window.appTemplates = {
    createTicTacToeGame,
    createTodoApp,
    createPomodoroTimer,
    createAnalyticsDashboard,
    createCommentSection,
    createProductCard,
    createImageGallery,
    createCalculator
};
