import os
import psutil
import platform
import subprocess
import threading
import time
import json
import logging
import socket
from speedtest import Speedtest
from concurrent.futures import ThreadPoolExecutor, as_completed

# Configure logging
logging.basicConfig(level=logging.INFO)
current_os = platform.system()
logging.info(f"Running on {current_os}")

def safe_get(data, key, default=None):
    """Safely gets a value from a dictionary.

    Args:
        data (dict): The dictionary to retrieve from.
        key (str): The key to retrieve.
        default: The default value to return if the key is not found.

    Returns:
        The value of the key, or the default value if the key is not found.
    """
    if not isinstance(data, dict):
        return default
    return data.get(key, default)

# ------------------ Fast Metrics Functions ------------------
def get_cpu_usage():
    try:
        return psutil.cpu_percent(interval=0)
    except Exception as e:
        logging.error(f"Error getting CPU usage: {e}")
        return 0

def get_cpu_core_usage():
    try:
        return psutil.cpu_percent(interval=0, percpu=True)
    except Exception as e:
        logging.error(f"Error getting CPU core usage: {e}")
        return []

def get_memory_usage():
    try:
        return psutil.virtual_memory().percent
    except Exception as e:
        logging.error(f"Error getting memory usage: {e}")
        return 0

def get_disk_usage():
    try:
        total, used, free = 0, 0, 0
        for part in psutil.disk_partitions(all=False):
            try:
                usage = psutil.disk_usage(part.mountpoint)
                total += usage.total
                used += usage.used
                free += usage.free
            except PermissionError:
                continue
        return round((used / total) * 100, 2) if total else 0
    except Exception as e:
        logging.error(f"Error getting disk usage: {e}")
        return 0

def get_network_speed():
    try:
        st = Speedtest()
        st.get_best_server()
        download = round(st.download() / 1_000_000, 2)
        upload = round(st.upload() / 1_000_000, 2)
        ping = round(st.results.ping, 2)
        return {"download_speed": download, "upload_speed": upload, "ping": ping}
    except Exception as e:
        logging.warning(f"Network error: {e}")
        return {"download_speed": 0, "upload_speed": 0, "ping": None}

# ------------------ Background Updates for Fast Metrics ------------------
network_data = {"download_speed": 0, "upload_speed": 0, "ping": None}

def update_network_speed():
    global network_data
    while True:
        try:
            network_data = get_network_speed()
        except Exception as e:
            logging.error(f"Error in network monitoring: {e}")
        time.sleep(10)

threading.Thread(target=update_network_speed, daemon=True).start()

# ------------------ Heavy Metrics: Top Processes ------------------
def get_top_cpu_processes():
    try:
        processes = []
        for proc in psutil.process_iter(['pid', 'name', 'cpu_percent']):
            try:
                processes.append({
                    "pid": proc.info['pid'],
                    "name": proc.info['name'],
                    "cpu_percent": proc.info['cpu_percent']
                })
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
        return sorted(processes, key=lambda x: x["cpu_percent"], reverse=True)[:5]
    except Exception as e:
        logging.error(f"Error getting top CPU processes: {e}")
        return []

def get_top_memory_processes():
    try:
        processes = []
        for proc in psutil.process_iter(['pid', 'name', 'memory_percent']):
            try:
                processes.append({
                    "pid": proc.info['pid'],
                    "name": proc.info['name'],
                    "memory_percent": round(proc.info['memory_percent'], 2)
                })
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
        return sorted(processes, key=lambda x: x["memory_percent"], reverse=True)[:5]
    except Exception as e:
        logging.error(f"Error getting top memory processes: {e}")
        return []

def get_top_network_processes():
    try:
        process_data = []
        for proc in psutil.process_iter(['name']):
            try:
                connections = proc.connections()
                if connections:
                    process_data.append({
                        "name": proc.info['name'],
                        "connections": len(connections)
                    })
            except (psutil.AccessDenied, psutil.NoSuchProcess):
                continue
        process_data.sort(key=lambda x: x["connections"], reverse=True)
        return process_data[:5]
    except Exception as e:
        logging.error(f"Error getting top network processes: {e}")
        return []

global_top_cpu_processes = []
global_top_memory_processes = []
global_top_network_processes = []

def update_top_processes():
    global global_top_cpu_processes, global_top_memory_processes, global_top_network_processes
    while True:
        try:
            global_top_cpu_processes = get_top_cpu_processes()
            global_top_memory_processes = get_top_memory_processes()
            global_top_network_processes = get_top_network_processes()
        except Exception as e:
            logging.error(f"Error updating top processes: {e}")
        time.sleep(5)

threading.Thread(target=update_top_processes, daemon=True).start()

