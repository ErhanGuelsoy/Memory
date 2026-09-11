import "./styles/style.scss";
import "./styles/gaming-screen.scss";

interface CardData {
    id: number;
    image: string;
}

/**
 * Represents one memory card.
 */
class Card {
    id: number;
    image: string;
    isFlipped: boolean;
    isMatched: boolean;

    /**
     * Creates a new memory card.
     * @param data Card data.
     */
    constructor(data: CardData) {
        this.id = data.id;
        this.image = data.image;
        this.isFlipped = false;
        this.isMatched = false;
    }

    /**
     * Flips the card.
     */
    flip(): void {
        this.isFlipped = true;
    }

    /**
     * Turns the card back over.
     */
    unflip(): void {
        this.isFlipped = false;
    }

    /**
     * Marks the card as matched.
     */
    match(): void {
        this.isMatched = true;
    }

    /**
     * Checks whether the card is blocked.
     * @returns True when the card cannot be selected.
     */
    isBlocked(): boolean {
        return this.isFlipped || this.isMatched;
    }
}

/**
 * Controls the memory game.
 */
class MemoryGame {
    private firstCard: Card | null = null;
    private secondCard: Card | null = null;
    private firstCardElement: HTMLElement | null = null;
    private secondCardElement: HTMLElement | null = null;
    private lockBoard = false;
    private player1Score = 0;
    private player2Score = 0;
    private currentPlayer = 1;
    private matchedPairs = 0;
    private totalPairs = 0;
    private gameFinished = false;

    /**
     * Initializes the memory game.
     */
    init(): void {
        this.setupScore();
        this.setupStartingPlayer();
        this.createCards();
        this.setupExitPopup();
        this.setupWinnerButtons();
    }

    /**
     * Sets the starting player.
     */
    private setupStartingPlayer(): void {
        const selectedPlayer =
            localStorage.getItem("selectedPlayer") || "blue";

        this.currentPlayer =
            selectedPlayer === "orange" ? 1 : 2;

        this.updateCurrentPlayerIndicator();
    }

    /**
     * Updates the active player indicator.
     */
    private updateCurrentPlayerIndicator(): void {
        const players =
            document.querySelectorAll<HTMLElement>("[data-player]");

        players.forEach((player: HTMLElement) => {
            const playerName = player.dataset.player;
            const isCurrentPlayer =
                playerName === this.getCurrentPlayerName();

            player.classList.toggle(
                "is-current-player",
                isCurrentPlayer
            );
        });
    }

    /**
     * Gets the current player's name.
     * @returns Current player name.
     */
    private getCurrentPlayerName(): string {
        return this.currentPlayer === 1
            ? "orange"
            : "blue";
    }

    /**
     * Creates all memory cards.
     */
    private createCards(): void {
        const container =
            document.querySelector<HTMLElement>(
                ".memory__card-container"
            );

        if (!container) {
            return;
        }

        const savedCardCount =
            localStorage.getItem("cardCount");

        const cardCount =
            Number(savedCardCount) || 16;

        container.dataset.cardCount = String(cardCount);
        this.totalPairs = cardCount / 2;

        const cards = this.buildCards();

        this.shuffleCards(cards);
        this.renderCards(cards, container);
    }

    /**
     * Creates all card pairs.
     * @returns Array containing all cards.
     */
    private buildCards(): Card[] {
        const cards: Card[] = [];

        for (let i = 1; i <= this.totalPairs; i++) {
            const image =
                `public/assets/images/Code vibes card ${i}.png`;

            cards.push(
                new Card({
                    id: i,
                    image
                })
            );

            cards.push(
                new Card({
                    id: i,
                    image
                })
            );
        }

        return cards;
    }

