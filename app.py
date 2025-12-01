import psutil
import time
import threading
import shutil
import subprocess
from pytron import App

def main():
    app = App()
    # Create a frameless window for a custom UI look
    window = app.create_window(
        title="Pytron Task Manager",
        width=1000,
        height=700,
        frameless=True,
        resizable=True
    )

    # --- Backend Logic ---

    def get_system_stats():
        """
        Returns a dictionary with current system statistics.
        """
        # Use a small interval to ensure we get an immediate reading.
        # interval=None returns 0 on the first call and relies on the time since the last call,
        # which can sometimes be unreliable if calls are sporadic.
        cpu_percent = psutil.cpu_percent(interval=0.1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        # GPU info using nvidia-smi if available
        gpu_stats = {"percent": 0, "name": "N/A", "memory": {"used": 0, "total": 0}}
        if shutil.which('nvidia-smi'):
            try:
                # Get Name
                name_output = subprocess.check_output(
                    ['nvidia-smi', '--query-gpu=name', '--format=csv,noheader'],
                    encoding='utf-8'
                )
                gpu_name = name_output.strip().split('\n')[0]

                # Get Stats
                stats_output = subprocess.check_output(
                    ['nvidia-smi', '--query-gpu=utilization.gpu,memory.total,memory.used', '--format=csv,noheader,nounits'],
                    encoding='utf-8'
                )
                # Example output: 14, 4096, 500
                line = stats_output.strip().split('\n')[0]
                vals = [float(x) for x in line.split(',')]
                
                gpu_stats = {
                    "percent": vals[0],
                    "name": gpu_name,
                    "memory": {
                        "total": vals[1] * 1024 * 1024, # MB to Bytes
                        "used": vals[2] * 1024 * 1024   # MB to Bytes
                    }
                }
            except Exception:
                pass

        return {
            "cpu": cpu_percent,
            "memory": {
                "total": memory.total,
                "available": memory.available,
                "percent": memory.percent,
                "used": memory.used
            },
            "disk": {
                "total": disk.total,
                "used": disk.used,
                "free": disk.free,
                "percent": disk.percent
            },
            "gpu": gpu_stats
        }

    # Cache for IO rate calculation: {pid: {'bytes': total_bytes, 'time': timestamp}}
    io_cache = {}

    def get_processes(sort_by='cpu'):
        """
        Returns a list of running processes sorted by the given criteria.
        """
        nonlocal io_cache
        processes = []
        cpu_count = psutil.cpu_count() or 1
        current_time = time.time()

        # GPU Memory Map (pid -> used_memory_mb)
        gpu_map = {}
        if shutil.which('nvidia-smi'):
            try:
                # Get GPU memory usage per process
                output = subprocess.check_output(
                    ['nvidia-smi', '--query-compute-apps=pid,used_memory', '--format=csv,noheader,nounits'],
                    encoding='utf-8'
                )
                for line in output.strip().split('\n'):
                    if line:
                        parts = line.split(',')
                        if len(parts) == 2:
                            try:
                                pid = int(parts[0])
                                mem_mb = float(parts[1])
                                gpu_map[pid] = mem_mb
                            except ValueError:
                                pass
            except Exception:
                pass

        for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent', 'io_counters']):
            try:
                # Fetch process details as a dict
                pinfo = proc.info

                # Filter out System Idle Process
                if pinfo['name'] in ('System Idle Process', 'Idle'):
                    continue

                # Normalize CPU percent by number of cores
                if pinfo['cpu_percent'] is not None:
                    pinfo['cpu_percent'] = pinfo['cpu_percent'] / cpu_count
                
                # Calculate IO Rate (Bytes/s)
                io_rate = 0
                if pinfo['io_counters']:
                    # Sum of read_bytes and write_bytes
                    total_io = pinfo['io_counters'].read_bytes + pinfo['io_counters'].write_bytes
                    
                    if pinfo['pid'] in io_cache:
                        prev = io_cache[pinfo['pid']]
                        time_diff = current_time - prev['time']
                        if time_diff > 0:
                            io_rate = (total_io - prev['bytes']) / time_diff
                    
                    # Update cache
                    io_cache[pinfo['pid']] = {'bytes': total_io, 'time': current_time}
                
                pinfo['disk_io'] = io_rate
                
                # Add GPU Memory
                pinfo['gpu_memory'] = gpu_map.get(pinfo['pid'], 0)

                processes.append(pinfo)
            except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                pass
        
        # Clean up cache for dead processes
        current_pids = set(p['pid'] for p in processes)
        io_cache = {k: v for k, v in io_cache.items() if k in current_pids}
        
        # Sort
        key_map = {
            'cpu': 'cpu_percent',
            'memory': 'memory_percent',
            'disk': 'disk_io', # Sort by IO rate
            'gpu': 'gpu_memory'   # Sort by GPU memory
        }
        sort_key = key_map.get(sort_by, 'cpu_percent')
        
        processes.sort(key=lambda p: p.get(sort_key) or 0, reverse=True)
        return processes[:50] # Return top 50 to keep it snappy

    def terminate_process(pid):
        """
        Terminates a process by PID.
        """
        try:
            p = psutil.Process(pid)
            p.terminate()
            return {"success": True, "message": f"Process {pid} terminated."}
        except Exception as e:
            return {"success": False, "message": str(e)}

    # --- Expose functions to Frontend ---
    window.expose(get_system_stats)
    window.expose(get_processes)
    window.expose(terminate_process)

    # --- Background Monitor (Optional: Push updates via events) ---
    # Alternatively, the frontend can poll. Polling is often simpler for this kind of app.
    # But let's demonstrate the event system if we want real-time push.
    # For now, let's stick to polling from frontend for simplicity and control.

    app.run(debug=False)

if __name__ == '__main__':
    main()
