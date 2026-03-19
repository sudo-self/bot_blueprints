##  Telegram Bot Blueprints
### <a href="https://bot-blueprints.vercel.app">bot-blueprints</a>


<img width="1512" height="823" alt="Screenshot 2026-03-18 at 19 42 40" src="https://github.com/user-attachments/assets/480d17d4-19b8-4ed7-87a9-37a7d4629824" />

## Prerequisites
- Python 3.8 or higher installed.
- Python: https://www.python.org/downloads/
## Setup & Launch

### macOS / Linux (Quick Start)
1. Open terminal in this folder.
2. Run the start script:
   ```bash
   chmod +x startbot.sh
   ./startbot.sh
   ```

### macOS / Linux (Manual)
1. Open terminal in this folder.
2. Create virtual environment:
   ```bash
   python3 -m venv venv
   ```
3. Activate environment:
   ```bash
   source venv/bin/activate
   ```
4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Start the bot:
   ```bash
   python3 bot.py
   ```

### Windows
1. Open PowerShell or Command Prompt in this folder.
2. Create virtual environment:
   ```powershell
   python -m venv venv
   ```
3. Activate environment:
   ```powershell
   .\venv\Scripts\activate
   ```
4. Install dependencies:
   ```powershell
   pip install -r requirements.txt
   ```
5. Start the bot:
   ```powershell
   python bot.py
   ```

## Commands
- /list: ls -lh ./storage
- /space: du -sh ./storage
