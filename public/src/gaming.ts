import "./styles/style.scss";
import "./styles/gaming-screen.scss";

type CardElement = HTMLElement;

let firstCard: CardElement | null = null;
let secondCard: CardElement | null = null;
let lockBoard = false;

let player1Score = 0;
let player2Score = 0;
let currentPlayer = 1;
let matchedPairs = 0;
let totalPairs = 0;
let gameFinished = false;


/**
 * Initializes the gaming memory game.
 */
function init(): void {
    createCards();
    setupCards();
    setupScore();
    setupExitPopup();
    setupWinnerButtons();
}


/**
 * Creates the selected number of gaming cards.
 */
function createCards(): void {
    const container = document.querySelector<HTMLElement>(
        ".memory__card-container"
    );

    if (!container) {
        return;
    }

    const cardCount =
        Number(localStorage.getItem("cardCount")) || 16;

    container.dataset.cardCount = String(cardCount);
    totalPairs = cardCount / 2;

    for (let i = 1; i <= totalPairs; i++) {
        createCard(container, i);
        createCard(container, i);
    }
}


/**
 * Creates one gaming memory card.
 */
function createCard(
    container: HTMLElement,
    cardNumber: number
): void {
    const card = document.createElement("div");

    const imageNumber =
        ((cardNumber - 1) % 16) + 1;

    const imagePath =
        `/public/assets/images/Code vibes card ${imageNumber}.png`;

    card.classList.add("memory__card");
    card.dataset.card = String(cardNumber);

    card.innerHTML = `
        <div class="memory__card-inner">

            <div
                class="memory__card-front"
                style="
                    background-image:
                    url('${imagePath}');
                "
            ></div>

            <div
                class="memory__card-back"
                style="
                    background-image:
                    url('${imagePath}');
                "
            ></div>

        </div>
    `;

    container.appendChild(card);
}


/**
 * Sets up the memory cards.
 */
function setupCards(): void {
    const cards = document.querySelectorAll<CardElement>(
        ".memory__card"
    );

    shuffleCards(cards);

    cards.forEach((card: CardElement) => {
        card.addEventListener(
            "click",
            () => handleCardClick(card)
        );
    });
}


/**
 * Shuffles all memory cards.
 */
function shuffleCards(
    cards: NodeListOf<CardElement>
): void {
    const container = document.querySelector<HTMLElement>(
        ".memory__card-container"
    );

    if (!container) {
        return;
    }

    const cardArray = Array.from(cards);

    for (let i = cardArray.length - 1; i > 0; i--) {
        const randomIndex =
            Math.floor(Math.random() * (i + 1));

        const currentCard = cardArray[i];

        cardArray[i] = cardArray[randomIndex];
        cardArray[randomIndex] = currentCard;
    }

    cardArray.forEach((card: CardElement) => {
        container.appendChild(card);
    });
}


/**
 * Handles a card click.
 */
function handleCardClick(
    card: CardElement
): void {
    if (
        gameFinished ||
        lockBoard ||
        card === firstCard ||
        card.classList.contains("matched")
    ) {
        return;
    }

    card.classList.add("is-flipped");

    if (!firstCard) {
        firstCard = card;
        return;
    }

    secondCard = card;
    checkMatch();
}


/**
 * Checks if both cards match.
 */
function checkMatch(): void {
    if (!firstCard || !secondCard) {
        return;
    }

    const firstValue = firstCard.dataset.card;
    const secondValue = secondCard.dataset.card;

    if (firstValue === secondValue) {
        firstCard.classList.add("matched");
        secondCard.classList.add("matched");

        addPoint();
        matchedPairs++;

        resetBoard();
        checkGameWon();

        return;
    }

    lockBoard = true;

    setTimeout(
        unflipCards,
        1000
    );
}


/**
 * Adds one point to the current player.
 */
function addPoint(): void {
    if (currentPlayer === 1) {
        player1Score++;
    } else {
        player2Score++;
    }

    updateScore();
}


/**
 * Updates both score counters.
 */
function updateScore(): void {
    const player1 = document.querySelector<HTMLElement>(
        "#player1Score"
    );

    const player2 = document.querySelector<HTMLElement>(
        "#player2Score"
    );

    if (player1) {
        player1.textContent = String(player1Score);
    }

    if (player2) {
        player2.textContent = String(player2Score);
    }
}


/**
 * Initializes the score system.
 */
function setupScore(): void {
    player1Score = 0;
    player2Score = 0;
    currentPlayer = 1;
    matchedPairs = 0;
    gameFinished = false;

    updateScore();
}


/**
 * Changes to the other player.
 */
function switchPlayer(): void {
    currentPlayer =
        currentPlayer === 1 ? 2 : 1;
}


/**
 * Turns unmatched cards back over.
 */
