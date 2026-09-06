
import "./styles/style.scss";
import "./styles/settings-page.scss";

init();

/**
 * Initializes the settings page.
 */
function init(): void {
    setupThemeSelection();
    setupThemePreview();
    setupStartButton();
}

/**
 * Sets up the theme selection.
 */
function setupThemeSelection(): void {
    const themes = document.querySelectorAll<HTMLElement>("[data-theme]");

    themes.forEach((theme) => {
        theme.addEventListener("click", () => {
            selectTheme(theme);
        });
    });
}

/**
 * Stores the selected theme.
 */
function selectTheme(theme: HTMLElement): void {
    const selectedTheme = theme.dataset.theme;

    if (!selectedTheme) {
        return;
    }

    localStorage.setItem("selectedTheme", selectedTheme);
}

/**
 * Sets up the preview image.
 */
function setupThemePreview(): void {
    const themes = document.querySelectorAll<HTMLElement>("[data-theme]");
    const preview = document.querySelector<HTMLImageElement>(
        ".game__component-container img"
    );

    if (!preview) {
        return;
    }

    themes.forEach((theme) => {
        theme.addEventListener("mouseenter", () => {
            updatePreview(theme, preview);
        });
    });
}

/**
 * Updates the preview image.
 */
function updatePreview(
    theme: HTMLElement,
    preview: HTMLImageElement
): void {
    const themeName = theme.dataset.theme;

    if (themeName === "code-vibes") {
        preview.src = "/public/assets/images/Frame 629.png";
    }

    if (themeName === "foods") {
        preview.src = "/public/assets/images/food_frame.png";
    }
}

/**
 * Sets up the start button.
 */
function setupStartButton(): void {
    const startButton = document.getElementById("start-button");

    if (!startButton) {
        return;
    }

    startButton.addEventListener("click", navigateToGame);
}

/**
 * Navigates to the selected game theme.
 */
function navigateToGame(): void {
    const selectedTheme = localStorage.getItem("selectedTheme");

    if (selectedTheme === "code-vibes") {
        window.location.href = "/gaming-page.html";
        return;
    }

    if (selectedTheme === "foods") {
        window.location.href = "/food-theme.html";
        return;
    }

    if (selectedTheme === "gaming") {
        window.location.href = "/gaming-theme.html";
        return;
    }

    if (selectedTheme === "da-projects") {
        window.location.href = "/gaming-page.html";
        return;
    }

    window.location.href = "/gaming-page.html";
}

