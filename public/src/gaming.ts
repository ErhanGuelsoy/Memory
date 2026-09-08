
import "./styles/style.scss";
import "./styles/gaming-screen.scss";


interface Card {
    id: number;
    image: string;
    isFlipped: boolean;
    isMatched: boolean;
}


let firstCard: Card | null = null;
let secondCard: Card | null = null;

let firstCardElement: HTMLElement | null = null;
let secondCardElement: HTMLElement | null = null;

let lockBoard = false;

let player1Score = 0;
let player2Score = 0;
let currentPlayer = 1;

let matchedPairs = 0;
let totalPairs = 0;

let gameFinished = false;


/**
 * Initializes the memory game.
 */
function init(): void {
    setupScore();
    createCards();
    setupExitPopup();
    setupWinnerButtons();
}


/**
 * Creates a new card.
 */
function createCard(
    id: number,
    image: string
): Card {
    return {
        id,
        image,
        isFlipped: false,
        isMatched: false
    };
}


/**
 * Creates all memory cards.
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
        Number(
            localStorage.getItem("cardCount")
        ) || 16;

    container.dataset.cardCount =
        String(cardCount);

    totalPairs = cardCount / 2;

    const cards: Card[] = [];

    for (
        let i = 1;
        i <= totalPairs;
        i++
    ) {
        const image =
            `/public/assets/images/Code vibes card ${i}.png`;

        cards.push(
            createCard(i, image)
        );

        cards.push(
            createCard(i, image)
        );
    }

    shuffleCards(cards);

    cards.forEach(
        (card) => {
            const element =
                createCardElement(card);

            container.appendChild(element);

            element.addEventListener(
                "click",
                () => handleCardClick(
                    card,
                    element
                )
            );
        }
    );
}


/**
 * Creates the HTML element for a card.
 */
function createCardElement(
    card: Card
): HTMLElement {
    const element =
        document.createElement("div");

    element.classList.add(
        "memory__card"
    );

    element.dataset.card =
        String(card.id);

    element.innerHTML = `
        <div class="memory__card-inner">

            <div
                class="memory__card-front"
                style="
                    background-image:
                    url('${card.image}');
                "
            ></div>

            <div
                class="memory__card-back"
                style="
                    background-image:
                    url('${card.image}');
                "
            ></div>

        </div>
    `;

    return element;
}


/**
 * Shuffles the cards.
 */
function shuffleCards(
    cards: Card[]
): void {
    for (
        let i = cards.length - 1;
        i > 0;
        i--
    ) {
        const randomIndex =
            Math.floor(
                Math.random() * (i + 1)
            );

        [
            cards[i],
            cards[randomIndex]
        ] = [
            cards[randomIndex],
            cards[i]
        ];
    }
}


/**
 * Handles a card click.
 */
function handleCardClick(
    card: Card,
    element: HTMLElement
): void {
    if (
        gameFinished ||
        lockBoard ||
        card.isFlipped ||
        card.isMatched
    ) {
        return;
    }

    card.isFlipped = true;

    element.classList.add(
        "is-flipped"
    );

    if (!firstCard) {
        firstCard = card;
        firstCardElement = element;
        return;
    }

    secondCard = card;
    secondCardElement = element;

    checkMatch();
}


/**
 * Checks whether the cards match.
 */
function checkMatch(): void {
    if (
        !firstCard ||
        !secondCard
    ) {
        return;
    }

    if (
        firstCard.id ===
        secondCard.id
    ) {
        handleMatch();
        return;
    }

    lockBoard = true;

    setTimeout(
        unflipCards,
        1000
    );
}


/**
 * Handles a matching pair.
 */
function handleMatch(): void {
    if (
        !firstCard ||
        !secondCard ||
        !firstCardElement ||
        !secondCardElement
    ) {
        return;
    }

    firstCard.isMatched = true;
    secondCard.isMatched = true;

    firstCardElement.classList.add(
        "matched"
    );

    secondCardElement.classList.add(
        "matched"
    );

    addPoint();

    matchedPairs++;

    resetBoard();

    checkGameWon();
}


/**
 * Adds a point to the current player.
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
 * Updates the score display.
 */
