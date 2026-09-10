
import "./styles/style.scss";
import "./styles/food-theme.scss";

interface CardData {
    id: number;
    image: string;
}

type CardElement = HTMLElement;

/**
 * Represents one food memory card.
 */
class Card {
    id: number;
    image: string;
    isFlipped: boolean;
    isMatched: boolean;

    /**
     * Creates a new food card.
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
     * Marks the card as matched.
     */
    match(): void {
        this.isMatched = true;
    }
}

/**
 * Controls the food memory game.
 */
class MemoryGame {
    private firstCard: Card | null = null;
    private secondCard: Card | null = null;
    private firstCardElement: CardElement | null = null;
    private secondCardElement: CardElement | null = null;
    private lockBoard = false;
    private player1Score = 0;
    private player2Score = 0;
    private currentPlayer = 1;
    private matchedPairs = 0;
    private totalPairs = 0;
    private gameFinished = false;

    /**
     * Initializes the food memory game.
     */
    init(): void {
        this.createCards();
        this.setupScore();
        this.setupWinnerPopup();
        this.setupWinnerButtons();
        this.setupExitPopup();
    }

    /**
     * Creates the selected number of food cards.
     */
    private createCards(): void {
        const container = document.querySelector<HTMLElement>(
            ".memory__card-container"
        );

        if (!container) return;

        const cardCount = Number(localStorage.getItem("cardCount")) || 16;
        container.dataset.cardCount = String(cardCount);
        this.totalPairs = cardCount / 2;

        const cards = this.buildCards();
        this.renderCards(cards, container);
    }

    /**
     * Creates all food card pairs.
     * @returns Array containing all food cards.
     */
    private buildCards(): Card[] {
        const cards: Card[] = [];

        for (let i = 1; i <= this.totalPairs; i++) {
            const image =
                `/public/assets/images/food card ${String(i).padStart(2, "0")}.png`;

            cards.push(new Card({ id: i, image }));
            cards.push(new Card({ id: i, image }));
        }

        return this.shuffleCards(cards);
    }

    /**
     * Shuffles all food cards.
     * @param cards Cards to shuffle.
     * @returns Shuffled cards.
     */
    private shuffleCards(cards: Card[]): Card[] {
        for (let i = cards.length - 1; i > 0; i--) {
            const randomIndex = Math.floor(Math.random() * (i + 1));

            [cards[i], cards[randomIndex]] = [
                cards[randomIndex],
                cards[i]
            ];
        }

        return cards;
    }

    /**
     * Renders all food cards into the container.
     * @param cards Cards to render.
     * @param container Card container.
     */
    private renderCards(cards: Card[], container: HTMLElement): void {
        cards.forEach((cardData) => {
            const cardElement = this.createCardElement(cardData);

            container.appendChild(cardElement);
            cardElement.addEventListener("click", () => {
                this.handleCardClick(cardData, cardElement);
            });
        });
    }

