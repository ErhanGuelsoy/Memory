import "./styles/style.scss";
import "./styles/settings-page.scss";

/**
 * Updates the selected theme.
 * @param theme Selected theme element.
 * @param themes All theme elements.
 */
function selectTheme(
    theme: HTMLElement,
    themes: NodeListOf<HTMLElement>
): void {
    themes.forEach((item) =>
        item.classList.remove("is-selected")
    );
    theme.classList.add("is-selected");
    localStorage.setItem(
        "selectedTheme",
        theme.dataset.theme || "code-vibes"
    );
}

/**
 * Updates the preview image.
 * @param theme Selected theme element.
 * @param preview Preview image element.
 */
function updatePreview(
    theme: HTMLElement,
    preview: HTMLImageElement
): void {
    const themeName = theme.dataset.theme;
    const baseUrl = import.meta.env.BASE_URL;

    if (themeName === "code-vibes") {
        preview.src =
            `${baseUrl}assets/images/Frame 629.png`;
        preview.alt = "Code Vibes game preview";
        return;
    }

    if (themeName === "foods") {
        preview.src =
            `${baseUrl}assets/images/food_frame.png`;
        preview.alt = "Foods game preview";
    }
}

/**
 * Selects the player.
 * @param player Selected player element.
 * @param players All player elements.
 */
function selectPlayer(
    player: HTMLElement,
    players: NodeListOf<HTMLElement>
): void {
    players.forEach((item) =>
        item.classList.remove("is-selected")
    );
    player.classList.add("is-selected");
    localStorage.setItem(
        "selectedPlayer",
        player.dataset.player || "blue"
    );
}

/**
 * Selects the board size.
 * @param cards Selected board size element.
 * @param cardOptions All board size elements.
 */
function selectBoardSize(
    cards: HTMLElement,
    cardOptions: NodeListOf<HTMLElement>
): void {
    cardOptions.forEach((item) =>
        item.classList.remove("is-selected")
    );
    cards.classList.add("is-selected");
    localStorage.setItem(
        "cardCount",
        cards.dataset.cards || "16"
    );
}

/**
 * Finds the selected theme.
 * @param themes Theme elements.
 * @param selectedTheme Saved theme.
 * @returns Selected theme element.
 */
function findTheme(
    themes: NodeListOf<HTMLElement>,
    selectedTheme: string
): HTMLElement | undefined {
    return Array.from(themes).find(
        (item) => item.dataset.theme === selectedTheme
    );
}

/**
 * Finds the selected player.
 * @param players Player elements.
 * @param selectedPlayer Saved player.
 * @returns Selected player element.
 */
function findPlayer(
    players: NodeListOf<HTMLElement>,
    selectedPlayer: string
): HTMLElement | undefined {
    return Array.from(players).find(
        (item) => item.dataset.player === selectedPlayer
    );
}

/**
 * Finds the selected board size.
 * @param cardOptions Board size elements.
 * @param cardCount Saved card count.
 * @returns Selected board size element.
 */
function findCards(
    cardOptions: NodeListOf<HTMLElement>,
    cardCount: string
): HTMLElement | undefined {
    return Array.from(cardOptions).find(
        (item) => item.dataset.cards === cardCount
    );
}

/**
 * Applies the selected theme.
 * @param theme Selected theme element.
 * @param preview Preview image.
 */
function applyTheme(
    theme: HTMLElement | undefined,
    preview: HTMLImageElement
): void {
    if (!theme) return;
    theme.classList.add("is-selected");
    updatePreview(theme, preview);
}

/**
 * Applies the selected player.
 * @param player Selected player element.
 */
function applyPlayer(player: HTMLElement | undefined): void {
    if (player) {
        player.classList.add("is-selected");
    }
}

/**
 * Applies the selected board size.
 * @param cards Selected board size element.
 */
function applyCards(cards: HTMLElement | undefined): void {
    if (cards) {
        cards.classList.add("is-selected");
    }
}

