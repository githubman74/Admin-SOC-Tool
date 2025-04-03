import httpx
import socket
import json
import time
import os
import signal
from system_info import get_system_info

SERVER_URL = "http://localhost:8123"
CONFIG_FILE = "agent_config.json"

running = True  # Global flag to control the loop

# ================== SIGNAL HANDLING ==================

def handle_exit(signum, frame):
    global running
    print("\n[AGENT] Termination signal received. Shutting down gracefully...")
    running = False
    os._exit(0)  # Force exit

signal.signal(signal.SIGINT, handle_exit)
signal.signal(signal.SIGTERM, handle_exit)

# ================== GET DEVICE INFO ==================

def get_device_info():
    hostname = socket.gethostname().strip()
    try:
        ip_address = socket.gethostbyname(hostname)
    except socket.gaierror:
        ip_address = "Unknown"
    print(f"[AGENT DEBUG] Hostname: {hostname}, IP: {ip_address}")
    return {"hostname": hostname, "ip_address": ip_address}

# ================== CONFIG FILE HANDLING ==================

def save_config(data):
    """Save JSON data to config file."""
    try:
        with open(CONFIG_FILE, "w") as f:
            json.dump(data, f)
    except Exception as e:
        print(f"[AGENT] Error saving config file: {e}")

def load_config():
    """Load JSON data from config file, creating an empty one if missing."""
    if not os.path.exists(CONFIG_FILE):
        save_config({})
    
    try:
        with open(CONFIG_FILE, "r") as f:
            content = f.read().strip()
            if not content:
                return {}
            return json.loads(content)
    except json.JSONDecodeError:
        print("[AGENT] Error: Invalid JSON in config file. Resetting...")
        save_config({})
        return {}

# ================== CHECK FOR APPROVAL ==================

def request_approval():
    """Ask the server for approval. If approved, store the token."""
    device_info = get_device_info()
    config = load_config()

    if "token" in config:
        print("[AGENT] Device already approved. Skipping approval request.")
        return config["token"]

    try:
        response = httpx.post(f"{SERVER_URL}/register", json=device_info, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "approved":
                token = data.get("token")
                if token:
                    config["token"] = token
                    save_config(config)
                    print(f"[AGENT] Approved! Token saved: {token}")
                    return token
            else:
                print(f"[AGENT] Waiting for admin approval...")
                return None
        else:
            print(f"[AGENT] Error registering device: {response.text}")
            return None
    except httpx.RequestError:
        print("[AGENT] Error: Unable to reach server. Retrying in 30 seconds...")
        time.sleep(30)
        return None  # Avoid recursion

# ================== SEND SYSTEM INFO ==================

def send_system_info():
    """Send system data to the server with authentication."""
    config = load_config()
    token = config.get("token") or request_approval()
    
    if not token:
        print("[AGENT] Device not approved yet. Retrying in 30 seconds...")
        time.sleep(30)
        return  # Avoid recursion

    system_data = {
        "hostname": get_device_info()["hostname"],
        "data": get_system_info()
    }
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = httpx.post(f"{SERVER_URL}/metrics", json=system_data, headers=headers, timeout=5)
        
        if response.status_code == 200:
            print("[AGENT] Data sent successfully!")
        else:
            print(f"[AGENT] Failed to send data: {response.text}")
    except httpx.RequestError:
        print("[AGENT] Error: Unable to reach server. Retrying in 30 seconds...")
        time.sleep(30)

# ================== RUN AGENT LOOP ==================

while running:
    if not running:
        break
    send_system_info()
    time.sleep(1)

print("[AGENT] Agent has stopped.")