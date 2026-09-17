import "./styles/style.scss";
import "./styles/food-theme.scss";
/**
 * Represents one food memory card.
 */
class Card {
    id;
    image;
    isFlipped = false;
    isMatched = false;
    /**
     * Creates a new food card.
     * @param data Card data.
     */
    constructor(data) {
        this.id = data.id;
        this.image = data.image;
    }
    /**
     * Flips the card.
     */
    flip() {
        this.isFlipped = true;
    }
    /**
     * Marks the card as matched.
     */
    match() {
        this.isMatched = true;
    }
}
/**
 * Controls the food memory game.
 */
class MemoryGame {
    firstCard = null;
    secondCard = null;
    firstCardElement = null;
    secondCardElement = null;
    lockBoard = false;
    player1Score = 0;
    player2Score = 0;
    currentPlayer = 1;
    matchedPairs = 0;
    totalPairs = 0;
    gameFinished = false;
    /**
     * Initializes the food memory game.
     */
    init() {
        this.setupScore();
        this.setupStartingPlayer();
        this.createCards();
        this.setupExitPopup();
        this.setupWinnerPopup();
        this.setupWinnerButtons();
    }
    /**
     * Sets the selected starting player.
     */
    setupStartingPlayer() {
        const selectedPlayer = localStorage.getItem("selectedPlayer") || "blue";
        this.currentPlayer =
            selectedPlayer === "orange" ? 1 : 2;
        this.updateCurrentPlayerIndicator();
    }
    /**
     * Updates the active player indicator.
     */
    updateCurrentPlayerIndicator() {
        const players = document.querySelectorAll("[data-player]");
        players.forEach((player) => {
            const name = player.dataset.player;
            const active = name === this.getCurrentPlayerName();
            player.classList.toggle("is-current-player", active);
        });
    }
    /**
     * Gets the current player's name.
     * @returns Current player name.
     */
    getCurrentPlayerName() {
        return this.currentPlayer === 1 ? "orange" : "blue";
    }
    /**
     * Creates all memory cards.
     */
    createCards() {
        const container = document.querySelector(".memory__card-container");
        if (!container) {
            return;
        }
        const count = Number(localStorage.getItem("cardCount")) || 16;
        container.dataset.cardCount = String(count);
        this.totalPairs = count / 2;
        const cards = this.buildCards();
        this.shuffleCards(cards);
        this.renderCards(cards, container);
    }
    /**
     * Creates the card pairs.
     * @returns All cards.
     */
    buildCards() {
        const cards = [];
        for (let i = 1; i <= this.totalPairs; i++) {
            const image = `/assets/images/food card ${String(i).padStart(2, "0")}.png`;
            cards.push(new Card({ id: i, image }));
            cards.push(new Card({ id: i, image }));
        }
        return cards;
    }
    /**
     * Shuffles the cards.
     * @param cards Cards to shuffle.
     */
    shuffleCards(cards) {
        for (let i = cards.length - 1; i > 0; i--) {
            const randomIndex = Math.floor(Math.random() * (i + 1));
            [cards[i], cards[randomIndex]] =
                [cards[randomIndex], cards[i]];
        }
    }
    /**
     * Renders all cards.
     * @param cards Cards to render.
     * @param container Card container.
     */
    renderCards(cards, container) {
        cards.forEach((card) => {
            const element = this.createCardElement(card);
            container.appendChild(element);
            element.addEventListener("click", () => this.handleCardClick(card, element));
        });
    }
    /**
     * Creates a card element.
     * @param card Card object.
     * @returns Card element.
     */
    createCardElement(card) {
        const element = document.createElement("div");
        element.classList.add("memory__card");
        element.dataset.card = String(card.id);
        element.innerHTML = this.getCardMarkup(card);
        return element;
    }
    /**
     * Creates card markup.
     * @param card Card object.
     * @returns Card markup.
     */
    getCardMarkup(card) {
        return `
            <div class="memory__card-inner">
                <div class="memory__card-front">
                    <img
                        src="/assets/images/food_card.png"
                        alt="Food card front"
                    >
                </div>
                <div
                    class="memory__card-back"
                    style="--food-card: url('${card.image}');"
                ></div>
            </div>
        `;
    }
    /**
     * Handles a card click.
     * @param card Selected card.
     * @param element Selected element.
     */
    handleCardClick(card, element) {
        if (this.isCardBlocked(card)) {
            return;
        }
        card.flip();
        element.classList.add("is-flipped");
        if (!this.firstCard) {
            this.selectFirstCard(card, element);
            return;
        }
        this.selectSecondCard(card, element);
        this.checkMatch();
    }
    /**
     * Checks whether a card is blocked.
     * @param card Selected card.
     * @returns True when blocked.
     */
    isCardBlocked(card) {
        return (this.gameFinished ||
            this.lockBoard ||
            card.isFlipped ||
            card.isMatched);
    }
    /**
     * Selects the first card.
     * @param card Card object.
     * @param element Card element.
     */
    selectFirstCard(card, element) {
        this.firstCard = card;
        this.firstCardElement = element;
    }
    /**
     * Selects the second card.
     * @param card Card object.
     * @param element Card element.
     */
    selectSecondCard(card, element) {
        this.secondCard = card;
        this.secondCardElement = element;
    }
    /**
     * Checks the selected cards.
     */
    checkMatch() {
        if (!this.firstCard || !this.secondCard) {
            return;
        }
        if (this.firstCard.id === this.secondCard.id) {
            this.handleMatch();
            return;
        }
        this.lockBoard = true;
        setTimeout(() => this.unflipCards(), 1000);
    }
    /**
     * Handles a matching pair.
     */
    handleMatch() {
        if (!this.hasSelectedCards()) {
            return;
        }
        this.firstCard.match();
        this.secondCard.match();
        this.markCardsAsMatched();
        this.addPoint();
        this.matchedPairs++;
        this.resetBoard();
        this.checkGameWon();
    }
    /**
     * Checks whether both cards are selected.
     * @returns True when cards and elements exist.
     */
    hasSelectedCards() {
        return !!(this.firstCard &&
            this.secondCard &&
            this.firstCardElement &&
            this.secondCardElement);
    }
    /**
     * Marks selected cards as matched.
     */
    markCardsAsMatched() {
        this.firstCardElement?.classList.add("matched");
        this.secondCardElement?.classList.add("matched");
    }
    /**
     * Adds a point to the current player.
     */
    addPoint() {
        if (this.currentPlayer === 1) {
            this.player1Score++;
        }
        else {
            this.player2Score++;
        }
        this.updateScore();
    }
    /**
     * Updates both score counters.
     */
    updateScore() {
        this.updateScoreElement("#player1Score", this.player1Score);
        this.updateScoreElement("#player2Score", this.player2Score);
    }
    /**
     * Updates one score element.
     * @param selector Element selector.
     * @param score Score value.
     */
    updateScoreElement(selector, score) {
        const element = document.querySelector(selector);
        if (element) {
            element.textContent = String(score);
        }
    }
    /**
     * Sets the initial game state.
     */
    setupScore() {
        this.player1Score = 0;
        this.player2Score = 0;
        this.currentPlayer = 1;
        this.matchedPairs = 0;
        this.gameFinished = false;
        this.lockBoard = false;
        this.resetBoard();
        this.updateScore();
    }
    /**
     * Turns unmatched cards back over.
     */
    unflipCards() {
        if (!this.hasSelectedCards()) {
            return;
        }
        this.firstCard.isFlipped = false;
        this.secondCard.isFlipped = false;
        this.removeFlippedClasses();
        this.switchPlayer();
        this.resetBoard();
    }
    /**
     * Removes flipped classes.
     */
    removeFlippedClasses() {
        this.firstCardElement?.classList.remove("is-flipped");
        this.secondCardElement?.classList.remove("is-flipped");
    }
    /**
     * Switches to the other player.
     */
    switchPlayer() {
        this.currentPlayer =
            this.currentPlayer === 1 ? 2 : 1;
        this.updateCurrentPlayerIndicator();
    }
    /**
     * Resets the selected cards.
     */
    resetBoard() {
        this.firstCard = null;
        this.secondCard = null;
        this.firstCardElement = null;
        this.secondCardElement = null;
        this.lockBoard = false;
    }
    /**
     * Checks whether the game is finished or tied.
     */
    checkGameWon() {
        if (this.matchedPairs !== this.totalPairs ||
            this.gameFinished) {
            return;
        }
        this.gameFinished = true;
        if (this.player1Score === this.player2Score) {
            this.showDrawPopup();
            return;
        }
        this.showWinnerPopup();
    }
    /**
     * Shows the draw popup.
     */
    showDrawPopup() {
        const popup = document.querySelector("#winnerPopup");
        const drawWinner = document.querySelector("#drawWinner");
        if (!popup || !drawWinner) {
            return;
        }
        this.hideWinnerContainers();
        drawWinner.style.display = "flex";
        drawWinner.classList.add("is-visible");
        popup.classList.add("is-visible");
    }
    /**
     * Shows the winner popup.
     */
    showWinnerPopup() {
        const popup = document.querySelector("#winnerPopup");
        if (!popup) {
            return;
        }
        this.hideWinnerContainers();
        this.updateWinnerPopup();
        popup.classList.add("is-visible");
    }
    /**
     * Hides winner and draw containers.
     */
    hideWinnerContainers() {
        const winners = document.querySelectorAll("#blueWinner, #orangeWinner, #drawWinner");
        winners.forEach((winner) => {
            winner.classList.remove("is-visible");
            winner.style.display = "none";
        });
    }
    /**
     * Updates the winner popup.
     */
    updateWinnerPopup() {
        const orange = document.querySelector("#orangeWinner");
        const blue = document.querySelector("#blueWinner");
        if (!orange || !blue) {
            return;
        }
        if (this.player1Score > this.player2Score) {
            this.showWinner(orange, "#orangeWinnerScore", this.player1Score);
            return;
        }
        this.showWinner(blue, "#blueWinnerScore", this.player2Score);
    }
    /**
     * Shows a winner container.
     * @param winner Winner element.
     * @param selector Score selector.
     * @param score Winner score.
     */
    showWinner(winner, selector, score) {
        this.updateScoreElement(selector, score);
        winner.style.display = "flex";
        winner.classList.add("is-visible");
    }
    /**
     * Sets up winner buttons.
     */
    setupWinnerButtons() {
        const buttons = document.querySelectorAll("#blueBackHome, #orangeBackHome, #drawBackHome");
        buttons.forEach((button) => {
            button.addEventListener("click", () => this.leaveGame());
        });
    }
    /**
     * Sets up the winner popup.
     */
    setupWinnerPopup() {
        const popup = document.querySelector("#winnerPopup");
        popup?.addEventListener("click", (event) => {
            if (event.target === popup) {
                popup.classList.remove("is-visible");
            }
        });
    }
    /**
     * Sets up the exit popup.
     */
    setupExitPopup() {
        const exitButton = document.querySelector(".gaming__header-right-part-exit-game");
        const exitPopup = document.querySelector("#exitPopup");
        const popup = document.querySelector(".exit-popup");
        const backToGame = document.querySelector("#backToGame");
        const exitGame = document.querySelector("#exitGame");
        exitButton?.addEventListener("click", () => this.openExitPopup(exitPopup));
        backToGame?.addEventListener("click", () => this.closeExitPopup(exitPopup));
        exitGame?.addEventListener("click", () => this.leaveGame());
        exitPopup?.addEventListener("click", (event) => this.handlePopupClick(event, popup, exitPopup));
    }
    /**
     * Handles clicks outside the exit popup.
     * @param event Mouse event.
     * @param popup Popup element.
     * @param exitPopup Overlay element.
     */
    handlePopupClick(event, popup, exitPopup) {
        const target = event.target;
        if (popup &&
            target instanceof Node &&
            !popup.contains(target)) {
            this.closeExitPopup(exitPopup);
        }
    }
    /**
     * Opens the exit popup.
     * @param popup Popup element.
     */
    openExitPopup(popup) {
        if (!popup) {
            return;
        }
        popup.classList.remove("is-closing");
        popup.classList.add("is-visible");
    }
    /**
     * Closes the exit popup.
     * @param popup Popup element.
     */
    closeExitPopup(popup) {
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
    leaveGame() {
        window.location.href =
            `${import.meta.env.BASE_URL}settings.html`;
    }
}
const game = new MemoryGame();
game.init();
