#!/bin/bash

echo "=== Docker Swarm Stack Monitoring Script ==="
echo

# Function to show service status
show_services() {
    echo "📊 SERVICE STATUS:"
    docker service ls
    echo
}

# Function to show detailed task status
show_tasks() {
    echo "🔧 DETAILED TASK STATUS:"
    docker service ps mocking-api-stack_frontend --no-trunc | head -10
    echo
}

# Function to show recent logs
show_logs() {
    echo "📝 RECENT LOGS (Frontend):"
    docker service logs mocking-api-stack_frontend --tail 5
    echo
}

# Function to show health status
show_health() {
    echo "💓 HEALTH CHECK STATUS:"
    docker service inspect mocking-api-stack_frontend --format='{{range .Spec.TaskTemplate.ContainerSpec.Healthcheck}}Test: {{.Test}}{{"\n"}}Interval: {{.Interval}}{{"\n"}}Timeout: {{.Timeout}}{{"\n"}}StartPeriod: {{.StartPeriod}}{{end}}'
    echo
}

# Function to manage stack lifecycle
manage_stack() {
    case "$1" in
        "stop"|"down")
            echo "🛑 STOPPING DOCKER SWARM STACK..."
            docker stack rm mocking-api-stack
            echo "✅ Stack stopped and removed"
            ;;
        "restart")
            echo "🔄 RESTARTING DOCKER SWARM STACK..."
            echo "Step 1: Stopping current stack..."
            docker stack rm mocking-api-stack
            echo "Waiting for cleanup..."
            sleep 10
            echo "Step 2: Starting stack again..."
            docker stack deploy -c swarm-stack.yml mocking-api-stack
            echo "✅ Stack restarted"
            ;;
        "deploy"|"start")
            echo "🚀 DEPLOYING DOCKER SWARM STACK..."
            docker stack deploy -c swarm-stack.yml mocking-api-stack
            echo "✅ Stack deployed"
            ;;
        "update")
            echo "🔄 UPDATING STACK SERVICES..."
            docker service update --force mocking-api-stack_frontend
            docker service update --force mocking-api-stack_backend
            echo "✅ Services updated"
            ;;
        *)
            echo "Usage: $0 stack [action]"
            echo "Actions: stop, restart, deploy, update"
            ;;
    esac
}

# Function to monitor in real-time
monitor_realtime() {
    echo "🔄 REAL-TIME MONITORING (Press Ctrl+C to stop):"
    echo
    while true; do
        clear
        echo "=== $(date) ==="
        show_services
        show_tasks
        sleep 3
    done
}

# Main menu
case "${1:-menu}" in
    "status"|"s")
        show_services
        ;;
    "tasks"|"t")
        show_tasks
        ;;
    "logs"|"l")
        show_logs
        ;;
    "health"|"h")
        show_health
        ;;
    "monitor"|"m")
        monitor_realtime
        ;;
    "stack")
        manage_stack "$2"
        ;;
    "all"|"a")
        show_services
        show_tasks
        show_logs
        show_health
        ;;
    *)
        echo "Usage: $0 [option]"
        echo
        echo "Options:"
        echo "  s|status  - Show service status"
        echo "  t|tasks   - Show detailed task status"
        echo "  l|logs    - Show recent logs"
        echo "  h|health  - Show health check configuration"
        echo "  m|monitor - Real-time monitoring"
        echo "  stack     - Manage stack lifecycle (stop/restart/deploy/update)"
        echo "  a|all     - Show all information"
        echo
        echo "Examples:"
        echo "  $0 status           # Quick status check"
        echo "  $0 monitor          # Real-time monitoring"
        echo "  $0 stack stop       # Stop the stack"
        echo "  $0 stack restart    # Restart the stack"
        echo "  $0 stack deploy     # Deploy/start the stack"
        echo "  $0 stack update     # Force update services"
        echo "  $0 all              # Full diagnostic"
        ;;
esac
