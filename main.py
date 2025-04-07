import subprocess
import os
import sys
import tkinter as tk
from tkinter import messagebox
import webbrowser
import signal

# Optional: psutil for advanced process management
try:
    import psutil
except ImportError:
    psutil = None  # We'll fall back to taskkill on Windows if needed

# Determine base directory
if getattr(sys, 'frozen', False):
    base_dir = sys._MEIPASS  # When running from compiled .exe
    use_reload = False
else:
    base_dir = os.path.dirname(os.path.abspath(__file__))
    use_reload = True

# Paths
server_path = os.path.join(base_dir, "server")
backend_path = os.path.join(base_dir, "backend")
packet_analyzer_path = os.path.join(backend_path, "packet_analyzer.py")

# Validate paths
if not os.path.isdir(server_path):
    messagebox.showerror("Error", f"Server directory not found: {server_path}")
    sys.exit(1)
if not os.path.isdir(backend_path):
    messagebox.showerror("Error", f"Backend directory not found: {backend_path}")
    sys.exit(1)
if not os.path.isfile(packet_analyzer_path):
    messagebox.showerror("Error", f"Packet analyzer script not found: {packet_analyzer_path}")
    sys.exit(1)

# Global process handles
server_proc = None
packet_proc = None

# URL to open
external_url = "https://admin-soc-tool.vercel.app/"

def quote_path(path):
    """Quote paths with spaces for Windows"""
    return f'"{path}"' if os.name == 'nt' else path

def start_services():
    global server_proc, packet_proc
    try:
        if os.name == 'nt':
            creationflags = subprocess.CREATE_NO_WINDOW

            # Launch FastAPI server
            server_cmd = f'uvicorn server:app --host 0.0.0.0 --port 8123{" --reload" if use_reload else ""}'
            server_proc = subprocess.Popen(
                f'cmd /c "{server_cmd}"',
                cwd=server_path,
                shell=True,
                creationflags=creationflags
            )

            # Launch packet analyzer
            packet_proc = subprocess.Popen(
                f'cmd /c "python {quote_path(packet_analyzer_path)}"',
                cwd=backend_path,
                shell=True,
                creationflags=creationflags
            )
        else:
            # Unix/macOS
            server_proc = subprocess.Popen(
                ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8123"] + (["--reload"] if use_reload else []),
                cwd=server_path,
                preexec_fn=os.setsid
            )
            packet_proc = subprocess.Popen(
                ["python3", packet_analyzer_path],
                cwd=backend_path,
                preexec_fn=os.setsid
            )

        webbrowser.open(external_url)
        status_label.config(text="Status: Running", fg="green")
        start_btn.config(state="disabled")
        stop_btn.config(state="normal")

    except Exception as e:
        messagebox.showerror("Error", f"Failed to start services:\n{e}")

def kill_process_tree(proc):
    if proc is None:
        return
    try:
        if os.name == 'nt':
            # Use taskkill to terminate full tree
            subprocess.call(['taskkill', '/F', '/T', '/PID', str(proc.pid)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        else:
            os.killpg(os.getpgid(proc.pid), signal.SIGTERM)
    except Exception as e:
        print(f"Error killing process: {e}")

def stop_services():
    global server_proc, packet_proc
    try:
        kill_process_tree(server_proc)
        kill_process_tree(packet_proc)

        server_proc = None
        packet_proc = None

        status_label.config(text="Status: Stopped", fg="red")
        start_btn.config(state="normal")
        stop_btn.config(state="disabled")
    except Exception as e:
        messagebox.showerror("Error", f"Failed to stop services:\n{e}")

# GUI Setup
root = tk.Tk()
root.title("Admin Server")
root.geometry("400x220")
root.configure(bg="black")
root.resizable(False, False)

tk.Label(root, text="Admin Server", font=("Arial", 16, "bold"), fg="white", bg="black").pack(pady=10)
status_label = tk.Label(root, text="Status: Stopped", font=("Arial", 12), fg="red", bg="black")
status_label.pack(pady=5)

start_btn = tk.Button(root, text="Start Server", font=("Arial", 12), bg="green", fg="white", width=20, command=start_services)
start_btn.pack(pady=5)

stop_btn = tk.Button(root, text="Stop Server", font=("Arial", 12), bg="darkred", fg="white", width=20, command=stop_services, state="disabled")
stop_btn.pack(pady=5)

def on_close():
    if messagebox.askokcancel("Quit", "Do you want to exit?"):
        stop_services()
        root.destroy()

root.protocol("WM_DELETE_WINDOW", on_close)
root.mainloop()
