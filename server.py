from flask import Flask, request, jsonify
from datetime import datetime
import random
import time
from collections import Counter # Import Counter

app = Flask(__name__)

# In-memory list to record command history
COMMAND_HISTORY = []

@app.route('/api/ping', methods=['GET'])
def ping():
    """Simply confirm the server is running."""
    return jsonify({ "alive": True }), 200

@app.route('/api/command', methods=['POST'])
def command():
    """
    Expects JSON payload:
      { "cmd": "<voice command text>" }
    Simulate processing and return a result.
    """
    start_time = time.time() # Record start time
    data = request.get_json() or {}
    cmd = data.get('cmd', '').strip()

    if not cmd:
        return jsonify({ "status": "error", "result": "No command provided." }), 400

    # Simulate processing (e.g. classify voice, toggle a device, etc.)
    # In a real system, this is where you'd integrate with your hardware/service
    simulated_latency = random.uniform(50, 500) # Simulate processing time
    time.sleep(simulated_latency / 1000) # Simulate blocking I/O
    end_time = time.time() # Record end time
    response_time_ms = round((end_time - start_time) * 1000)

    result_text = f"Executed command: {cmd}"
    status = "success"

    # Simulate occasional errors
    if random.random() < 0.1: # 10% chance of failure
        status = "failed"
        result_text = f"Failed to execute command: {cmd}"

    # Record into history using a proper timestamp and include response time
    COMMAND_HISTORY.append({
        "cmd": cmd,
        "status": status,
        "timestamp": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
        "responseTime": response_time_ms, # Add responseTime
        "user": "default_user", # Add a placeholder user
        "response": result_text, # Add response text
        "result": result_text # Keep result for compatibility
    })

    return jsonify({ "status": status, "result": result_text }), 200

START_TIME = time.time()

@app.route('/api/status', methods=['GET'])
def status():
    """
    Return device status: uptime, signal, battery, temperature, humidity, noise, accuracy.
    """
    uptime = int(time.time() - START_TIME)
    # Simulate signal, battery, etc. with random or static values for now
    signal = random.randint(-70, -50)      # dBm
    battery = random.randint(70, 100)      # percent
    temperature = round(random.uniform(22, 28), 1)
    humidity = random.randint(40, 60)
    noise = random.randint(30, 50)
    accuracy = random.randint(85, 99)

    return jsonify({
        "uptime": uptime,
        "signal": signal,
        "battery": battery,
        "temperature": temperature,
        "humidity": humidity,
        "noise": noise,
        "accuracy": accuracy
    }), 200

@app.route('/api/analytics', methods=['GET'])
def analytics():
    """
    Return analytics data including total commands, successes, avg latency,
    last five commands, and command frequencies.
    """
    total = len(COMMAND_HISTORY)
    successes = sum(1 for entry in COMMAND_HISTORY if entry["status"] == "success")

    # Calculate average latency from history (only for successful commands with responseTime)
    successful_commands_with_latency = [entry for entry in COMMAND_HISTORY if entry["status"] == "success" and "responseTime" in entry]
    avg_latency_ms = round(sum(entry["responseTime"] for entry in successful_commands_with_latency) / len(successful_commands_with_latency)) if successful_commands_with_latency else 0

    # Calculate command frequencies
    command_counts = Counter(entry["cmd"] for entry in COMMAND_HISTORY)
    # Convert Counter object to a list of dicts for JSON
    command_frequency = [{"command": cmd, "count": count} for cmd, count in command_counts.items()]

    # Send back the last five entries (or fewer if <5)
    last_five = COMMAND_HISTORY[-5:]

    # Extract historical latency data for the graph
    historical_latency = []
    for entry in COMMAND_HISTORY:
        if "responseTime" in entry and "timestamp" in entry:
            # Using timestamp as x-value and responseTime as y-value
            historical_latency.append({"timestamp": entry["timestamp"], "latency": entry["responseTime"]})

    return jsonify({
        "totalCommands": total,
        "successfulCommands": successes,
        "averageLatencyMs": avg_latency_ms,
        "lastFiveCommands": last_five,
        "commandFrequency": command_frequency,
        "historicalLatency": historical_latency
    }), 200

if __name__ == '__main__':
    # Listen on all interfaces, port 5000
    app.run(host='0.0.0.0', port=5000, debug=True) # Added debug=True for easier development 