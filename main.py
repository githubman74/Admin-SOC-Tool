import os
import sys
import ctypes

# =============================================================================
# 0) On Windows: re-launch as Administrator if not already elevated
# =============================================================================
if os.name == 'nt':
    try:
        is_admin = ctypes.windll.shell32.IsUserAnAdmin()
    except Exception:
        is_admin = False
    if not is_admin:
        params = " ".join(f'"{arg}"' for arg in sys.argv)
        ctypes.windll.shell32.ShellExecuteW(
            None, "runas", sys.executable, params, None, 1
        )
        sys.exit(0)

# =============================================================================
# Imports
# =============================================================================
import subprocess
import threading
import time
import socket
import signal
import webbrowser
import venv
import pkg_resources

import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext

# =============================================================================
# Configuration & Paths
# =============================================================================
BASE_DIR = getattr(sys, '_MEIPASS', os.path.dirname(os.path.abspath(__file__)))
VENV_DIR = os.path.join(BASE_DIR, "venv")

# How to invoke the _system_ Python to build the venv:
if os.name == 'nt':
    SYSTEM_PY = ["py", "-3"]
    PIP_EXE    = os.path.join(VENV_DIR, "Scripts", "pip.exe")
    PYTHON_EXE = os.path.join(VENV_DIR, "Scripts", "python.exe")
else:
    SYSTEM_PY = ["python3"]
    PIP_EXE    = os.path.join(VENV_DIR, "bin", "pip")
    PYTHON_EXE = os.path.join(VENV_DIR, "bin", "python3")

SERVER_PORT          = 8123
USE_RELOAD           = not getattr(sys, 'frozen', False)
SERVER_PATH          = os.path.join(BASE_DIR, "server")
BACKEND_PATH         = os.path.join(BASE_DIR, "backend")
PACKET_ANALYZER_PATH = os.path.join(BACKEND_PATH, "packet_analyzer.py")
REQ_FILE             = os.path.join(BASE_DIR, "requirements.txt")
EXTERNAL_URL         = "https://admin-soc-tool.vercel.app/"

# =============================================================================
# Helpers
# =============================================================================
def log_to_widget(widget, msg):
    widget.insert(tk.END, msg + "\n")
    widget.see(tk.END)
    widget.update_idletasks()

def is_port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind(("127.0.0.1", port))
            return False
        except socket.error:
            return True

# =============================================================================
# Section 1: Environment Setup & Dependency Installation GUI
# =============================================================================
def run_setup_gui():
    win = tk.Tk()
    win.title("Initializing Admin Tool")
    win.geometry("500x350")
    win.resizable(False, False)
    win.configure(bg="#f0f0f0")

    tk.Label(win, text="Setting up environment...", font=("Arial",14), bg="#f0f0f0")\
      .pack(pady=10)
    output = scrolledtext.ScrolledText(win, wrap=tk.WORD, height=10, width=60,
                                       font=("Courier",10))
    output.pack(pady=5)

    prog = ttk.Progressbar(win, orient="horizontal", length=400, mode="determinate")
    prog.pack(pady=5)
    eta_lbl = tk.Label(win, text="", font=("Arial",10), fg="gray", bg="#f0f0f0")
    eta_lbl.pack(pady=5)

    def write(msg):
        log_to_widget(output, msg)

    def bootstrap():
        try:
            t0 = time.time()
            write("Checking Python version…")
            if sys.version_info < (3,6):
                raise RuntimeError("Python 3.6+ required.")
            write("Python OK.")

            # --- 1) Create venv via system Python if needed ---
            write("Ensuring virtual environment…")
            if not os.path.isdir(VENV_DIR):
                write(f"  Creating venv at {VENV_DIR}…")
                try:
                    subprocess.check_call(SYSTEM_PY + ["-m","venv", VENV_DIR])
                except Exception:
                    write("  System venv failed; falling back to stdlib venv…")
                    venv.EnvBuilder(with_pip=True).create(VENV_DIR)
                write("  venv ready.")
            else:
                write("  venv already exists.")

            # --- 2) Determine how to call pip inside that venv ---
            if os.path.isfile(PIP_EXE):
                pip_cmd = [PIP_EXE]
            else:
                pip_cmd = [PYTHON_EXE, "-m", "pip"]

            # --- 3) Read requirements & check for missing ---
            if not os.path.isfile(REQ_FILE):
                write("requirements.txt missing; skipping installs.")
            else:
                write("Reading requirements.txt…")
                reqs = [line.strip() for line in open(REQ_FILE)
                        if line.strip() and not line.startswith("#")]

                missing = []
                for req in reqs:
                    try:
                        pkg_resources.require(req)
                    except (pkg_resources.DistributionNotFound,
                            pkg_resources.VersionConflict):
                        missing.append(req)

                if missing:
                    write(f"Installing {len(missing)} missing dependencies in one shot…")
                    prog.config(mode="indeterminate")
                    prog.start(10)

                    subprocess.check_call(pip_cmd + ["install"] + missing)

                    prog.stop()
                    prog["value"] = 100
                    write("Dependencies installed.")
                else:
                    write("All dependencies are already satisfied.")

            # --- 4) Done, launch main app ---
            time.sleep(0.5)
            win.after(200, lambda: [win.destroy(), run_main_app()])

        except Exception as e:
            messagebox.showerror("Setup Error", str(e))
            write(f"ERROR: {e}")
            win.after(2000, lambda: sys.exit(1))

    threading.Thread(target=bootstrap, daemon=True).start()
    win.mainloop()