function unflipCards(): void {
    if (!firstCard || !secondCard) {
        return;
    }

    firstCard.classList.remove("is-flipped");
    secondCard.classList.remove("is-flipped");

    switchPlayer();
    resetBoard();
}


/**
 * Checks if the game has been won.
 */
function checkGameWon(): void {
    if (
        matchedPairs === totalPairs &&
        !gameFinished
    ) {
        gameFinished = true;
        showWinnerPopup();
    }
}


/**
 * Shows the winner popup.
 */
function showWinnerPopup(): void {
    const winnerPopup = document.querySelector<HTMLElement>(
        "#winnerPopup"
    );

    if (!winnerPopup) {
        return;
    }

    hideAllWinnerContainers();
    updateWinnerPopup();

    winnerPopup.classList.add("is-visible");
}


/**
 * Hides all winner containers.
 */
function hideAllWinnerContainers(): void {
    const winners = document.querySelectorAll<HTMLElement>(
        "#blueWinner, #orangeWinner"
    );

    winners.forEach((winner: HTMLElement) => {
        winner.classList.remove("is-visible");
        winner.style.display = "none";
    });
}


/**
 * Updates the winner popup.
 */
function updateWinnerPopup(): void {
    const blueWinner = document.querySelector<HTMLElement>(
        "#blueWinner"
    );

    const orangeWinner = document.querySelector<HTMLElement>(
        "#orangeWinner"
    );

    if (!blueWinner || !orangeWinner) {
        return;
    }

    if (player1Score > player2Score) {
        showOrangeWinner(orangeWinner);
        return;
    }

    showBlueWinner(blueWinner);
}


/**
 * Shows the orange winner and score.
 */
function showOrangeWinner(
    winner: HTMLElement
): void {
    const score = document.querySelector<HTMLElement>(
        "#orangeWinnerScore"
    );

    if (score) {
        score.textContent = String(player1Score);
    }

    winner.style.display = "flex";
    winner.classList.add("is-visible");
}


/**
 * Shows the blue winner and score.
 */
function showBlueWinner(
    winner: HTMLElement
): void {
    const score = document.querySelector<HTMLElement>(
        "#blueWinnerScore"
    );

    if (score) {
        score.textContent = String(player2Score);
    }

    winner.style.display = "flex";
    winner.classList.add("is-visible");
}


/**
 * Sets up the winner back buttons.
 */
function setupWinnerButtons(): void {
    const blueButton = document.querySelector<HTMLElement>(
        "#blueBackHome"
    );

    const orangeButton = document.querySelector<HTMLElement>(
        "#orangeBackHome"
    );

    blueButton?.addEventListener(
        "click",
        leaveGame
    );

    orangeButton?.addEventListener(
        "click",
        leaveGame
    );
}


/**
 * Resets the selected cards.
 */
function resetBoard(): void {
    firstCard = null;
    secondCard = null;
    lockBoard = false;
}


/**
 * Sets up the exit popup.
 */
function setupExitPopup(): void {
    const exitButton = document.querySelector<HTMLElement>(
        ".gaming__header-right-part-exit-game"
    );

    const exitPopup = document.querySelector<HTMLElement>(
        "#exitPopup"
    );

    const popup = document.querySelector<HTMLElement>(
        ".exit-popup"
    );

    const backToGame = document.querySelector<HTMLElement>(
        "#backToGame"
    );

    const exitGame = document.querySelector<HTMLElement>(
        "#exitGame"
    );

    exitButton?.addEventListener(
        "click",
        () => openExitPopup(exitPopup)
    );

    backToGame?.addEventListener(
        "click",
        () => leaveGame()
    );

    exitGame?.addEventListener(
        "click",
        () => closeExitPopup(exitPopup)
    );

    exitPopup?.addEventListener(
        "click",
        (event: MouseEvent) => {
            handlePopupClick(
                event,
                popup,
                exitPopup
            );
        }
    );
}


/**
 * Handles clicks outside the popup.
 */
function handlePopupClick(
    event: MouseEvent,
    popup: HTMLElement | null,
    exitPopup: HTMLElement
): void {
    const target = event.target;

    if (
        popup &&
        target instanceof Node &&
        !popup.contains(target)
    ) {
        closeExitPopup(exitPopup);
    }
}


/**
 * Opens the exit popup.
 */
function openExitPopup(
    popup: HTMLElement | null
): void {
    if (!popup) {
        return;
    }

    popup.classList.remove("is-closing");
    popup.classList.add("is-visible");
}


/**
 * Closes the exit popup.
 */
function closeExitPopup(
    popup: HTMLElement | null
): void {
    if (!popup) {
        return;
    }

    popup.classList.add("is-closing");

    setTimeout(() => {
        popup.classList.remove("is-visible");
        popup.classList.remove("is-closing");
    }, 450);
}


/**
 * Leaves the game and returns to settings.
 */
function leaveGame(): void {
    window.location.href = "/settings.html";
}


init();