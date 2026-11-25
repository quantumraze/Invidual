let playerName = prompt("Введіть ваше ім'я:");

if (playerName === null || playerName.trim() === "") {
    playerName = "Гравець";
}

playerName = playerName.trim();
document.getElementById("playerName").textContent = playerName;

let fruits = [
    "apple.jpg",
    "pear.jpg",
    "lemon.jpg",
    "cherry.jpg",
    "apricot.jpg"
];

let generate = document.getElementById("generate");
let restart = document.getElementById("restart");
let attemptText = document.getElementById("attempt");
let result = document.getElementById("result");
let cells = document.querySelectorAll(".cell");
let images = document.querySelectorAll(".cell img");


let attempt = 1;
let gameOver = false;
let spinning = false;


function randomFruit() {

    let index = Math.floor(Math.random() * fruits.length);
    return fruits[index];
}


function checkWin() {
    let winningRows = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8]
    ];

    let win = false;
    for (let row of winningRows) {
        let first = images[row[0]].src;
        let second = images[row[1]].src;
        let third = images[row[2]].src;

        if (first === second && second === third) {
            win = true;
            for (let index of row) {
                cells[index].classList.add("winner");
            }
        }
    }
    return win;
}


function generateFruits() {
    for (let i = 0; i < images.length; i++) {
        images[i].src = randomFruit();
    }
}

function finishGame() {
    gameOver = true;
    generate.disabled = true;
    attemptText.textContent = "Гра завершена";
}

function play() {

    if (gameOver || spinning) {
        return;
    }

    spinning = true;
    generate.disabled = true;
    result.textContent = "Барабани обертаються...";

    for (let cell of cells) {
        cell.classList.remove("winner");
        cell.classList.add("spinning");
    }
    let animation = setInterval(function() {
        generateFruits();
    }, 100);

    setTimeout(function() {
        clearInterval(animation);
        generateFruits();
        for (let cell of cells) {
            cell.classList.remove("spinning");
        }
        spinning = false;

        if (checkWin()) {
            result.textContent = "🎉 Перемога! Три однакові фрукти в ряд!";
            finishGame();
            return;
        }

        if (attempt === 3) {
            result.textContent = "Спроби закінчилися! Ви програли!";
            finishGame();
            return;
        }
        attempt++;
        attemptText.textContent = "Спроба " + attempt + " з 3";
        result.textContent = "Немає збігів. Спробуйте ще раз!";
        generate.disabled = false;
    }, 1000);
}


function restartGame() {

    if (spinning) {
        return;
    }
    attempt = 1;
    gameOver = false;
    attemptText.textContent = "Спроба 1 з 3";
    result.textContent = "Натисніть Generate для початку гри!";

    for (let cell of cells) {
        cell.classList.remove("winner");
        cell.classList.remove("spinning");
    }
    generateFruits();
    generate.disabled = false;
}

generate.addEventListener("click", play);
restart.addEventListener("click", restartGame);