# =============================================================================
# Section 2: Main Application GUI and Service Management
# =============================================================================
def run_main_app():
    # sanity checks
    if not os.path.isdir(SERVER_PATH):
        messagebox.showerror("Error", f"Server dir missing:\n{SERVER_PATH}")
        sys.exit(1)
    if not os.path.isdir(BACKEND_PATH):
        messagebox.showerror("Error", f"Backend dir missing:\n{BACKEND_PATH}")
        sys.exit(1)
    if not os.path.isfile(PACKET_ANALYZER_PATH):
        messagebox.showerror("Error", f"Analyzer missing:\n{PACKET_ANALYZER_PATH}")
        sys.exit(1)
    if is_port_in_use(SERVER_PORT):
        messagebox.showerror("Port Error", f"Port {SERVER_PORT} in use.")
        sys.exit(1)

    processes = {"srv": None, "pkt": None}

    root = tk.Tk()
    root.title("Admin Server")
    root.geometry("400x240")
    root.configure(bg="black")
    root.resizable(False, False)

    tk.Label(root, text="Admin Server", font=("Arial",16,"bold"),
             fg="white", bg="black").pack(pady=10)
    status = tk.Label(root, text="Status: Stopped", font=("Arial",12),
                      fg="red", bg="black")
    status.pack(pady=5)

    def start_services():
        try:
            if os.name == 'nt':
                flags = subprocess.CREATE_NO_WINDOW
                cmd_srv = [
                    PYTHON_EXE, "-m", "uvicorn",
                    "server:app", "--host", "0.0.0.0",
                    "--port", str(SERVER_PORT)
                ]
                if USE_RELOAD:
                    cmd_srv.append("--reload")

                processes["srv"] = subprocess.Popen(
                    cmd_srv, cwd=SERVER_PATH, creationflags=flags
                )
                processes["pkt"] = subprocess.Popen(
                    [PYTHON_EXE, PACKET_ANALYZER_PATH],
                    cwd=BACKEND_PATH, creationflags=flags
                )
            else:
                cmd_srv = [
                    PYTHON_EXE, "-m", "uvicorn",
                    "server:app", "--host", "0.0.0.0",
                    "--port", str(SERVER_PORT)
                ]
                if USE_RELOAD:
                    cmd_srv.append("--reload")

                processes["srv"] = subprocess.Popen(
                    cmd_srv, cwd=SERVER_PATH, preexec_fn=os.setsid
                )
                processes["pkt"] = subprocess.Popen(
                    [PYTHON_EXE, PACKET_ANALYZER_PATH],
                    cwd=BACKEND_PATH, preexec_fn=os.setsid
                )

            webbrowser.open(EXTERNAL_URL)
            status.config(text="Status: Running", fg="green")
            btn_start.config(state="disabled")
            btn_stop.config(state="normal")
        except Exception as err:
            messagebox.showerror("Startup Error", str(err))

    def kill_proc(p):
        if not p: return
        try:
            if os.name == 'nt':
                subprocess.call(
                    ["taskkill","/F","/T","/PID",str(p.pid)],
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL
                )
            else:
                os.killpg(os.getpgid(p.pid), signal.SIGTERM)
        except:
            pass

    def stop_services():
        kill_proc(processes["srv"])
        kill_proc(processes["pkt"])
        processes["srv"] = processes["pkt"] = None
        status.config(text="Status: Stopped", fg="red")
        btn_start.config(state="normal")
        btn_stop.config(state="disabled")

    btn_start = tk.Button(root, text="Start Server", font=("Arial",12),
                          bg="green", fg="white", width=20,
                          command=start_services)
    btn_start.pack(pady=5)

    btn_stop = tk.Button(root, text="Stop Server", font=("Arial",12),
                         bg="darkred", fg="white", width=20,
                         state="disabled", command=stop_services)
    btn_stop.pack(pady=5)

    def on_close():
        if messagebox.askokcancel("Quit", "Exit?"):
            stop_services()
            root.destroy()

    root.protocol("WM_DELETE_WINDOW", on_close)
    root.mainloop()

# =============================================================================
# Section 3: Entry Point
# =============================================================================
if __name__ == "__main__":
    run_setup_gui()
