const ROWS = 10;
const COLS = 10;
const MINES = 15;
const PHOTO = "screamer.jpg";
const SCREAMER_TIME = 10;
let board = [];
let gameOver = false;
let firstClick = true;
let openedCells = 0;
let flags = 0;
let seconds = 0;
let timer = null;
let flagMode = false;
let screamerTimer = null;
let screamerSeconds = SCREAMER_TIME;
$(function () {
    let playerName = sessionStorage.getItem("playerName");
    if (!playerName) {
        enterName();
    } else {
        showName(playerName);
    }
    function enterName() {
        let name = prompt("Введіть ваше ім'я:");
        if (name === null) {
            showName(playerName || "Гість");
            return;
        }
        name = name.trim();
        if (name.length < 2 || name.length > 30 || !/^[\p{L}\s'’\-]+$/u.test(name)) {
            alert("Введіть коректне ім'я!");
            showName(playerName || "Гість");
            return;
        }
        playerName = name;
        sessionStorage.setItem("playerName", name);
        showName(name);
    }
    function showName(name) {
        $("#welcome").text("Вітаємо, " + name + "!");
    }
    $("#changeName").on("click", function () {
        enterName();
    });
    $("#search").on("input", function () {
        let search = $(this).val().trim().toLowerCase();
        let count = 0;
        $(".game-item").each(function () {
            let text = $(this).text().toLowerCase();
            let visible = text.includes(search);
            $(this).toggle(visible);
            if (visible) {
                count++;
            }
        });
        $("#noResults").toggle(count === 0);
    });
    function updateTime() {
        let now = new Date();
        $("#dateTime").text(now.toLocaleString("uk-UA"));
    }
    updateTime();
    setInterval(updateTime, 1000);
    newGame();
    $("#board").on("click", ".cell", function () {
        let row = Number($(this).data("row"));
        let col = Number($(this).data("col"));
        if (flagMode) {
            toggleFlag(row, col);
        } else {
            openCell(row, col);
        }
    });
    $("#board").on("contextmenu", ".cell", function (event) {
        event.preventDefault();
        let row = Number($(this).data("row"));
        let col = Number($(this).data("col"));
        toggleFlag(row, col);
    });
    $("#restart").on("click", function () {
        newGame();
    });
    $("#flagMode").on("click", function () {
        if (gameOver) {
            return;
        }
        flagMode = !flagMode;
        $(this).text("🚩 Прапорці: " + (flagMode ? "ON" : "OFF"));
        $(this).toggleClass("active", flagMode);
    });
    $("#closeScreamer").on("click", function () {
        closeScreamer();
    });
    $(document).on("keydown", function (event) {
        if (event.key === "Escape") {
            closeScreamer();
        }
    });
});
function newGame() {
    clearInterval(timer);
    closeScreamer();
    timer = null;
    gameOver = false;
    firstClick = true;
    openedCells = 0;
    flags = 0;
    seconds = 0;
    flagMode = false;
    board = [];
    $("#board").empty();
    for (let row = 0; row < ROWS; row++) {
        board[row] = [];
        for (let col = 0; col < COLS; col++) {
            board[row][col] = {
                mine: false,
                revealed: false,
                flagged: false,
                number: 0
            };
            let cell = $("<button>").addClass("cell").attr("type", "button").attr("data-row", row).attr("data-col", col).attr("aria-label", "Клітинка " + (row + 1) + ", " + (col + 1));
            $("#board").append(cell);
        }
    }
    $("#timer").text("0 с");
    $("#message").text("Натисніть на будь-яку клітинку");
    $("#flagMode").removeClass("active").text("🚩 Прапорці: OFF");
    updateStats();
}
function isInside(row, col) {
    return row >= 0 && row < ROWS && col >= 0 && col < COLS;
}
function placeMines(safeRow, safeCol) {
    let placed = 0;
    while (placed < MINES) {
        let row = Math.floor(Math.random() * ROWS);
        let col = Math.floor(Math.random() * COLS);
        if (Math.abs(row - safeRow) <= 1 && Math.abs(col - safeCol) <= 1) {
            continue;
        }
        if (board[row][col].mine) {
            continue;
        }
        board[row][col].mine = true;
        placed++;
    }
    calculateNumbers();
}
function calculateNumbers() {
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (board[row][col].mine) {
                continue;
            }
            let count = 0;
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) {
                        continue;
                    }
                    let nr = row + dr;
                    let nc = col + dc;
                    if (isInside(nr, nc) && board[nr][nc].mine) {
                        count++;
                    }
                }
            }
            board[row][col].number = count;
        }
    }
}
function getCell(row, col) {
    return $('.cell[data-row="' + row + '"][data-col="' + col + '"]');
}
function openCell(row, col) {
    if (gameOver || !isInside(row, col)) {
        return;
    }
    let cell = board[row][col];
    if (cell.revealed || cell.flagged) {
        return;
    }
    if (firstClick) {
        placeMines(row, col);
        firstClick = false;
        startTimer();
        $("#message").text("Гра триває...");
    }
    if (cell.mine) {
        loseGame();
        return;
    }
    revealCell(row, col);
    updateStats();
    checkWin();
}
function revealCell(row, col) {
    if (!isInside(row, col)) {
        return;
    }
    let cell = board[row][col];
    if (cell.revealed || cell.flagged || cell.mine) {
        return;
    }
    cell.revealed = true;
    openedCells++;
    let element = getCell(row, col);
    element.addClass("revealed");
    if (cell.number > 0) {
        element.text(cell.number).addClass("number-" + cell.number);
    } else {
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) {
                    continue;
                }
                revealCell(row + dr, col + dc);
            }
        }
    }
}
function toggleFlag(row, col) {
    if (gameOver || !isInside(row, col)) {
        return;
    }
    let cell = board[row][col];
    if (cell.revealed) {
        return;
    }
    let element = getCell(row, col);
    if (cell.flagged) {
        cell.flagged = false;
        flags--;
        element.removeClass("flagged").text("");
    } else {
        if (flags >= MINES) {
            $("#message").text("Усі прапорці використано!");
            return;
        }
        cell.flagged = true;
        flags++;
        element.addClass("flagged").text("🚩");
    }
    updateStats();
}
function updateStats() {
    $("#minesCount").text(MINES - flags);
    $("#opened").text(openedCells + "/" + (ROWS * COLS - MINES));
}
function startTimer() {
    clearInterval(timer);
    timer = setInterval(function () {
        seconds++;
        $("#timer").text(seconds + " с");
    }, 1000);
}
function checkWin() {
    if (openedCells === ROWS * COLS - MINES) {
        gameOver = true;
        clearInterval(timer);
        $("#message").text("🏆 Перемога! Усі безпечні клітинки відкрито!");
    }
}
function loseGame() {
    gameOver = true;
    clearInterval(timer);
    $("#message").text("Ви програли!");
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (board[row][col].mine) {
                let image = $("<img>").attr("src", PHOTO).attr("alt", "Міна");
                getCell(row, col).removeClass("flagged").addClass("mine revealed").empty().append(image);
            }
        }
    }
    showScreamer();
}
function showScreamer() {
    clearInterval(screamerTimer);
    screamerSeconds = SCREAMER_TIME;
    $("#countdown").text(screamerSeconds);
    $("#screamer").css("display", "flex");
    $("#closeScreamer").focus();
    screamerTimer = setInterval(function () {
        screamerSeconds--;
        $("#countdown").text(screamerSeconds);
        if (screamerSeconds <= 0) {
            closeScreamer();
        }
    }, 1000);
}
function closeScreamer() {
    let wasVisible = $("#screamer").is(":visible");
    clearInterval(screamerTimer);
    screamerTimer = null;
    $("#screamer").hide();
    if (wasVisible) {
        $("#restart").focus();
    }
}
