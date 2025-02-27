# Overview
This rock, paper, scissors repository represents a game built with a FastAPI (Python) backend and a React.js (JavaScript) frontend.
The main objective of this repository was to allow two players to enter their names and take turns to choose either rock, paper, or scissor to play against each other.
Currently, the game is played in the same browser and the players are notified who won and the overall scores are incremented.
Each game is saved into the game_state.json file, which acts as a database to keep record of the previously played games and their overall scores.

# Running The Code
1. git clone this repository.
2. After cloning the repo, cd into the backend folder.
3. Run `uvicorn main:app --reload`
4. After the backend is running successfully, open a new terminal and cd into the frontend folder.
5. Run `npm install`
6. Run `npm start`
7. Go to `localhost:3000` and you should be able to see the UI for the app.

# How The Game Works
1. Player 1 enters a name.
2. Player 2 enters a name (in the same browser).
4. Player 1 chooses either rock, paper, or scissor.
5. Player 2 chooses either rock, paper, or scissor.
6. The winner will appear on the screen along with the overall scores of both players.
7. Game restarts with it being Player 1's turn and the overall scores of both players are persisted in the game_state.json file.

# Improvements
1. I could add a button/option for Player 1 to play against a computer and have the computer randomly choose rock, paper, or scissor.
2. Can integrate a database to persist the overall scores along with the two player's name.
3. Can add 2 buttons: Play Again and Quit Game. The purpose of the Play Again button is so that the players have control of whether or not they want to continue playing. If so, then store their overall scores and their names. The purpose of the Quit Game button is to end the game, save the players overall score, and save their names.
4. Implement subsequent game play, such as another pair of players can play and save their overall scores and names, or if the same players exist in the game_state.json file/database, then continue using their old scores.
5. Expand the game play to be able to play with two players on two different browsers (via WebSockets) and get real time interaction.
6. Can implement multiple ongoing games using multithreading and asynchronous processes.
7. The Frontend UI can be more refined and styled, such as implementing animations and Three.js to mimic a rock, paper, and scissor.