    /**
     * Creates the HTML element for a food card.
     * @param card Card object.
     * @returns HTML card element.
     */
    private createCardElement(card: Card): CardElement {
        const card = document.createElement("div");

        card.classList.add("memory__card");
        card.dataset.card = String(card.id);

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
                    style="--food-card: url('${card.image}');"
                ></div>
            </div>
        `;

        return card;
    }

    /**
     * Handles a card click.
     * @param card Selected card.
     * @param element Selected card element.
     */
    private handleCardClick(
        card: Card,
        element: CardElement
    ): void {
        if (this.isCardBlocked(card, element)) return;

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
     * @param card Selected card.
     * @param element Selected card element.
     * @returns True when the card cannot be selected.
     */
    private isCardBlocked(
        card: Card,
        element: CardElement
    ): boolean {
        return (
            this.gameFinished ||
            this.lockBoard ||
            card.isFlipped ||
            card.isMatched ||
            element === this.firstCardElement
        );
    }

    /**
     * Selects the first card.
     * @param card Selected card.
     * @param element Card element.
     */
    private selectFirstCard(
        card: Card,
        element: CardElement
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
        element: CardElement
    ): void {
        this.secondCard = card;
        this.secondCardElement = element;
    }

    /**
     * Checks whether the selected cards match.
     */
    private checkMatch(): void {
        if (!this.firstCard || !this.secondCard) return;

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
    private handleMatch(): void {
        if (!this.hasSelectedCards()) return;

        this.firstCard!.match();
        this.secondCard!.match();
        this.markCardsAsMatched();
        this.addPoint();
        this.matchedPairs++;
        this.resetBoard();
        this.checkGameWon();
    }

    /**
     * Checks whether both cards and elements exist.
     * @returns True when both cards are selected.
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
     * Marks both selected cards as matched.
     */
    private markCardsAsMatched(): void {
        this.firstCardElement?.classList.add("matched");
        this.secondCardElement?.classList.add("matched");
    }

    /**
     * Adds one point to the current player.
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
        this.updateScoreElement("#player1Score", this.player1Score);
        this.updateScoreElement("#player2Score", this.player2Score);
    }

    /**
     * Updates one score element.
     * @param selector Element selector.
     * @param score Score to display.
     */
    private updateScoreElement(
        selector: string,
        score: number
    ): void {
        const element = document.querySelector<HTMLElement>(selector);

        if (!element) return;

        element.textContent = String(score);
    }

    /**
     * Sets up the initial score.
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
        if (!this.hasSelectedCards()) return;

        this.firstCard!.isFlipped = false;
        this.secondCard!.isFlipped = false;

        this.removeFlippedClasses();
        this.switchPlayer();
        this.resetBoard();
    }

    /**
     * Removes the flipped class from both cards.
     */
    private removeFlippedClasses(): void {
        this.firstCardElement?.classList.remove("is-flipped");
        this.secondCardElement?.classList.remove("is-flipped");
    }

    /**
     * Changes to the other player.
     */
    private switchPlayer(): void {
        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
    }

    /**
     * Resets the selected cards.
     */
    private resetBoard(): void {
        this.firstCard = null;
        this.secondCard = null;
        this.firstCardElement = null;
        this.secondCardElement = null;
        this.lockBoard = false;
    }

    /**
     * Checks whether all pairs have been found.
     */
    private checkGameWon(): void {
        if (this.matchedPairs !== this.totalPairs || this.gameFinished) {
            return;
        }

        this.gameFinished = true;
        this.showWinnerPopup();
    }

    /**
     * Shows the winner popup.
     */
    private showWinnerPopup(): void {
        const winnerPopup = document.querySelector<HTMLElement>(
            "#winnerPopup"
        );

        if (!winnerPopup) return;

        this.updateWinnerPopup();
        winnerPopup.classList.add("is-visible");
    }

    /**
     * Sets up the winner popup observer.
     */
    private setupWinnerPopup(): void {
        const winnerPopup = document.querySelector<HTMLElement>(
            "#winnerPopup"
        );

        if (!winnerPopup) return;

        const observer = new MutationObserver(() => {
            if (winnerPopup.classList.contains("is-visible")) {
                this.updateWinnerPopup();
            }
        });

        observer.observe(winnerPopup, {
            attributes: true,
            attributeFilter: ["class"]
        });
    }

    /**
     * Updates the correct winner.
     */
    private updateWinnerPopup(): void {
        const blueWinner = document.querySelector<HTMLElement>(
            "#blueWinner"
        );
        const orangeWinner = document.querySelector<HTMLElement>(
            "#orangeWinner"
        );

        blueWinner?.classList.remove("is-visible");
        orangeWinner?.classList.remove("is-visible");

        if (this.player1Score > this.player2Score) {
            this.showOrangeWinner();
            return;
        }

        if (this.player2Score > this.player1Score) {
            this.showBlueWinner();
        }
    }

    /**
     * Shows the orange winner.
     */
    private showOrangeWinner(): void {
        const winner = document.querySelector<HTMLElement>(
            "#orangeWinner"
        );
        const score = document.querySelector<HTMLElement>(
            "#orangeWinnerScore"
        );

        if (score) {
            score.textContent = String(this.player1Score);
        }

        winner?.classList.add("is-visible");
    }

    /**
     * Shows the blue winner.
     */
    private showBlueWinner(): void {
        const winner = document.querySelector<HTMLElement>(
            "#blueWinner"
        );
        const score = document.querySelector<HTMLElement>(
            "#blueWinnerScore"
        );

        if (score) {
            score.textContent = String(this.player2Score);
        }

        winner?.classList.add("is-visible");
    }

    /**
     * Sets up the winner back buttons.
     */
    private setupWinnerButtons(): void {
        const blueButton = document.querySelector<HTMLElement>(
            "#blueBackHome"
        );
        const orangeButton = document.querySelector<HTMLElement>(
            "#orangeBackHome"
        );

        blueButton?.addEventListener("click", () => this.leaveGame());
        orangeButton?.addEventListener("click", () => this.leaveGame());
    }

    /**
     * Sets up the exit popup.
     */
    private setupExitPopup(): void {
        const exitButton = document.querySelector<HTMLElement>(
            ".gaming__header-right-part-exit-game"
        );
        const exitPopup = document.querySelector<HTMLElement>(
            "#exitPopup"
        );
        const popup = document.querySelector<HTMLElement>(".exit-popup");
        const backToGame = document.querySelector<HTMLElement>(
            "#backToGame"
        );
        const exitGame = document.querySelector<HTMLElement>("#exitGame");

        exitButton?.addEventListener("click", () => {
            this.openExitPopup(exitPopup);
        });

        backToGame?.addEventListener("click", () => this.leaveGame());

        exitGame?.addEventListener("click", () => {
            this.closeExitPopup(exitPopup);
        });

        exitPopup?.addEventListener("click", (event: MouseEvent) => {
            this.handlePopupClick(event, popup, exitPopup);
        });
    }

    /**
     * Handles clicks outside the exit popup.
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
     * Opens the exit popup.
     * @param popup Exit popup element.
     */
    private openExitPopup(popup: HTMLElement | null): void {
        if (!popup) return;

        popup.classList.remove("is-closing");
        popup.classList.add("is-visible");
    }

    /**
     * Closes the exit popup.
     * @param popup Exit popup element.
     */
    private closeExitPopup(popup: HTMLElement | null): void {
        if (!popup) return;

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
        window.location.href = "/settings.html";
    }
}

const game = new MemoryGame();
game.init();

