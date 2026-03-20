# 🤖 LLM Matcher

> **Find your LLM model soulmate for your hardware.**

An intelligent system diagnostic tool that probes your hardware configuration (CPU, GPU, RAM) and uses Google's Gemini AI to recommend the most optimal Hugging Face LLM models for your specific setup.

![App Screenshot](./screenshot.png)

## ✨ Features

- **Hardware Probing:** Real-time detection of system specifications (CPU cores, RAM, GPU availability).
- **AI-Powered Recommendations:** Leverages Gemini 3.1 Flash to analyze hardware constraints and suggest compatible models.
- **Use Case Optimization:** Tailor recommendations for General Chat, Coding, or Image/Video generation.
- **Quantization Awareness:** Recommends specific quantization levels (4-bit, 8-bit, etc.) based on available VRAM/RAM.
- **Modern UI:** A sleek, dark-themed "Technical Dashboard" aesthetic built with Tailwind CSS and Motion.

## 🛠️ Tech Stack

- **Frontend:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite 6](https://vitejs.dev/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **AI Engine:** [@google/genai](https://ai.google.dev/) (Gemini 3.1 Flash)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Animations:** [Motion](https://motion.dev/)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Google Gemini API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/hardware-llm-recommender.git
   cd hardware-llm-recommender
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open the app:**
   Navigate to `http://localhost:3000` in your browser.

## 📖 Usage

1. **System Diagnostics:** The app will automatically attempt to detect your hardware specs. You can manually adjust them if needed.
2. **Primary Objective:** Select your intended use case (e.g., General Chat, Coding).
3. **Get Recommendations:** Click the "Analyze Hardware" button.
4. **Explore Models:** Browse the AI-curated list of Hugging Face models, complete with reasoning and performance expectations.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ using [AI Studio Build](https://ai.studio/build)
