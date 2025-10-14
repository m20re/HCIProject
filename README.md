# HCIProject
Group project for UNO class CSCI4970

##### How to set up the python environment.

1) Ensure that git is installed in your system. verify in your terminal with 
    "git --version"

2) Python 3.12.0 is being used in this project, make sure it is installed.
    "python3 --version" or "python -V"(Windows)

3) Clone the repository using this command: 
`git clone https://github.com/m20re/HCIProject.git`


4) `cd` into the src directory: "cd HCIProject/src"

5) Install all required dependencies:
    `pip install -r requirements.txt`

6) Apply database migrations:
    `python manage.py migrate`

7) Run this command to start the program: 

    python3 manage.py runserver 
    (use "python manage.py runserver" if python3 doesn't work)

8) Open the local host connection (preferably on CHROME) on any browser : http://127.0.0.1:8000

** To terminate the program hit ctrl+C or command+C

** Each time you make any change reload the page on chrome and it should show the updated version.

That should be it for now.