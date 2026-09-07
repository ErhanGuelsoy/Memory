import "./styles/style.scss";
import "./styles/settings-page.scss";

init();

/**
 * Initializes the settings page.
 */
function init(): void {
    setupThemeSelection();
    setupThemePreview();
    setupCardSelection();
    setupStartButton();
}

/**
 * Sets up the theme selection.
 */
function setupThemeSelection(): void {
    const themes =
        document.querySelectorAll<HTMLElement>(
            "[data-theme]"
        );

    themes.forEach((theme: HTMLElement) => {
        theme.addEventListener(
            "click",
            () => selectTheme(theme)
        );
    });
}

/**
 * Stores the selected theme.
 */
function selectTheme(theme: HTMLElement): void {
    const selectedTheme =
        theme.dataset.theme;

    if (!selectedTheme) {
        return;
    }

    localStorage.setItem(
        "selectedTheme",
        selectedTheme
    );
}

/**
 * Sets up the board size selection.
 */
function setupCardSelection(): void {
    const cardOptions =
        document.querySelectorAll<HTMLElement>(
            "[data-cards]"
        );

    cardOptions.forEach(
        (option: HTMLElement) => {
            option.addEventListener(
                "click",
                () => selectCardCount(option)
            );
        }
    );
}

/**
 * Stores the selected board size.
 */
function selectCardCount(
    option: HTMLElement
): void {
    const cardCount =
        option.dataset.cards;

    if (!cardCount) {
        return;
    }

    localStorage.setItem(
        "cardCount",
        cardCount
    );
}

/**
 * Sets up the theme preview.
 */
function setupThemePreview(): void {
    const themes =
        document.querySelectorAll<HTMLElement>(
            "[data-theme]"
        );

    const preview =
        document.querySelector<HTMLImageElement>(
            ".game__component-container img"
        );

    if (!preview) {
        return;
    }

    themes.forEach((theme: HTMLElement) => {
        theme.addEventListener(
            "mouseenter",
            () => updatePreview(theme, preview)
        );
    });
}

/**
 * Updates the preview image.
 */
function updatePreview(
    theme: HTMLElement,
    preview: HTMLImageElement
): void {
    const themeName =
        theme.dataset.theme;

    if (themeName === "code-vibes") {
        preview.src =
            "/assets/images/Frame 629.png";
    }

    if (themeName === "foods") {
        preview.src =
            "/assets/images/food_frame.png";
    }
}

/**
 * Sets up the start button.
 */
function setupStartButton(): void {
    const startButton =
        document.querySelector<HTMLButtonElement>(
            "#start-button"
        );

    if (!startButton) {
        return;
    }

    startButton.addEventListener(
        "click",
        navigateToGame
    );
}

/**
 * Navigates to the selected game.
 */
function navigateToGame(): void {
    const selectedTheme =
        localStorage.getItem("selectedTheme");

    if (!localStorage.getItem("cardCount")) {
        localStorage.setItem(
            "cardCount",
            "16"
        );
    }

    if (selectedTheme === "foods") {
        window.location.href =
            "/food-theme.html";
        return;
    }

    if (
        selectedTheme === "gaming" ||
        selectedTheme === "code-vibes" ||
        selectedTheme === "da-projects"
    ) {
        window.location.href =
            "/gaming-theme.html";
        return;
    }

    window.location.href =
        "/gaming-theme.html";
}