    /**
     * Shuffles the cards.
     * @param cards Cards to shuffle.
     */
    private shuffleCards(cards: Card[]): void {
        for (let i = cards.length - 1; i > 0; i--) {
            const randomIndex =
                Math.floor(Math.random() * (i + 1));

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
     * Renders all cards.
     * @param cards Cards to render.
     * @param container Card container.
     */
    private renderCards(
        cards: Card[],
        container: HTMLElement
    ): void {
        cards.forEach((card: Card) => {
            const element =
                this.createCardElement(card);

            container.appendChild(element);

            element.addEventListener(
                "click",
                () => this.handleCardClick(card, element)
            );
        });
    }

    /**
     * Creates the HTML element for a card.
     * @param card Card data.
     * @returns Card element.
     */
    private createCardElement(
        card: Card
    ): HTMLElement {
        const element =
            document.createElement("div");

        element.classList.add("memory__card");
        element.dataset.card = String(card.id);
        element.innerHTML = this.getCardMarkup(card);

        return element;
    }

    /**
     * Creates the card markup.
     * @param card Card data.
     * @returns Card HTML markup.
     */
    private getCardMarkup(card: Card): string {
        return `
            <div class="memory__card-inner">
                <div
                    class="memory__card-front"
                    style="background-image: url('${card.image}');"
                ></div>
                <div
                    class="memory__card-back"
                    style="background-image: url('${card.image}');"
                ></div>
            </div>
        `;
    }

    /**
     * Handles a card click.
     * @param card Selected card.
     * @param element Card element.
     */
    private handleCardClick(
        card: Card,
        element: HTMLElement
    ): void {
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
     * Checks whether a card can be selected.
     * @param card Card to check.
     * @returns True when blocked.
     */
    private isCardBlocked(card: Card): boolean {
        return (
            this.gameFinished ||
            this.lockBoard ||
            card.isBlocked()
        );
    }

    /**
     * Selects the first card.
     * @param card Selected card.
     * @param element Card element.
     */
    private selectFirstCard(
        card: Card,
        element: HTMLElement
    ): void {
        this.firstCard = card;
        this.firstCardElement = element;
    }

    /**
     * Selects the second card.
     * @param card Selected card.
     * @param element Card element.
     */
    private selectSecondCard(
        card: Card,
        element: HTMLElement
    ): void {
        this.secondCard = card;
        this.secondCardElement = element;
    }

    /**
     * Checks whether both cards match.
     */
    private checkMatch(): void {
        if (!this.firstCard || !this.secondCard) {
            return;
        }

        if (this.firstCard.id === this.secondCard.id) {
            this.handleMatch();
            return;
        }

        this.lockBoard = true;

        setTimeout(() => {
            this.unflipCards();
        }, 1000);
    }

    /**
     * Handles a matching pair.
     */
    private handleMatch(): void {
        if (!this.hasSelectedCards()) {
            return;
        }

        this.firstCard!.match();
        this.secondCard!.match();

        this.markCardsAsMatched();
        this.addPoint();

        this.matchedPairs++;

        this.resetBoard();
        this.checkGameWon();
    }

    /**
     * Checks whether selected cards exist.
     * @returns True when cards exist.
     */
    private hasSelectedCards(): boolean {
        return !!(
            this.firstCard &&
            this.secondCard &&
            this.firstCardElement &&
            this.secondCardElement
        );
    }

    /**
     * Adds matched styling to both cards.
     */
    private markCardsAsMatched(): void {
        this.firstCardElement?.classList.add("matched");
        this.secondCardElement?.classList.add("matched");
    }

    /**
     * Adds a point to the current player.
     */
    private addPoint(): void {
        if (this.currentPlayer === 1) {
            this.player1Score++;
        } else {
            this.player2Score++;
        }

        this.updateScore();
    }

    /**
     * Updates both player scores.
     */
    private updateScore(): void {
        this.updateScoreElement(
            "#player1Score",
            this.player1Score
        );

        this.updateScoreElement(
            "#player2Score",
            this.player2Score
        );
    }

    /**
     * Updates one score element.
     * @param selector Element selector.
     * @param score Score value.
     */
    private updateScoreElement(
        selector: string,
        score: number
    ): void {
        const element =
            document.querySelector<HTMLElement>(selector);

        if (!element) {
            return;
        }

        element.textContent = String(score);
    }

    /**
     * Sets up the initial game state.
     */
    private setupScore(): void {
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
    private unflipCards(): void {
        if (!this.hasSelectedCards()) {
            return;
        }

        this.firstCard!.unflip();
        this.secondCard!.unflip();

        this.removeFlippedClasses();
        this.switchPlayer();
        this.resetBoard();
    }

    /**
     * Removes the flipped class.
     */
    private removeFlippedClasses(): void {
        this.firstCardElement?.classList.remove(
            "is-flipped"
        );

        this.secondCardElement?.classList.remove(
            "is-flipped"
        );
    }

    /**
     * Switches to the other player.
     */
    private switchPlayer(): void {
        this.currentPlayer =
            this.currentPlayer === 1 ? 2 : 1;

        this.updateCurrentPlayerIndicator();
    }

    /**
     * Resets selected cards.
     */
    private resetBoard(): void {
        this.firstCard = null;
        this.secondCard = null;
        this.firstCardElement = null;
        this.secondCardElement = null;
        this.lockBoard = false;
    }

    /**
     * Checks whether the game is won.
     */
    private checkGameWon(): void {
        if (
            this.matchedPairs !== this.totalPairs ||
            this.gameFinished
        ) {
            return;
        }

        this.gameFinished = true;
        this.showWinnerPopup();
    }

    /**
     * Shows winner popup.
     */
    private showWinnerPopup(): void {
        const popup =
            document.querySelector<HTMLElement>(
                "#winnerPopup"
            );

        if (!popup) {
            return;
        }

        this.hideWinnerContainers();
        this.updateWinnerPopup();

        popup.classList.add("is-visible");
    }

    /**
     * Hides winner containers.
     */
    private hideWinnerContainers(): void {
        const winners =
            document.querySelectorAll<HTMLElement>(
                "#blueWinner, #orangeWinner"
            );

        winners.forEach((winner: HTMLElement) => {
            winner.classList.remove("is-visible");
            winner.style.display = "none";
        });
    }

    /**
     * Updates winner popup.
     */
    private updateWinnerPopup(): void {
        const orangeWinner =
            document.querySelector<HTMLElement>(
                "#orangeWinner"
            );

        const blueWinner =
            document.querySelector<HTMLElement>(
                "#blueWinner"
            );

        if (!orangeWinner || !blueWinner) {
            return;
        }

        if (this.player1Score > this.player2Score) {
            this.showWinner(
                orangeWinner,
                "#orangeWinnerScore",
                this.player1Score
            );
            return;
        }

        this.showWinner(
            blueWinner,
            "#blueWinnerScore",
            this.player2Score
        );
    }

    /**
     * Shows winner and score.
     * @param winner Winner container.
     * @param scoreSelector Score selector.
     * @param score Winner score.
     */
    private showWinner(
        winner: HTMLElement,
        scoreSelector: string,
        score: number
    ): void {
        this.updateScoreElement(
            scoreSelector,
            score
        );

        winner.style.display = "flex";
        winner.classList.add("is-visible");
    }

    /**
     * Sets up winner buttons.
     */
    private setupWinnerButtons(): void {
        const buttons =
            document.querySelectorAll<HTMLElement>(
                "#blueBackHome, #orangeBackHome"
            );

        buttons.forEach((button: HTMLElement) => {
            button.addEventListener(
                "click",
                () => this.leaveGame()
            );
        });
    }

    /**
     * Sets up exit popup.
     */
    private setupExitPopup(): void {
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
            () => this.openExitPopup(exitPopup)
        );

        backToGame?.addEventListener(
            "click",
            () => this.closeExitPopup(exitPopup)
        );

        exitGame?.addEventListener(
            "click",
            () => this.leaveGame()
        );

        exitPopup?.addEventListener(
            "click",
            (event: MouseEvent) => {
                this.handlePopupClick(
                    event,
                    popup,
                    exitPopup
                );
            }
        );
    }

    /**
     * Handles clicks outside popup.
     * @param event Mouse event.
     * @param popup Popup element.
     * @param exitPopup Popup overlay.
     */
    private handlePopupClick(
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
            this.closeExitPopup(exitPopup);
        }
    }

    /**
     * Opens exit popup.
     * @param popup Popup element.
     */
    private openExitPopup(
        popup: HTMLElement | null
    ): void {
        if (!popup) {
            return;
        }

        popup.classList.remove("is-closing");
        popup.classList.add("is-visible");
    }

    /**
     * Closes exit popup.
     * @param popup Popup element.
     */
    private closeExitPopup(
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
    private leaveGame(): void {
        window.location.href =
            `${import.meta.env.BASE_URL}settings.html`;
    }
}

const game = new MemoryGame();

game.init();