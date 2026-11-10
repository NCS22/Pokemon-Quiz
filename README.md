# Pokémon Quiz

A small Pokémon quiz built as a personal learning project.

The goal of the project is to experiment with **React**, **Tailwind CSS**, and different approaches to **Artificial Intelligence and classification algorithms** while building something fun and interactive.

## 🚀 Getting Started

### Prerequisites

Make sure you have **Node.js** and **npm** installed on your machine.

You can check your versions with:

```bash
node --version
npm --version
```

### Installation

Clone the repository and install the project dependencies:

```bash
git clone https://github.com/NCS22/Pokemon-Quiz.git
cd Pokemon-Quiz
npm install
```

### Run the application

Start the Vite development server:

```bash
npm run dev
```

Vite will provide a local URL, usually:

```text
http://localhost:5173/
```

Open it in your browser and you're ready to play.

### Enable the AI result

The final Pokémon is chosen by Claude through a serverless function (`api/predecir.js`), so the API key never reaches the browser. Without it the app still works, falling back to the local algorithm.

1. Copy `.env.example` to `.env.local` and set `ANTHROPIC_API_KEY` (never use a `VITE_` prefix).
2. Run `npm run dev`: the Vite dev server also serves `/api/predecir` locally, so the Vercel CLI is not needed.
3. In production, set the same variable in the Vercel project settings.

Useful scripts: `node scripts/alcanzabilidad.mjs` checks which Pokémon the fallback can reach, and `node --env-file=.env.local scripts/eval-ia.mjs` measures the diversity of the AI's answers (it calls the API).

### Build for production

To create a production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

---

## 🎮 About the Project

Pokémon Quiz is a small side project created mainly for learning and experimentation.

The project was developed to practice:

* **React** for building the user interface and managing the application logic.
* **Tailwind CSS** for styling the application.
* **Artificial Intelligence models** to experiment with decision trees and Pokémon classification.
* **k-Nearest Neighbors (kNN)** to determine which Pokémon best matches the player's answers and the resulting attributes.

The project is not intended to be a scientifically accurate personality test. The Pokémon selection is based on a combination of Pokémon statistics and manually designed heuristics.

---

## 🤖 How Does the Pokémon Classification Work?

The quiz converts the player's answers into five different attributes:

* **AG — Aggressiveness**
* **EN — Energy / Impulsiveness**
* **RE — Resilience**
* **SO — Sociability**
* **CU — Curiosity**

These attributes are then used as the basis for the Pokémon classification.

The project uses a **decision tree** to structure the quiz and determine the resulting personality profile. The resulting attributes are subsequently compared against Pokémon data using the **k-Nearest Neighbors (kNN)** algorithm to find the Pokémon whose characteristics are closest to the player's profile.

### Attribute Calculation

The attributes are calculated using Pokémon statistics combined with heuristic rules:

| Attribute | Calculation                                                                                       |
| --------- | ------------------------------------------------------------------------------------------------- |
| **AG**    | Based mainly on Attack and Special Attack, with bonuses and penalties depending on Pokémon types. |
| **EN**    | Based directly on Speed.                                                                          |
| **RE**    | Based on Defense, Special Defense and HP.                                                         |
| **SO**    | Based on Pokémon families, evolution chains and type-based social heuristics.                     |
| **CU**    | Based on a heuristic related to exploration and territoriality.                                   |

### Detailed Heuristics

**AG — Aggressiveness**

Calculated from normalized **Attack + Special Attack**. Offensive types such as Fighting, Fire, Dragon, Dark, Poison and Ghost receive additional weight, while more passive types receive penalties.

**EN — Energy / Impulsiveness**

Calculated primarily from normalized **Speed**.

**RE — Resilience**

Calculated from normalized **Defense + Special Defense + HP**.

**SO — Sociability**

A heuristic based on Pokémon families and types. Pokémon with longer evolution chains and types such as Normal, Bug and Water tend to receive higher scores, while Ghost, Dragon, Legendary and more solitary Pokémon receive lower scores.

**CU — Curiosity**

A heuristic based on the inverse of territoriality. Psychic, Bug and Electric Pokémon tend to score higher, while Rock, Ground and Steel Pokémon tend to score lower due to their more static or territorial characteristics.

---

## 🧠 Why This Project?

This project started as a small experiment and a way to learn by building something rather than just studying the technologies theoretically.

The main goal was to get hands-on experience with **React**, **Tailwind CSS**, and basic concepts related to **machine learning and AI**, while creating something enjoyable around Pokémon.

The classification system is intentionally experimental and should be considered a **learning exercise rather than a scientifically validated model**.

---

## 🛠️ Technologies

* React
* Vite
* Tailwind CSS
* JavaScript
* k-Nearest Neighbors (kNN)
* Decision Trees
* Pokémon data

---

## 📌 Disclaimer

This is an independent fan-made project created for educational and recreational purposes.

Pokémon and all related characters, names and assets are property of their respective owners.
