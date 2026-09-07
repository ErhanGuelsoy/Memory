
import "./styles/style.scss";
import "./styles/food-theme.scss";

type CardElement = HTMLElement;

let firstCard: CardElement | null = null;
let secondCard: CardElement | null = null;
let lockBoard = false;

let player1Score = 0;
let player2Score = 0;
let currentPlayer = 1;
let matchedPairs = 0;
let totalPairs = 0;

/**
 * Initializes the food memory game.
 */
function init(): void {
    createCards();
    setupCards();
    setupScore();
    setupExitPopup();
}

/**
 * Creates the selected number of food cards.
 */
function createCards(): void {
    const container =
        document.querySelector<HTMLElement>(
            ".memory__card-container"
        );

    if (!container) {
        return;
    }

    const cardCount =
        Number(localStorage.getItem("cardCount")) || 16;

    container.dataset.cardCount =
        String(cardCount);

    totalPairs = cardCount / 2;

    for (let i = 1; i <= totalPairs; i++) {
        createCard(container, i);
        createCard(container, i);
    }
}

/**
 * Creates one food memory card.
 */
function createCard(
    container: HTMLElement,
    cardNumber: number
): void {
    const card =
        document.createElement("div");

    const imageNumber =
        ((cardNumber - 1) % 8) + 1;

    const formattedNumber =
        String(imageNumber).padStart(2, "0");

    card.classList.add(
        "memory__card"
    );

    card.dataset.card =
        String(cardNumber);

    card.innerHTML = `
        <div class="memory__card-inner">

            <div class="memory__card-front">

                <img
                    src="/public/assets/images/food_card.png"
                    alt="Food card front"
                >

            </div>

            <div
                class="memory__card-back"
                style="
                    --food-card:
                    url('/public/assets/images/food card ${formattedNumber}.png');
                "
            >
            </div>

        </div>
    `;

    container.appendChild(card);
}

/**
 * Sets up the memory cards.
 */
function setupCards(): void {
    const cards =
        document.querySelectorAll<CardElement>(
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
    const container =
        document.querySelector<HTMLElement>(
            ".memory__card-container"
        );

    if (!container) {
        return;
    }

    const cardArray: CardElement[] =
        Array.from(cards);

    for (let i = cardArray.length - 1; i > 0; i--) {

        const randomIndex =
            Math.floor(
                Math.random() * (i + 1)
            );

        const currentCard =
            cardArray[i];

        cardArray[i] =
            cardArray[randomIndex];

        cardArray[randomIndex] =
            currentCard;
    }

    cardArray.forEach(
        (card: CardElement) => {
            container.appendChild(card);
        }
    );
}

/**
 * Handles a card click.
 */
function handleCardClick(
    card: CardElement
): void {
    if (
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

    const firstValue =
        firstCard.dataset.card;

    const secondValue =
        secondCard.dataset.card;

    const isMatch =
        firstValue === secondValue;

    if (isMatch) {
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
 * Updates the displayed player scores.
 */
function updateScore(): void {
    const player1 =
        document.querySelector<HTMLElement>(
            "#player1Score"
        );

    const player2 =
        document.querySelector<HTMLElement>(
            "#player2Score"
        );

    if (player1) {
        player1.textContent =
            String(player1Score);
    }

    if (player2) {
        player2.textContent =
            String(player2Score);
    }
}

/**
 * Sets up the initial score display.
 */
function setupScore(): void {
    player1Score = 0;
    player2Score = 0;
    currentPlayer = 1;
    matchedPairs = 0;

    updateScore();
}

/**
 * Changes the current player.
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

    firstCard.classList.remove(
        "is-flipped"
    );

    secondCard.classList.remove(
        "is-flipped"
    );

    switchPlayer();

    resetBoard();
}

/**
 * Checks if all pairs have been found.
 */
function checkGameWon(): void {
    if (matchedPairs === totalPairs) {
        showWinnerPopup();
    }
}

/**
 * Shows the winner popup.
 */
function showWinnerPopup(): void {
    const winnerPopup =
        document.querySelector<HTMLElement>(
            "#winnerPopup"
        );

    if (!winnerPopup) {
        return;
    }

    winnerPopup.classList.add(
        "is-visible"
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
    const exitButton =
        document.querySelector<HTMLElement>(
            ".gaming__header-right-part-exit-game"
        );

    const exitPopup =
        document.querySelector<HTMLElement>(
            "#exitPopup"
        );

    const popup =
        document.querySelector<HTMLElement>(
            ".exit-popup"
        );

    const backToGame =
        document.querySelector<HTMLElement>(
            "#backToGame"
        );

    const exitGame =
        document.querySelector<HTMLElement>(
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

    popup.classList.remove(
        "is-closing"
    );

    popup.classList.add(
        "is-visible"
    );
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

    popup.classList.add(
        "is-closing"
    );

    setTimeout(() => {
        popup.classList.remove(
            "is-visible"
        );

        popup.classList.remove(
            "is-closing"
        );
    }, 450);
}

/**
 * Leaves the game and returns to settings.
 */
function leaveGame(): void {
    window.location.href =
        "/settings.html";
}

init();

