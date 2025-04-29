import logging
from datetime import datetime
import sys
import os

# === Setup logging ===
log_dir = os.path.join(os.getcwd(), "logs")
os.makedirs(log_dir, exist_ok=True)
log_file = os.path.join(log_dir, f"agent_log_{datetime.now().strftime('%Y-%m-%d')}.txt")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - [%(levelname)s] - %(message)s",
    handlers=[
        logging.FileHandler(log_file),
        logging.StreamHandler()
    ]
)

# Fix for environments with missing stdout/stderr
for name in ('stdout', 'stderr'):
    stream = getattr(sys, name)
    if stream is None or not hasattr(stream, 'fileno'):
        setattr(sys, name, open(os.devnull, 'w'))

try:
    import __builtin__  # Python 2 compatibility
except ImportError:
    import builtins as __builtin__

from system_info import get_system_info
from packet_capture import start_sniff, get_captured_packets

def main():
    import threading
    import httpx
    import socket
    import json
    import time
    import signal

    CONFIG_FILE = 'agent_config.json'
    running = False
    agent_thread = None

    # Hardcoded server address
    SERVER_IP = "https://admin-server-33le.onrender.com" 
    SERVER_URL = f"http://{SERVER_IP}:8123"

    def save_config(data):
        try:
            with open(CONFIG_FILE, 'w') as f:
                json.dump(data, f, indent=4)
        except Exception as e:
            logging.error(f"Failed to save config: {e}")

    def load_config():
        if not os.path.exists(CONFIG_FILE):
            save_config({})
        try:
            with open(CONFIG_FILE, 'r') as f:
                s = f.read().strip()
                return json.loads(s) if s else {}
        except Exception as e:
            logging.error(f"Failed to load config: {e}")
            save_config({})
            return {}

    def handle_exit(signum, frame):
        nonlocal running
        logging.info("Agent exiting gracefully due to signal.")
        running = False
        os._exit(0)

    signal.signal(signal.SIGINT, handle_exit)
    signal.signal(signal.SIGTERM, handle_exit)

    def get_device_info():
        hn = socket.gethostname()
        try:
            ip = socket.gethostbyname(hn)
        except Exception as e:
            logging.warning(f"Could not resolve hostname: {e}")
            ip = 'Unknown'
        return {'hostname': hn, 'ip_address': ip}

    def request_approval():
        info = get_device_info()
        cfg = load_config()
        if 'token' in cfg:
            logging.info("Token already present, skipping approval request.")
            return cfg['token']
        try:
            r = httpx.post(f"{SERVER_URL}/register", json=info, timeout=5)
            if r.status_code == 200:
                status = r.json().get('status')
                if status == 'approved':
                    token = r.json().get('token')
                    cfg['token'] = token
                    save_config(cfg)
                    logging.info(f"Agent approved with token: {token}")
                    return token
                else:
                    logging.info(f"Agent pending approval: {r.json().get('message')}")
        except Exception as e:
            logging.error(f"Approval request failed: {e}")
            time.sleep(3)
        return None

    def send_system_info():
        cfg = load_config()
        token = cfg.get('token') or request_approval()
        if not token:
            time.sleep(3)
            return
        hostname = get_device_info()['hostname']
        payload = {
            'hostname': hostname,
            'data': get_system_info(),
            'packets': get_captured_packets()[:50],
        }
        logging.info(f"Sending {len(payload['packets'])} packets to server")

        headers = {'Authorization': f'Bearer {token}'}
        try:
            httpx.post(f"{SERVER_URL}/metrics", json=payload, headers=headers, timeout=5)
        except Exception as e:
            logging.error(f"Failed to send metrics: {e}")
            time.sleep(3)

    def agent_loop():
        nonlocal running
        try:
            start_sniff()
            logging.info("Packet capture started successfully.")
        except PermissionError:
            logging.error("Insufficient permissions for packet capture. Please run as admin/root.")
        except Exception as e:
            logging.error(f"Error starting packet capture: {e}")
        
        while running:
            send_system_info()
            time.sleep(1)

    def start_agent():
        nonlocal running, agent_thread
        if running:
            logging.info("Agent already running.")
            return
        logging.info("Agent starting...")
        running = True
        agent_thread = threading.Thread(target=agent_loop, daemon=True)
        agent_thread.start()

    def stop_agent():
        nonlocal running
        if not running:
            logging.info("Agent not running.")
            return
        logging.info("Agent stopping manually.")
        running = False
        os._exit(0)

    # Start the agent automatically
    logging.info("Starting agent without GUI...")
    start_agent()

    # Keep the main thread alive
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        stop_agent()

# === Crash catcher ===
if __name__ == '__main__':
    try:
        logging.info("Launching agent...")
        main()
    except Exception as e:
        logging.error(f"Fatal error in agent: {e}")