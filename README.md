# HCIProject
Group project for UNO class CSCI4970

##### How to set up the python environment.

1) Ensure that git is installed in your system.
2) Python 3.12.10 is *currently* being used in this project, make sure it is installed.
3) Clone the repository using this command: 
`git clone https://github.com/m20re/HCIProject#`
4) `cd` into the newly cloned repository and run this command to make a virtual environment.
`python -m venv venv`
5) Activate the virtual environment within powershell (assumes you are still in the project directory):
`.\venv\Scripts\activate`
6) Install necessary packages by running this command:
`pip install -r requirements.txt`
7) If you add more packages make sure to update requirements.txt
`pip freeze > requirements.txt`

That should be it for now.