function updateScore(): void {
    updateScoreElement(
        "#player1Score",
        player1Score
    );

    updateScoreElement(
        "#player2Score",
        player2Score
    );
}


/**
 * Updates one score element.
 */
function updateScoreElement(
    selector: string,
    score: number
): void {
    const element =
        document.querySelector<HTMLElement>(
            selector
        );

    if (!element) {
        return;
    }

    element.textContent =
        String(score);
}


/**
 * Initializes the score.
 */
function setupScore(): void {
    player1Score = 0;
    player2Score = 0;
    currentPlayer = 1;
    matchedPairs = 0;
    gameFinished = false;
    lockBoard = false;

    firstCard = null;
    secondCard = null;

    firstCardElement = null;
    secondCardElement = null;

    updateScore();
}


/**
 * Turns unmatched cards back over.
 */
function unflipCards(): void {
    if (
        !firstCard ||
        !secondCard ||
        !firstCardElement ||
        !secondCardElement
    ) {
        return;
    }

    firstCard.isFlipped = false;
    secondCard.isFlipped = false;

    firstCardElement.classList.remove(
        "is-flipped"
    );

    secondCardElement.classList.remove(
        "is-flipped"
    );

    switchPlayer();

    resetBoard();
}


/**
 * Switches to the other player.
 */
function switchPlayer(): void {
    currentPlayer =
        currentPlayer === 1
            ? 2
            : 1;
}


/**
 * Resets the selected cards.
 */
function resetBoard(): void {
    firstCard = null;
    secondCard = null;

    firstCardElement = null;
    secondCardElement = null;

    lockBoard = false;
}


/**
 * Checks whether the game is won.
 */
function checkGameWon(): void {
    if (
        matchedPairs !== totalPairs ||
        gameFinished
    ) {
        return;
    }

    gameFinished = true;

    showWinnerPopup();
}


/**
 * Shows the winner popup.
 */
function showWinnerPopup(): void {
    const popup =
        document.querySelector<HTMLElement>(
            "#winnerPopup"
        );

    if (!popup) {
        return;
    }

    hideWinnerContainers();
    updateWinnerPopup();

    popup.classList.add(
        "is-visible"
    );
}


/**
 * Hides all winner containers.
 */
function hideWinnerContainers(): void {
    const winners =
        document.querySelectorAll<HTMLElement>(
            "#blueWinner, #orangeWinner"
        );

    winners.forEach(
        (winner) => {
            winner.classList.remove(
                "is-visible"
            );

            winner.style.display =
                "none";
        }
    );
}


/**
 * Updates the winner popup.
 */
function updateWinnerPopup(): void {
    const orangeWinner =
        document.querySelector<HTMLElement>(
            "#orangeWinner"
        );

    const blueWinner =
        document.querySelector<HTMLElement>(
            "#blueWinner"
        );

    if (
        !orangeWinner ||
        !blueWinner
    ) {
        return;
    }

    if (
        player1Score >
        player2Score
    ) {
        showWinner(
            orangeWinner,
            "#orangeWinnerScore",
            player1Score
        );

        return;
    }

    showWinner(
        blueWinner,
        "#blueWinnerScore",
        player2Score
    );
}


/**
 * Shows the winner and score.
 */
function showWinner(
    winner: HTMLElement,
    scoreSelector: string,
    score: number
): void {
    updateScoreElement(
        scoreSelector,
        score
    );

    winner.style.display =
        "flex";

    winner.classList.add(
        "is-visible"
    );
}


/**
 * Sets up the winner buttons.
 */
function setupWinnerButtons(): void {
    const buttons =
        document.querySelectorAll<HTMLElement>(
            "#blueBackHome, #orangeBackHome"
        );

    buttons.forEach(
        (button) => {
            button.addEventListener(
                "click",
                leaveGame
            );
        }
    );
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
        leaveGame
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
    const target =
        event.target;

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

    setTimeout(
        () => {
            popup.classList.remove(
                "is-visible"
            );

            popup.classList.remove(
                "is-closing"
            );
        },
        450
    );
}


/**
 * Leaves the game.
 */
function leaveGame(): void {
    window.location.href =
        "/settings.html";
}


init();

