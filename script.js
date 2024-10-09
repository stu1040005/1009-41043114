let cardValues = [];
let gridSize = "4x4";
let totalCards = 16;
let matchedCards = 0;
let hasFlippedCard = false;
let firstCard, secondCard;
let lockBoard = false;
let countdownTimer;
let timerInterval;
let seconds = 0;
let cardCategory = "animals";
let countdownTime = 3; // 默认倒计时为3秒

const successSound = document.getElementById('success-sound');
const failureSound = document.getElementById('failure-sound');
const hideMatchedCheckbox = document.getElementById('hide-matched');

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function generateCardValues(gridSize) {

    let numPairs = totalCards / 2;
    cardValues = [...Array(numPairs).keys(), ...Array(numPairs).keys()];
    shuffle(cardValues);
}

function createCards() {
    generateCardValues(gridSize);
    const cardContainer = document.getElementById('card-container');
    cardContainer.innerHTML = '';

    cardValues.forEach(value => {
        const card = document.createElement('div');
        card.classList.add('card');

        const cardFront = document.createElement('div');
        cardFront.classList.add('card-face', 'card-front');
        const imgFront = document.createElement('img');

        // 根据卡牌类别选择正面图像
        if (cardCategory === "animals") {
            imgFront.src = `images/19.png`; // 1.png 到 18.png
        } else if (cardCategory === "plants") {
            imgFront.src = `images/38.png`; // 20.png 到 37.png
        }
        cardFront.appendChild(imgFront);

        const cardBack = document.createElement('div');
        cardBack.classList.add('card-face', 'card-back');
        const imgBack = document.createElement('img');

        // 根据卡牌类别选择背面图像
        if (cardCategory === "animals") {
            imgBack.src = `images/${value + 1}.png`; // 动物类背面为 19.png
        } else if (cardCategory === "plants") {
            imgBack.src = `images/${value + 20}.png`; // 植物类背面为 38.png
        }

        cardBack.appendChild(imgBack);
        card.appendChild(cardFront);
        card.appendChild(cardBack);
        cardContainer.appendChild(card);

        card.addEventListener('click', flipCard);
    });

    // 初始化时卡牌全部翻开
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.classList.add('flipped');
    });
}

function startGame() {
    resetTimer();
    matchedCards = 0;
    hasFlippedCard = false;
    lockBoard = false;
    document.getElementById('restartButton').style.display = 'none';

    // 获取用户选择的倒计时
    countdownTime = parseInt(document.getElementById('countdownSelect').value);
    
    createCards();
    document.getElementById('startButton').disabled = true;

    // 首先将所有卡牌翻到正面
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.classList.add('flipped');
    });

    // 开始倒计时
    startCountdown(() => {
        flipAllToBack(); // 倒计时结束后翻转到背面
        startTimer(); // 开始计时
        document.getElementById('timer').style.display = 'block';
    });
}

function resetTimer() {
    clearInterval(timerInterval);
    seconds = 0;
    document.getElementById('timer').innerText = `用時: ${seconds} 秒`;
}

function startCountdown(callback) {
    let countdown = countdownTime; // 使用用户选择的倒计时
    const countdownElement = document.getElementById('countdown');
    countdownElement.innerText = `倒計時: ${countdown}`;
    countdownElement.style.display = 'block';

    countdownTimer = setInterval(() => {
        countdown--;
        countdownElement.innerText = `倒計時: ${countdown}`;

        if (countdown === 0) {
            clearInterval(countdownTimer);
            countdownElement.style.display = 'none';
            callback();
        }
    }, 1000);
}

function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        seconds++;
        document.getElementById('timer').innerText = `用時: ${seconds} 秒`;
    }, 1000);
}

function flipCard() {
    if (lockBoard || this === firstCard) return;

    this.classList.add('flipped');

    if (!hasFlippedCard) {
        hasFlippedCard = true;
        firstCard = this;
        return;
    }

    secondCard = this;
    checkForMatch();
}

function checkForMatch() {
    const isMatch = firstCard.querySelector('.card-back img').src === secondCard.querySelector('.card-back img').src;
    
    if (isMatch) {
        disableCards();
        successSound.play(); // 播放成功音效
    } else {
        unflipCards();
        failureSound.play(); // 播放失败音效
    }
}

function disableCards() {
    matchedCards += 2;
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    const hideMatched = document.getElementById('hideMatched').checked;
    if (hideMatched) {
        firstCard.style.visibility = 'hidden';  // 隐藏第一张卡牌
        secondCard.style.visibility = 'hidden'; // 隐藏第二张卡牌
    }
    resetBoard();

    if (matchedCards === totalCards) {
        clearInterval(timerInterval);
        document.getElementById('restartButton').style.display = 'block';
    }
}

function unflipCards() {
    lockBoard = true;
    setTimeout(() => {
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');
        resetBoard();
    }, 1500);
}

function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    firstCard = null;
    secondCard = null;
}

function restartGame() {
    resetTimer();
    startGame();
    document.getElementById('startButton').disabled = true;
}

function flipAllToBack() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.classList.remove('flipped');
    });
}

document.getElementById('categorySelect').addEventListener('change', function() {
    cardCategory = this.value;
    if (document.getElementById('startButton').disabled) {
        createCards();
    }
});

document.getElementById('gridSelect').addEventListener('change', function() {
    gridSize = this.value;
    switch (gridSize) {
        case "2x2":
            totalCards = 4;
            break;
        case "2x4":
            totalCards = 8;
            break;
        case "4x4":
            totalCards = 16;
            break;
        case "6x6":
            totalCards = 36; // 6x6 网格
            break;
    }
    if (document.getElementById('startButton').disabled) {
        createCards();
    }
});

document.getElementById('countdownSelect').addEventListener('change', function() {
    // 这里可以添加一些逻辑，以在选择不同的倒计时时更新游戏状态
});

document.getElementById('startButton').addEventListener('click', startGame);
document.getElementById('restartButton').addEventListener('click', restartGame);

document.getElementById('gridSelect').addEventListener('change', function() {
    const selectedText = this.value; 
    const grid=document.getElementById("card-container"); 
        if (selectedText=='2x2') {
            grid.style.gridTemplateColumns= `repeat(2, 1fr)`;
            grid.style.gridTemplateRows= `repeat(2, 1fr)`;
        }
        else if (selectedText=='2x4') {
            grid.style.gridTemplateColumns= `repeat(4, 1fr)`;
            grid.style.gridTemplateRows= `repeat(2, 1fr)`;
        }
        else if (selectedText=='4x4') {
            grid.style.gridTemplateColumns= `repeat(4, 1fr)`;
            grid.style.gridTemplateRows= `repeat(4, 1fr)`;
        }
        else if (selectedText=='6x6') {
            grid.style.gridTemplateColumns= `repeat(6, 1fr)`;
            grid.style.gridTemplateRows= `repeat(6, 1fr)`;
        }

});