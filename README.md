# HCI Project
Used Lithium template for Django: https://github.com/wsvincent/lithium.git

## Prerequisites
To modify the audio ffmpeg is **required** for this program.

To install ffmpeg:
- (Windows) Run the following command within cmd: `winget install ffmpeg`
- (MacOS/Linux) Run the following command: `sudo apt update && sudo apt install ffmpeg`

Verify that FFMPEG works by opening a new terminal and type `ffmpeg -version`. This project uses version 8.0.

## Project Setup
1. Ensure that git is installed in your system. verify in your terminal with `git --version`
2. For this project we are using Python 3.12.X, ensure it is installed with: `python3 --verion` or `py --version` on Windows.
3. Clone the repository using this command: `git clone https://github.com/m20re/HCIProject.git`
4. Go into the project directory `cd {project_name_here}`
5. Create a new virtual environment `python3 -m venv .venv` or `py -m venv .venv`. This command will create a `.venv/` folder.
6. In the same directory activate the virtual environment `.venv/Scripts/Activate`
7. You should see `(.venv)` within the terminal.
8. Install all required dependencies `pip install -r requirements.txt`
9. Copy `.env.example` and create a new file titles `.env`
10. Generate a new SECRET_KEY and add it to the .env file
11. (Optional) Apply relevant database migrations: `python manage.py migrate`
12. Run `python3 manage.py runserver` or `python manage.py runserver` to start the app.
13. Open the localhost connection (preferably on CHROME) within a web browser: `http://127.0.0.1:8000`. 
14. You can terminate the program anytime with `CTRL + C` or `CMD + C`.

## Milestones
