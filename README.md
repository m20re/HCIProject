# HCI Project
Used Lithium template for Django: https://github.com/wsvincent/lithium.git

## Prerequisites
To convert the audio into its respective format ffmpeg is used.

(Windows) Download it here: https://ffmpeg.org/
- Once installed, unzip it in a convinient location.
- Add that location within your PATH (environmental variables)

(MacOS/Linux) Run the following command: `sudo apt update && sudo apt install ffmpeg`

To verify is FFMPEG works, open a terminal and type `ffmpeg -version`. We are using version 8.0

## How to set up the project
1. Ensure that git is installed in your system. verify in your terminal with `git --version`

2. For this project we are using Python 3.12.X, ensure it is installed with: `python3 --verion` or `py --version` on Windows.

3. Clone the repository using this command: `git clone https://github.com/m20re/HCIProject.git`

4. Go into the project directory `cd {project_name_here}`

5. Create a new virtual environment `python3 -m venv .venv`. This will create a `.venv/` folder

6. In the same directory activate the virtual environment `.venv/Scripts/activate`

7. You should see `(.venv)` within the terminal.

8. Install all required dependencies `pip install -r requirements.txt`

9. *Create* a new `.env` file for safety.

10. Apply relevant database migrations: `python manage.py migrate`

11. Run this command to start the program: `python3 manage.py runserver` or `python manage.py runserver` if python3 doesn't work.

12. Open the local host connection (preferably on CHROME) on any browser : `http://127.0.0.1:8000`. 

13. You can terminate the program anytime with `CTRL + C` or `CMD + C`.

#### Transcript Testing

While the server is running go to `http://127.0.0.1:8000/translate/`. From here, you should be able to speak into the mic and get an output.

To see the map go to the: `http://127.0.0.1:8000/map` to access the map.
