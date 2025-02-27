from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GAME_STATE_FILE = "game_state.json"

CHOICES = ["rock", "paper", "scissors"]

class StartGameRequest(BaseModel):
    player1: str

class SecondPlayerRequest(BaseModel):
    player2: str

class PlayRoundRequest(BaseModel):
    player: str
    choice: str

def load_game_state():
    try:
        with open(GAME_STATE_FILE, "r") as file:
            return json.load(file)
    except (FileNotFoundError, json.JSONDecodeError):
        return {
            "player1": "",
            "player2": "",
            "scores": {"player1": 0, "player2": 0},
            "rounds": [],
            "turn": "player1",
            "choices": {},
            "gameStarted": False
        }

def save_game_state(state):
    with open(GAME_STATE_FILE, "w") as file:
        json.dump(state, file, indent=4)

@app.post("/api/start")
def start_game(request: StartGameRequest):
    game_state = {
        "player1": request.player1,
        "player2": "",
        "scores": {"player1": 0, "player2": 0},
        "rounds": [],
        "turn": "player1",
        "choices": {},
        "gameStarted": False
    }
    save_game_state(game_state)
    return {"message": "Player 1 registered. Waiting for Player 2.", "game_state": game_state}

@app.post("/api/join")
def join_game(request: SecondPlayerRequest):
    game_state = load_game_state()
    
    if not game_state["player1"]:
        raise HTTPException(status_code=400, detail="Game not started. Player 1 must start the game first.")
    
    if game_state["player2"]:
        raise HTTPException(status_code=400, detail="Game already has two players.")
    
    game_state["player2"] = request.player2
    game_state["gameStarted"] = True
    game_state["turn"] = "player1"

    save_game_state(game_state)

    return {
        "message": f"Player 2 ({request.player2}) joined. Player 1 starts the round.",
        "game_state": game_state
    }

@app.post("/api/play")
def play_round(request: PlayRoundRequest):
    game_state = load_game_state()

    if not game_state["gameStarted"]:
        raise HTTPException(status_code=400, detail="Game has not started yet.")

    if request.player not in [game_state["player1"], game_state["player2"]]:
        raise HTTPException(status_code=400, detail="Invalid player.")

    if request.player == game_state["player1"] and game_state["turn"] != "player1":
        raise HTTPException(status_code=400, detail="Not Player 1's turn.")
    
    if request.player == game_state["player2"] and game_state["turn"] != "player2":
        raise HTTPException(status_code=400, detail="Not Player 2's turn.")

    if request.choice not in CHOICES:
        raise HTTPException(status_code=400, detail="Invalid choice. Choose 'rock', 'paper', or 'scissors'.")

    game_state["choices"][request.player] = request.choice

    # Switch turns
    if game_state["turn"] == "player1":
        game_state["turn"] = "player2"
    else:
        # Both players have chosen and pick the winner
        choice1 = game_state["choices"].get(game_state["player1"])
        choice2 = game_state["choices"].get(game_state["player2"])

        if not choice1 or not choice2:
            raise HTTPException(status_code=400, detail="Both players must choose before determining the winner.")

        winner = determine_winner(choice1, choice2)

        if winner == "player1":
            game_state["scores"]["player1"] += 1
        elif winner == "player2":
            game_state["scores"]["player2"] += 1

        game_state["rounds"].append({
            "player1": choice1,
            "player2": choice2,
            "winner": winner
        })

        # Reset for next round
        game_state["choices"] = {}
        game_state["turn"] = "player1"

    save_game_state(game_state)
    return {
        "message": f"{request.player} chose {request.choice}.",
        "turn": game_state["turn"],
        "scores": game_state["scores"]
    }

@app.get("/api/state")
def get_game_state():
    return load_game_state()

def determine_winner(choice1, choice2):
    if choice1 == choice2:
        return "tie"
    if (choice1 == "rock" and choice2 == "scissors") or \
       (choice1 == "paper" and choice2 == "rock") or \
       (choice1 == "scissors" and choice2 == "paper"):
        return "player1"
    return "player2"