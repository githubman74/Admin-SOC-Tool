import threading
import time
from collections import deque
from scapy.all import sniff, Ether, IP, TCP, UDP, ICMP, ARP

# Maximum packets to buffer
MAX_PACKETS = 1000

# Internal rolling buffer and lock
_packet_buffer = deque(maxlen=MAX_PACKETS)
_buffer_lock = threading.Lock()

# Simple incremental counter
_packet_counter = 1

def _process_packet(pkt):
    """
    Callback for each captured packet: extract minimal details and append to buffer.
    """
    global _packet_counter
    try:
        timestamp = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(pkt.time))
        length = len(pkt)
        src_ip = pkt[IP].src if IP in pkt else None
        dst_ip = pkt[IP].dst if IP in pkt else None
        src_port = pkt[TCP].sport if TCP in pkt else (pkt[UDP].sport if UDP in pkt else None)
        dst_port = pkt[TCP].dport if TCP in pkt else (pkt[UDP].dport if UDP in pkt else None)
        proto = None
        if TCP in pkt:
            proto = 'TCP'
        elif UDP in pkt:
            proto = 'UDP'
        elif ICMP in pkt:
            proto = 'ICMP'
        elif ARP in pkt:
            proto = 'ARP'
        else:
            proto = pkt.name

        entry = {
            'id': _packet_counter,
            'time': timestamp,
            'length': length,
            'sourceIp': src_ip,
            'sourceMac': pkt[Ether].src if Ether in pkt else None,
            'sourcePort': src_port,
            'destIp': dst_ip,
            'destMac': pkt[Ether].dst if Ether in pkt else None,
            'destPort': dst_port,
            'protocol': proto,
        }
        with _buffer_lock:
            _packet_buffer.append(entry)
        _packet_counter += 1
    except Exception:
        pass

def start_sniff(iface=None, bpf_filter=None):
    """
    Begin background packet capture.
    """
    try:
        thread = threading.Thread(
            target=sniff,
            kwargs={
                'prn': _process_packet,
                'store': False,
                'iface': iface,
                'filter': bpf_filter,
            },
            daemon=True,
        )
        thread.start()
        return True
    except PermissionError:
        print("Packet capture failed: Permission denied. Requires root/admin privileges.")
        return False
    except Exception as e:
        print(f"Packet capture error: {e}")
        return False

def get_captured_packets():
    """
    Retrieve a snapshot of buffered packet entries.
    """
    with _buffer_lock:
        return list(_packet_buffer)