/**
 * Loads the saved settings.
 * @param themes Theme elements.
 * @param players Player elements.
 * @param cardOptions Board size elements.
 * @param preview Preview image.
 */
function loadSettings(
    themes: NodeListOf<HTMLElement>,
    players: NodeListOf<HTMLElement>,
    cardOptions: NodeListOf<HTMLElement>,
    preview: HTMLImageElement
): void {
    const themeName =
        localStorage.getItem("selectedTheme") || "code-vibes";
    const playerName =
        localStorage.getItem("selectedPlayer") || "blue";
    const cardCount =
        localStorage.getItem("cardCount") || "16";

    applyTheme(findTheme(themes, themeName), preview);
    applyPlayer(findPlayer(players, playerName));
    applyCards(findCards(cardOptions, cardCount));
}

/**
 * Starts the selected game.
 */
function startGame(): void {
    const theme =
        localStorage.getItem("selectedTheme") || "code-vibes";
    const baseUrl = import.meta.env.BASE_URL;

    if (theme === "foods") {
        window.location.href =
            `${baseUrl}food-theme.html`;
        return;
    }

    window.location.href =
        `${baseUrl}gaming-theme.html`;
}

/**
 * Sets up one theme event.
 * @param theme Theme element.
 * @param themes All theme elements.
 * @param preview Preview image.
 */
function setupThemeEvent(
    theme: HTMLElement,
    themes: NodeListOf<HTMLElement>,
    preview: HTMLImageElement
): void {
    theme.addEventListener("click", () => {
        selectTheme(theme, themes);
        updatePreview(theme, preview);
    });
}

/**
 * Sets up theme events.
 * @param themes Theme elements.
 * @param preview Preview image.
 */
function setupThemeEvents(
    themes: NodeListOf<HTMLElement>,
    preview: HTMLImageElement
): void {
    themes.forEach((theme) =>
        setupThemeEvent(theme, themes, preview)
    );
}

/**
 * Sets up one player event.
 * @param player Player element.
 * @param players All player elements.
 */
function setupPlayerEvent(
    player: HTMLElement,
    players: NodeListOf<HTMLElement>
): void {
    player.addEventListener(
        "click",
        () => selectPlayer(player, players)
    );
}

/**
 * Sets up player events.
 * @param players Player elements.
 */
function setupPlayerEvents(
    players: NodeListOf<HTMLElement>
): void {
    players.forEach((player) =>
        setupPlayerEvent(player, players)
    );
}

/**
 * Sets up one board size event.
 * @param cards Board size element.
 * @param cardOptions All board size elements.
 */
function setupBoardEvent(
    cards: HTMLElement,
    cardOptions: NodeListOf<HTMLElement>
): void {
    cards.addEventListener(
        "click",
        () => selectBoardSize(cards, cardOptions)
    );
}

/**
 * Sets up board size events.
 * @param cardOptions Board size elements.
 */
function setupBoardEvents(
    cardOptions: NodeListOf<HTMLElement>
): void {
    cardOptions.forEach((cards) =>
        setupBoardEvent(cards, cardOptions)
    );
}

/**
 * Initializes the settings page.
 */
function init(): void {
    const themes =
        document.querySelectorAll<HTMLElement>("[data-theme]");
    const players =
        document.querySelectorAll<HTMLElement>("[data-player]");
    const cardOptions =
        document.querySelectorAll<HTMLElement>("[data-cards]");
    const preview =
        document.querySelector<HTMLImageElement>(
            ".game__component-container img"
        );
    const startButton =
        document.querySelector<HTMLButtonElement>(
            "#start-button"
        );

    if (!preview || !startButton) return;

    setupThemeEvents(themes, preview);
    setupPlayerEvents(players);
    setupBoardEvents(cardOptions);
    startButton.addEventListener("click", startGame);
    loadSettings(themes, players, cardOptions, preview);
}

init();