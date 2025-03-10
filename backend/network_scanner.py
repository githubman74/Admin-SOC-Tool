# network_scanner.py
import scapy.all as scapy
import logging

logging.basicConfig(level=logging.INFO)

def scan_network(ip_range):
    """Scans the network using ARP requests to find active devices."""
    logging.info(f"Scanning Network: {ip_range}")  
    try:
        arp_request = scapy.ARP(pdst=ip_range)
        ether = scapy.Ether(dst="ff:ff:ff:ff:ff:ff")
        packet = ether / arp_request
        result = scapy.srp(packet, timeout=3, verbose=False)[0]
        devices = [{'ip': received.psrc, 'mac': received.hwsrc} for sent, received in result]
        return devices
    except Exception as e:
        logging.error(f"Error scanning network {ip_range}: {e}")
        return []

def scan_all_networks():
    """Scans common IP ranges and returns an aggregated, unique device list."""
    common_ip_ranges = ["192.168.31.1/24", "192.168.0.1/24", "192.168.1.1/24", "10.0.0.1/24"]
    all_devices = []
    for ip_range in common_ip_ranges:
        logging.info(f"Trying {ip_range}...")
        devices = scan_network(ip_range)
        if devices:
            logging.info(f"Found {len(devices)} devices on {ip_range}")
            all_devices.extend(devices)
    # Remove duplicates based on IP address
    unique_devices = {device['ip']: device for device in all_devices}.values()
    return list(unique_devices)

if __name__ == "__main__":
    devices = scan_all_networks()
    if devices:
        print("Devices connected to the network:")
        print("--------------------------------")
        for device in devices:
            print(f"IP: {device['ip']}, MAC: {device['mac']}")
    else:
        print("No devices found.")
    print("✅ Scanning complete.")