# ------------------ WiFi Details ------------------
def get_wifi_details():
    system = platform.system()
    if system == "Windows":
        try:
            result = subprocess.check_output("netsh wlan show interfaces", shell=True).decode()
            ssid = None
            signal = None
            for line in result.splitlines():
                if "SSID" in line and "BSSID" not in line:
                    parts = line.split(":", 1)
                    if len(parts) == 2:
                        ssid = parts[1].strip()
                if "Signal" in line:
                    parts = line.split(":", 1)
                    if len(parts) == 2:
                        signal = parts[1].strip()
            return {"SSID": ssid, "Signal Strength": signal}
        except Exception as e:
            logging.warning("WiFi details error: " + str(e))
            return {"SSID": None, "Signal Strength": None}
    elif system == "Linux":
        try:
            result = subprocess.check_output("nmcli -t -f active,ssid,signal dev wifi", shell=True).decode()
            ssid, signal_strength = None, None
            for line in result.splitlines():
                parts = line.split(':')
                if parts[0] == "yes":
                    ssid = parts[1].strip() if len(parts) > 1 else None
                    signal_strength = parts[2].strip() if len(parts) > 2 else None
                    break
            return {"SSID": ssid, "Signal Strength": signal_strength}
        except Exception as e:
            logging.warning("WiFi details error: " + str(e))
            return {"SSID": None, "Signal Strength": None}
    else:
        return {"SSID": None, "Signal Strength": None}
global_wifi_details = {"SSID": None, "Signal Strength": None}

def update_wifi_details():
    global global_wifi_details
    while True:
        try:
            global_wifi_details = get_wifi_details()
        except Exception as e:
            logging.error(f"Error updating wifi details: {e}")
        time.sleep(5)

threading.Thread(target=update_wifi_details, daemon=True).start()

# ------------------ Process Details ------------------
def get_process_details():
    system = platform.system()

    if system == "Windows":
        try:
            result = subprocess.run(
                ["powershell", "-command", "Get-Process | Select-Object Id, SI, ProcessName, CPU, Handles, NPM, PM, WS | ConvertTo-Json -Depth 10"],
                capture_output=True,
                text=True,
                timeout=10  # Add a timeout
            )
            if result.returncode == 0:
                try:
                    return json.loads(result.stdout)
                except json.JSONDecodeError:
                    logging.error(f"JSON Decode Error: {result.stdout}")
                    return []
            else:
                logging.error(f"Error executing PowerShell command: {result.stderr}")
                return []

        except subprocess.TimeoutExpired:
            logging.error("PowerShell command timed out.")
            return []
        except Exception as e:
            logging.error(f"Error getting process details (Windows): {e}")
            return []

    elif system == "Linux":
        try:
            result = subprocess.run(["ps", "axo", "pid,%cpu,comm"], capture_output=True, text=True, timeout=10)
            if result.returncode == 0:
                lines = result.stdout.strip().split("\n")
                process_list = []
                for line in lines[1:]:
                    columns = line.split(maxsplit=2)
                    if len(columns) == 3:
                        try:
                            process_list.append({
                                "Id": int(columns[0]),
                                "SI": 0,
                                "ProcessName": columns[2],
                                "CPU": float(columns[1]),
                                "Handles": 0,
                                "NPM": 0,
                                "PM": 0,
                                "WS": 0
                            })
                        except ValueError:
                            logging.warning(f"Skipping malformed line: {line}")
                return process_list
            else:
                logging.error(f"Error executing ps command: {result.stderr}")
                return []
        except subprocess.TimeoutExpired:
            logging.error("ps command timed out.")
            return []
        except Exception as e:
            logging.error(f"Error getting process details (Linux): {e}")
            return []
    else:
        logging.error("Unsupported OS for process details.")
        return []

global_process_details = []

def update_process_details():
    global global_process_details
    while True:
        try:
            global_process_details = get_process_details()
        except Exception as e:
            logging.error(f"Error updating process details: {e}")
        time.sleep(0.05)
threading.Thread(target=update_process_details, daemon=True).start()

# ------------------ Combined System Info Collection ------------------
def get_system_info():
    """
    Gather all system metrics into a single dictionary.
    The keys here should match the admin panel's expected format.
    """
    try:
        info = {
            "hostname": socket.gethostname(),
            "os": f"{platform.system()} {platform.release()}",
            "cpu_usage": get_cpu_usage(),
            "per_core_usage": get_cpu_core_usage(),
            "memory_usage": get_memory_usage(),
            "disk_usage": get_disk_usage(),
            "network_speed": network_data,
            "wifi_details": global_wifi_details,
            "top_cpu_processes": global_top_cpu_processes,
            "top_memory_processes": global_top_memory_processes,
            "top_network_processes": global_top_network_processes,
            "process_details": global_process_details if global_process_details else [] # Ensure it is always a list
        }
    except Exception as e:
        logging.error(f"Error collecting system info: {e}")
        info = {"error": str(e)}
    return info

# ------------------ Testing the Merged Info Collection ------------------
if __name__ == "__main__":
    # For testing purposes, print the collected system info every 10 seconds.
    while True:
        system_info = get_system_info()
        print(json.dumps(system_info, indent=4))
        time.sleep(10)
