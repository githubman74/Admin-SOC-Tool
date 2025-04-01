import json
import asyncio
import time
import uvicorn
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import socket
import os

app = FastAPI()

# Enable CORS for frontend access
origins = ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PERSISTENCE_FILE = "agents.json"

# In-memory storage for pending and approved agents and tokens
pending_agents = {}      # {hostname: ip_address}
approved_agents = {}     # {hostname: ip_address}
agent_tokens = {}        # {hostname: token}

# Global variable to store the latest metrics received from agents
latest_metrics = {}

all_metrics = {}

# ================== PERSISTENCE FUNCTIONS ==================
def load_persistence():
    global approved_agents, agent_tokens
    if os.path.exists(PERSISTENCE_FILE):
        try:
            with open(PERSISTENCE_FILE, "r") as f:
                content = f.read().strip()
                if not content:
                    # File is empty – initialize empty data
                    approved_agents = {}
                    agent_tokens = {}
                    print("[PERSISTENCE] No data found; starting fresh.")
                else:
                    data = json.loads(content)
                    approved_agents = data.get("approved_agents", {})
                    agent_tokens = data.get("agent_tokens", {})
                    print("[PERSISTENCE] Loaded approved agents and tokens.")
        except json.JSONDecodeError:
            print("[PERSISTENCE] Error decoding JSON; using empty data.")
            approved_agents = {}
            agent_tokens = {}


def save_persistence():
    data = {
        "approved_agents": approved_agents,
        "agent_tokens": agent_tokens
    }
    with open(PERSISTENCE_FILE, "w") as f:
        json.dump(data, f)
    print("[PERSISTENCE] Saved approved agents and tokens.")

load_persistence()

# ================== DATA MODELS ==================
class RegisterRequest(BaseModel):
    hostname: str
    ip_address: str

class ApproveRequest(BaseModel):
    hostname: str

class RejectRequest(BaseModel):
    hostname: str

# ================== AGENT REGISTRATION ==================
@app.post("/register")
def register_agent(request: RegisterRequest):
    """Agent requests approval."""
    if request.hostname in approved_agents:
        return {"status": "approved", "token": agent_tokens[request.hostname]}
    
    if request.hostname in pending_agents:
        return {"status": "pending", "message": "Awaiting admin approval."}
    
    pending_agents[request.hostname] = request.ip_address
    print(f"[REGISTER] New agent pending approval: {request.hostname} ({request.ip_address})")
    return {"status": "pending", "message": "Awaiting admin approval."}

# ================== ADMIN APPROVAL ==================
@app.get("/pending")
def get_pending_agents():
    """Returns a list of agents waiting for approval."""
    return pending_agents

@app.post("/approve")
def approve_agent(request: ApproveRequest):
    """Admin approves an agent, moving it to the approved list and generating a token."""
    if request.hostname in approved_agents:
        token = agent_tokens.get(request.hostname)
        return {"status": "already_approved", "token": token}
    
    if request.hostname not in pending_agents:
        raise HTTPException(status_code=404, detail="Device not found in pending list.")
    
    approved_agents[request.hostname] = pending_agents.pop(request.hostname)
    token = f"TOKEN_{request.hostname}_{int(time.time())}"
    agent_tokens[request.hostname] = token
    save_persistence()
    
    print(f"[APPROVE] Device {request.hostname} approved. Assigned token: {token}")
    return {"status": "approved", "token": token}

@app.post("/reject")
def reject_agent(request: RejectRequest):
    """Admin rejects an agent, removing it from the pending list."""
    if request.hostname not in pending_agents:
        raise HTTPException(status_code=404, detail="Device not found in pending list.")
    
    del pending_agents[request.hostname]
    print(f"[REJECT] Device {request.hostname} rejected.")
    return {"status": "rejected", "message": "Device has been denied access."}

# ================== METRICS ENDPOINT ==================

@app.post("/metrics")
def receive_metrics(request: Request, data: dict):
    """Receives system data from approved agents with token authentication."""
    hostname = data.get("hostname")
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    
    # Debug logging
    print(f"[DEBUG] /metrics called with hostname: {hostname}")
    print(f"[DEBUG] Approved agents: {approved_agents}")
    print(f"[DEBUG] Received token: {token}")
    
    if not hostname or hostname not in approved_agents:
        raise HTTPException(status_code=403, detail="Unauthorized agent.")
    
    expected_token = agent_tokens.get(hostname)
    if not expected_token or token != expected_token:
        raise HTTPException(status_code=403, detail="Invalid token.")
    
    # Update the metrics for the specific agent
    global all_metrics
    all_metrics[hostname] = data
    
    print(f"[DATA] Received system info from {hostname}: {data}")
    return {"status": "success", "message": "Data received"}

async def stream_metrics():
    """
    Streams the latest metrics from all approved agents as Server-Sent Events.
    The JSON output will be of the form:
      {
         "Agent-1": { ... metrics ... },
         "Agent-2": { ... metrics ... }
      }
    """
    while True:
        yield f"data: {json.dumps(all_metrics)}\n\n"
        await asyncio.sleep(1)

@app.get("/approved")
def get_approved_agents():
    """Returns a dictionary of approved agents."""
    return approved_agents

@app.get("/metrics-stream")
def metrics_stream():
    """Endpoint for the frontend to subscribe to real-time metrics updates."""
    return StreamingResponse(stream_metrics(), media_type="text/event-stream")
