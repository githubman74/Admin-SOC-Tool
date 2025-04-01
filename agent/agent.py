import httpx
import socket
import json
import time
import os
from system_info import get_system_info

SERVER_URL = "http://localhost:8123"
CONFIG_FILE = "agent_config.json"  # Stores token after approval

# ================== GET DEVICE INFO ==================

def get_device_info():
    hostname = socket.gethostname().strip()
    ip_address = socket.gethostbyname(hostname)
    print(f"[AGENT DEBUG] Hostname: {hostname}, IP: {ip_address}")
    return {"hostname": hostname, "ip_address": ip_address}

# ================== CHECK FOR APPROVAL ==================

def request_approval():
    """Ask the server for approval. If approved, store the token."""
    device_info = get_device_info()
    response = httpx.post(f"{SERVER_URL}/register", json=device_info)
    
    if response.status_code == 200:
        data = response.json()
        
        if data["status"] == "approved":
            token = data["token"]
            save_token(token)
            print(f"[AGENT] Approved! Token saved: {token}")
            return token
        else:
            print(f"[AGENT] Waiting for admin approval...")
            return None
    else:
        print(f"[AGENT] Error registering device: {response.text}")
        return None

def save_token(token):
    """Save the token to a config file."""
    with open(CONFIG_FILE, "w") as f:
        json.dump({"token": token}, f)

def load_token():
    """Load the token if already approved."""
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, "r") as f:
                content = f.read().strip()
                if not content:
                    return None
                data = json.loads(content)
                return data.get("token")
        except json.JSONDecodeError:
            print("[AGENT] Error: Invalid JSON in config file.")
            return None
    return None


# ================== SEND SYSTEM INFO ==================

def send_system_info():
    """Send system data to the server with authentication."""
    token = load_token() or request_approval()
    
    if not token:
        print("[AGENT] Device not approved yet. Retrying in 30 seconds...")
        time.sleep(30)
        return send_system_info() 

    system_data = {
        "hostname": get_device_info()["hostname"],
        "data": get_system_info()  
    }
    
    headers = {"Authorization": f"Bearer {token}"}  # Add token to headers
    
    response = httpx.post(f"{SERVER_URL}/metrics", json=system_data, headers=headers)
    
    if response.status_code == 200:
        print("[AGENT] Data sent successfully!")
    else:
        print(f"[AGENT] Failed to send data: {response.text}")


# ================== RUN AGENT LOOP ==================

while True:
    send_system_info()
    time.sleep(60)  # Adjust based on your needs
