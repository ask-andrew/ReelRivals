#!/bin/bash

# Reel Rivals Live Scoring Scheduler
# Sets up automated execution for awards night

echo "🗓️ Live Scoring Scheduler Setup"
echo "================================"

# Award show schedules (adjust dates/times as needed)
declare -A SHOWS=(
    ["golden-globes-2026"]="2026-01-11 19:00:00"
    ["oscars-2026"]="2026-03-15 20:00:00"
    ["baftas-2026"]="2026-02-22 19:00:00"
)

# Function to schedule a show
schedule_show() {
    local event_id=$1
    local datetime=$2
    
    echo "📅 Scheduling $event_id for $datetime"
    
    # Convert to epoch time for scheduling
    local epoch=$(date -j -f "%Y-%m-%d %H:%M:%S" "$datetime" +%s)
    local current_epoch=$(date +%s)
    local delay=$((epoch - current_epoch))
    
    if [ $delay -le 0 ]; then
        echo "⚠️ Event time has passed. Running now..."
        node scripts/live-scraping-instant.mjs live-scrape $event_id
        return
    fi
    
    echo "⏰ Will start in $delay seconds ($(echo "$delay/3600" | bc) hours)"
    
    # Schedule with at command (macOS/Linux)
    echo "node scripts/live-scraping-instant.mjs live-scrape $event_id" | at -t "$datetime"
    
    # Alternative: Use sleep for long-running background process
    # nohup bash -c "sleep $delay; node scripts/live-scraping-instant.mjs live-scrape $event_id" > logs/$event_id.log 2>&1" &
}

# Create logs directory
mkdir -p logs

# Schedule upcoming shows
for event_id in "${!SHOWS[@]}"; do
    schedule_show "$event_id" "${SHOWS[$event_id]}"
done

echo ""
echo "✅ Scheduling complete!"
echo "📋 Scheduled jobs:"
at -l
echo ""
echo "📁 Logs will be saved to: logs/"
echo ""
echo "🛑 To cancel: at -r <job-id>"
