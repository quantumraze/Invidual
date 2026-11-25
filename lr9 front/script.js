let playerName = prompt("Введіть ваше ім'я:");

if (playerName === null || playerName.trim() === "") {
    playerName = "Гравець";
}
playerName = playerName.trim();
document.getElementById("playerName").textContent = playerName;

let userScore = 0;
let computerScore = 0;
let round = 1;
let gameOver = false;
let generate = document.getElementById("generate");
let restart = document.getElementById("restart");
let userCards = document.getElementById("userCards");
let computerCards = document.getElementById("computerCards");
let userScoreText = document.getElementById("userScore");
let computerScoreText = document.getElementById("computerScore");
let userChance = document.getElementById("userChance");
let computerChance = document.getElementById("computerChance");
let roundText = document.getElementById("round");
let result = document.getElementById("result");

let cards = [
    { name: "6", value: 6, image: "6.jpg" },
    { name: "7", value: 7, image: "7.jpg" },
    { name: "8", value: 8, image: "8.jpg" },
    { name: "9", value: 9, image: "9.jpg" },
    { name: "10", value: 10, image: "10.jpg" },
    { name: "Валет", value: 2, image: "balet.jpg" },
    { name: "Дама", value: 3, image: "dama.jpg" },
    { name: "Король", value: 4, image: "korol.jpg" },
    { name: "Туз", value: 11, image: "tyz.jpg" }
];

function randomCard() {
    let index = Math.floor(Math.random() * cards.length);
    return cards[index];
}

function showCard(container, card) {
    let cardElement = document.createElement("div");
    cardElement.classList.add("playing-card");
    let image = document.createElement("img");
    image.src = card.image;
    image.alt = card.name;
    let valueText = document.createElement("div");
    valueText.classList.add("card-value");
    valueText.textContent = card.name + " (" + card.value + ")";
    cardElement.appendChild(image);
    cardElement.appendChild(valueText);
    container.appendChild(cardElement);
}

function calculateChance(score) {
    let dangerousCards = 0;
    for (let i = 0; i < cards.length; i++) {
        if (score + cards[i].value > 21) {
            dangerousCards++;
        }
    }

    let chance = dangerousCards / cards.length * 100;
    return chance.toFixed(1);
}

function updateChances() {
    userChance.textContent = calculateChance(userScore) + "%";
    computerChance.textContent = calculateChance(computerScore) + "%";
}

function play() {
    if (gameOver) {
        return;
    }

    let user = randomCard();
    let computer = randomCard();
    userScore += user.value;
    computerScore += computer.value;
    showCard(userCards, user);
    showCard(computerCards, computer);
    userScoreText.textContent = userScore;
    computerScoreText.textContent = computerScore;
    updateChances();

    if (userScore > 21 && computerScore > 21) {
        result.textContent = "Обидва гравці перебрали 21! Нічия!";
        finishGame();
        return;

    } else if (userScore > 21) {
        result.textContent = "Перебір! " + playerName + " програв! Переміг комп'ютер!";
        finishGame();
        return;

    } else if (computerScore > 21) {
        result.textContent = "Комп'ютер перебрав 21! Переміг " + playerName + "!";
        finishGame();
        return;
    }

    if (round === 3) {
        if (userScore > computerScore) {
            result.textContent = "Переміг " + playerName + "! Очки: " + userScore;
        } else if (computerScore > userScore) {
            result.textContent = "Переміг комп'ютер! Очки: " + computerScore;
        } else {
            result.textContent = "Нічия!";
        }
        finishGame();
        return;
    }
    round++;
    roundText.textContent = "Спроба " + round + " з 3";
    result.textContent = "Раунд завершено! Можна продовжувати.";
}

function finishGame() {
    gameOver = true;
    generate.disabled = true;
    roundText.textContent = "Гра завершена";
}

function restartGame() {
    userScore = 0;
    computerScore = 0;
    round = 1;
    gameOver = false;
    userScoreText.textContent = 0;
    computerScoreText.textContent = 0;
    userCards.innerHTML = "";
    computerCards.innerHTML = "";
    roundText.textContent = "Спроба 1 з 3";
    result.textContent = "Натисніть Generate";
    generate.disabled = false;
    updateChances();
}

generate.addEventListener("click", play);
restart.addEventListener("click", restartGame);
updateChances();
