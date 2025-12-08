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
### Milestone 1
In this milestone, the general direction and overall idea of how the program will look like was established.

#### Major Changes
- Imported `lithium`, an opionontaed "scaffolding" for quick-start.
- Created new `translator` app within Django to hold translation API logic
- Added faster_whisper Python package to transcribe speech.
- Added simple HTML test page for testing.

### Milestone 2
This milestone reflects further development in app functionality and establishing the front-end.

#### Major Changes
- Added translation functionality using `googletrans` package.
- Updated testing UI to reflect TL portion of the code
- Added and updated the front-end map UI to use translation code
- Further Updates to the UI to extend functionality
- Added new package `gTTS` for reading out the translated text
- Added automatic translation after a period of time after loading the page

### Milestone 3
This milestone was focused on making the UI experiences more seamless by fixing bugs and adding new features.

#### Major Changes
- Map UI now displays languages and countries
- Added map-clicking functionality along with language switching

#### Bug Fixes
- Changed `googleTrans` to `deep-translate` to avoid asynch/synch execution issues

### Milestone 4
This milestone adds the final touches and small advancements on the program.

#### Changes
- Added voice commands
- Added small instructions within the program
