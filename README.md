# Yaroslav AI

Developed by **Yarik Studio**.

This is a custom AI chat application named "Yaroslav AI". It operates using a free API key from OpenRouter to provide responses.

---

## Roadmap & TODO

This file outlines the necessary improvements and features to be implemented.

### Backend & Security
- [ ] **Move API Key to a Server:** The OpenRouter API key is currently exposed on the front-end. It must be moved to a secure backend server (e.g., in a `server.js` file) or a serverless function to protect it from being compromised.

### AI Behavior & Prompts
- [ ] **Enforce Strict Language Output:**
    - If the user selects **Russian**, the AI must always respond in Russian and correct the user's grammar.
    - If the user selects **English**, the AI must always respond in English.
- [ ] **Integrate User Context:** The AI must actively use the information provided in the "What should AI call you?" and "About you (≤444 chars)" fields to personalize its responses.
- [ ] **Optimize Token Usage:** The AI should be configured to use fewer tokens in its responses to improve efficiency, without decreasing the quality of the answers.
- [ ] **Adjust "Fast Mode":** The "Fast Mode" should be modified to provide *shorter* and quicker answers, contrary to its current verbose implementation.
- [ ] **Limit Message Frequency:** Prevent users from sending messages more frequently than once every 10 seconds.
- [ ] **Limit Dialogue Length:** Implement a maximum number of messages per conversation to manage context and cost.

### User Interface & Experience
- [ ] **Mandatory Onboarding Screen:**
    - For a first-time user, a non-closable welcome screen must appear.
    - This screen will require the user to:
        1.  Set their name (max 30 characters).
        2.  Provide information in the "About you" field (max 444 characters).
        3.  Select an interface language.
        4.  Select a theme (Light, Dark, Auto).
    - The screen should clearly state the name of the application: **Yaroslav AI**.
- [ ] **Display AI Logo:** The `img/logo (dark).svg` image must appear to the left of the "Yaroslav AI" name on every message sent by the AI.
- [ ] **Copy Message Toast:** Show a toast notification (e.g., "Copied!") when a user copies a message.
- [ ] **Theme Switcher:**
    - Add a theme switcher to the settings with "Light theme", "Dark theme", and "Auto" options.
    - The default theme should be "Auto".
    - The theme switcher should also be available on the initial onboarding screen.
- [ ] **Stop Generation Button:** Add a button that allows the user to stop the AI while it is generating a response.
