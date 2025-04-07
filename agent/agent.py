# Hide console window (if running in console mode)
import ctypes, sys, os
hwnd = ctypes.windll.kernel32.GetConsoleWindow()
if hwnd:
    ctypes.windll.user32.ShowWindow(hwnd, 0)

# Ensure stdout/stderr always have a fileno()
for name in ("stdout", "stderr"):
    stream = getattr(sys, name)
    if stream is None or not hasattr(stream, "fileno"):
        setattr(sys, name, open(os.devnull, "w"))

# Shim __builtin__ → builtins
try:
    import __builtin__    # Python‑2 name
except ImportError:
    import builtins as __builtin__


def main():
    try:
        import tkinter as tk
        from tkinter import messagebox
        import threading
        import httpx
        import socket
        import json
        import time
        import signal
        from system_info import get_system_info

        # Configuration file path
        CONFIG_FILE = "agent_config.json"
        running = False  # Global flag
        agent_thread = None

        # ================== CONFIG FILE HANDLING ==================
        def save_config(data):
            try:
                with open(CONFIG_FILE, "w") as f:
                    json.dump(data, f, indent=4)
            except Exception as e:
                print(f"[AGENT] Error saving config file: {e}")

        def load_config():
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

        def get_server_url():
            config = load_config()
            ip = config.get("server_ip", "localhost")
            return f"http://{ip}:8123"

        # ================== SIGNAL HANDLING ==================
        def handle_exit(signum, frame):
            nonlocal running
            running = False
            os._exit(0)

        signal.signal(signal.SIGINT, handle_exit)
        signal.signal(signal.SIGTERM, handle_exit)

        # ================== GET DEVICE INFO ==================
        def get_device_info():
            hostname = socket.gethostname().strip()
            try:
                ip_address = socket.gethostbyname(hostname)
            except socket.gaierror:
                ip_address = "Unknown"
            return {"hostname": hostname, "ip_address": ip_address}

        # ================== APPROVAL & TOKEN ==================
        def request_approval():
            device_info = get_device_info()
            config = load_config()
            if "token" in config:
                return config["token"]
            try:
                response = httpx.post(f"{get_server_url()}/register", json=device_info, timeout=5)
                if response.status_code == 200:
                    data = response.json()
                    if data.get("status") == "approved":
                        token = data.get("token")
                        if token:
                            config["token"] = token
                            save_config(config)
                            return token
                return None
            except httpx.RequestError:
                time.sleep(3)
                return None

        # ================== SEND SYSTEM INFO ==================
        def send_system_info():
            config = load_config()
            token = config.get("token") or request_approval()
            if not token:
                time.sleep(3)
                return
            system_data = {"hostname": get_device_info()["hostname"], "data": get_system_info()}
            headers = {"Authorization": f"Bearer {token}"}
            try:
                httpx.post(f"{get_server_url()}/metrics", json=system_data, headers=headers, timeout=5)
            except httpx.RequestError:
                time.sleep(3)

        # ================== AGENT LOOP CONTROL ==================
        def agent_loop():
            nonlocal running
            while running:
                send_system_info()
                time.sleep(1)

        def start_agent():
            nonlocal running, agent_thread
            if running:
                messagebox.showinfo("Info", "Agent is already running.")
                return
            running = True
            agent_thread = threading.Thread(target=agent_loop, daemon=True)
            agent_thread.start()
            messagebox.showinfo("Info", "Agent started.")

        def stop_agent():
            nonlocal running
            if not running:
                messagebox.showinfo("Info", "Agent is not running.")
                return
            running = False
            os._exit(0)

        # ================== GUI SETUP ==================
        root = tk.Tk()
        root.title("Agent Configuration")

        frame = tk.Frame(root, padx=10, pady=10)
        frame.pack()

        placeholder = "192.168.1.1"
        cfg = load_config()

        tk.Label(frame, text="Server IP:").grid(row=0, column=0, sticky="e")
        entry = tk.Entry(frame, fg="grey")
        entry.grid(row=0, column=1)

        if cfg.get("server_ip"):
            entry.insert(0, cfg["server_ip"])
            entry.config(fg="black")
        else:
            entry.insert(0, placeholder)

        def on_focus_in(event):
            if entry.get() == placeholder:
                entry.delete(0, tk.END)
                entry.config(fg="black")

        def on_focus_out(event):
            if not entry.get():
                entry.insert(0, placeholder)
                entry.config(fg="grey")

        entry.bind("<FocusIn>", on_focus_in)
        entry.bind("<FocusOut>", on_focus_out)

        tk.Button(frame, text="Save Config", command=lambda: save_and_notify()).grid(row=1, column=0, columnspan=2, pady=5)
        tk.Button(frame, text="Start Agent", command=start_agent).grid(row=2, column=0, pady=5)
        tk.Button(frame, text="Stop Agent", command=stop_agent).grid(row=2, column=1, pady=5)

        def save_and_notify():
            ip = entry.get().strip()
            if not ip or ip == placeholder:
                messagebox.showerror("Error", "Server IP cannot be empty.")
                return
            c = load_config()
            c["server_ip"] = ip
            save_config(c)
            messagebox.showinfo("Info", f"Server IP saved: {ip}")

        root.mainloop()

    except Exception:
        import traceback, tkinter as tk, tkinter.messagebox as mb
        tb = traceback.format_exc()
        try:
            with open("agent_error.log", "w") as log:
                log.write(tb)
        except:
            pass
        tk.Tk().withdraw()
        mb.showerror("Fatal Error", f"An unexpected error occurred:\n{tb}")


if __name__ == "__main__":
    main()
