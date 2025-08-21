#!/bin/bash

# GRY Demo 项目一键部署脚本
# 支持 Linux/macOS/Windows(WSL)

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查命令是否存在
check_command() {
    if ! command -v $1 &> /dev/null; then
        log_error "$1 未找到，请先安装"
        return 1
    fi
    return 0
}

# 检查端口是否被占用
check_port() {
    local port=$1
    local service_name=$2
    
    if netstat -tuln 2>/dev/null | grep -q ":$port " || ss -tuln 2>/dev/null | grep -q ":$port "; then
        log_warning "端口 $port 已被占用 ($service_name)"
        log_info "尝试释放端口..."
        
        # 尝试杀死占用端口的进程
        local pid=$(lsof -ti:$port 2>/dev/null || true)
        if [ ! -z "$pid" ]; then
            kill -9 $pid 2>/dev/null || true
            sleep 1
            log_success "端口 $port 已释放"
        fi
    fi
}

# 环境检查
check_environment() {
    log_info "检查运行环境..."
    
    # 检查Node.js
    if ! check_command "node"; then
        log_error "Node.js 未安装。请访问 https://nodejs.org/ 下载安装"
        exit 1
    fi
    
    local node_version=$(node --version | cut -d'v' -f2)
    local major_version=$(echo $node_version | cut -d'.' -f1)
    
    if [ "$major_version" -lt 16 ]; then
        log_error "Node.js 版本太低 ($node_version)，需要 16.0 或更高版本"
        exit 1
    fi
    
    log_success "Node.js 版本检查通过: v$node_version"
    
    # 检查npm
    if ! check_command "npm"; then
        log_error "npm 未安装"
        exit 1
    fi
    
    log_success "npm 版本: $(npm --version)"
    
    # 检查Java (可选)
    if check_command "java"; then
        log_success "Java 版本: $(java -version 2>&1 | head -n1)"
    else
        log_warning "Java 未安装 (Spring Boot原生版本需要Java)"
    fi
    
    # 检查Docker (可选)
    if check_command "docker"; then
        log_success "Docker 版本: $(docker --version)"
    else
        log_warning "Docker 未安装 (容器化部署需要Docker)"
    fi
}

# 停止现有服务
stop_services() {
    log_info "停止现有服务..."
    
    # 停止可能运行的Node.js服务
    pkill -f "test-server.js" 2>/dev/null || true
    pkill -f "kafka-demo-server.js" 2>/dev/null || true
    pkill -f "frontend-server.js" 2>/dev/null || true
    pkill -f "kafka-frontend-server.js" 2>/dev/null || true
    
    # 等待进程结束
    sleep 2
    
    # 检查并释放端口
    check_port 8080 "后端API服务"
    check_port 8081 "Kafka演示服务"
    check_port 3000 "前端服务"
    check_port 3001 "Kafka演示前端"
    
    log_success "现有服务已停止"
}

# 安装前端依赖
install_frontend_deps() {
    if [ -d "gry-project/frontend" ]; then
        log_info "安装前端依赖..."
        cd gry-project/frontend
        
        # 清理旧的依赖
        rm -rf node_modules package-lock.json 2>/dev/null || true
        
        # 安装依赖
        npm install --legacy-peer-deps --silent
        
        if [ $? -eq 0 ]; then
            log_success "前端依赖安装成功"
        else
            log_warning "前端依赖安装失败，将使用简化版本"
        fi
        
        cd ../..
    fi
}

# 启动服务
start_services() {
    log_info "启动所有服务..."
    
    # 启动后端API服务 (端口8080)
    log_info "启动后端API服务 (端口8080)..."
    nohup node test-server.js > logs/backend-api.log 2>&1 &
    echo $! > pids/backend-api.pid
    
    # 等待服务启动
    sleep 2
    
    # 检查服务是否启动成功
    if curl -s http://localhost:8080/actuator/health > /dev/null; then
        log_success "后端API服务启动成功 (http://localhost:8080)"
    else
        log_error "后端API服务启动失败"
        return 1
    fi
    
    # 启动Kafka演示服务 (端口8081)
    log_info "启动Kafka演示服务 (端口8081)..."
    nohup node kafka-demo-server.js > logs/kafka-backend.log 2>&1 &
    echo $! > pids/kafka-backend.pid
    
    sleep 2
    
    if curl -s http://localhost:8081/actuator/health > /dev/null; then
        log_success "Kafka演示服务启动成功 (http://localhost:8081)"
    else
        log_error "Kafka演示服务启动失败"
        return 1
    fi
    
    # 启动前端服务 (端口3000)
    log_info "启动前端测试服务 (端口3000)..."
    nohup node frontend-server.js > logs/frontend.log 2>&1 &
    echo $! > pids/frontend.pid
    
    sleep 1
    
    if curl -s http://localhost:3000 > /dev/null; then
        log_success "前端测试服务启动成功 (http://localhost:3000)"
    else
        log_error "前端测试服务启动失败"
        return 1
    fi
    
    # 启动Kafka演示前端 (端口3001)
    log_info "启动Kafka演示前端 (端口3001)..."
    nohup node kafka-frontend-server.js > logs/kafka-frontend.log 2>&1 &
    echo $! > pids/kafka-frontend.pid
    
    sleep 1
    
    if curl -s http://localhost:3001 > /dev/null; then
        log_success "Kafka演示前端启动成功 (http://localhost:3001)"
    else
        log_error "Kafka演示前端启动失败"
        return 1
    fi
}

# 健康检查
health_check() {
    log_info "执行健康检查..."
    
    local all_healthy=true
    
    # 检查后端API
    if curl -s http://localhost:8080/actuator/health | grep -q "UP"; then
        log_success "✅ 后端API服务健康"
    else
        log_error "❌ 后端API服务异常"
        all_healthy=false
    fi
    
    # 检查Kafka服务
    if curl -s http://localhost:8081/actuator/health | grep -q "UP"; then
        log_success "✅ Kafka演示服务健康"
    else
        log_error "❌ Kafka演示服务异常"
        all_healthy=false
    fi
    
    # 检查前端服务
    if curl -s http://localhost:3000 | grep -q "GRY Demo"; then
        log_success "✅ 前端测试服务健康"
    else
        log_error "❌ 前端测试服务异常"
        all_healthy=false
    fi
    
    # 检查Kafka前端
    if curl -s http://localhost:3001 | grep -q "Kafka"; then
        log_success "✅ Kafka演示前端健康"
    else
        log_error "❌ Kafka演示前端异常"
        all_healthy=false
    fi
    
    if $all_healthy; then
        log_success "🎉 所有服务健康检查通过！"
        return 0
    else
        log_error "⚠️ 部分服务健康检查失败"
        return 1
    fi
}

# 显示部署结果
show_deployment_info() {
    echo ""
    echo "======================================================"
    echo -e "${GREEN}🎉 GRY Demo 部署完成！${NC}"
    echo "======================================================"
    echo ""
    echo -e "${BLUE}📱 访问地址：${NC}"
    echo -e "  • 前端测试页面: ${GREEN}http://localhost:3000${NC}"
    echo -e "  • Kafka异步演示: ${GREEN}http://localhost:3001${NC} ${YELLOW}(重点推荐)${NC}"
    echo -e "  • 后端API服务:  ${GREEN}http://localhost:8080${NC}"
    echo -e "  • Kafka演示API: ${GREEN}http://localhost:8081${NC}"
    echo ""
    echo -e "${BLUE}🔧 管理命令：${NC}"
    echo -e "  • 查看状态: ${YELLOW}./deploy.sh status${NC}"
    echo -e "  • 停止服务: ${YELLOW}./deploy.sh stop${NC}"
    echo -e "  • 重启服务: ${YELLOW}./deploy.sh restart${NC}"
    echo -e "  • 查看日志: ${YELLOW}./deploy.sh logs${NC}"
    echo ""
    echo -e "${BLUE}🎯 功能特性：${NC}"
    echo -e "  • ✅ 5个核心RESTful API"
    echo -e "  • ✅ Kafka异步消息处理"
    echo -e "  • ✅ 事件驱动架构"
    echo -e "  • ✅ 多表关联查询"
    echo -e "  • ✅ 分页查询支持"
    echo -e "  • ✅ 统一异常处理"
    echo -e "  • ✅ CORS跨域支持"
    echo -e "  • ✅ 实时监控界面"
    echo ""
    echo -e "${YELLOW}💡 建议先访问 http://localhost:3001 体验Kafka异步处理功能！${NC}"
    echo ""
}

# 查看服务状态
show_status() {
    echo "======================================================"
    echo -e "${BLUE}📊 GRY Demo 服务状态${NC}"
    echo "======================================================"
    
    # 检查进程
    local backend_pid=$(cat pids/backend-api.pid 2>/dev/null || echo "")
    local kafka_pid=$(cat pids/kafka-backend.pid 2>/dev/null || echo "")
    local frontend_pid=$(cat pids/frontend.pid 2>/dev/null || echo "")
    local kafka_frontend_pid=$(cat pids/kafka-frontend.pid 2>/dev/null || echo "")
    
    echo ""
    echo -e "${BLUE}🔧 进程状态：${NC}"
    
    if [ ! -z "$backend_pid" ] && kill -0 "$backend_pid" 2>/dev/null; then
        echo -e "  • 后端API服务 (PID: $backend_pid): ${GREEN}运行中${NC}"
    else
        echo -e "  • 后端API服务: ${RED}已停止${NC}"
    fi
    
    if [ ! -z "$kafka_pid" ] && kill -0 "$kafka_pid" 2>/dev/null; then
        echo -e "  • Kafka演示服务 (PID: $kafka_pid): ${GREEN}运行中${NC}"
    else
        echo -e "  • Kafka演示服务: ${RED}已停止${NC}"
    fi
    
    if [ ! -z "$frontend_pid" ] && kill -0 "$frontend_pid" 2>/dev/null; then
        echo -e "  • 前端服务 (PID: $frontend_pid): ${GREEN}运行中${NC}"
    else
        echo -e "  • 前端服务: ${RED}已停止${NC}"
    fi
    
    if [ ! -z "$kafka_frontend_pid" ] && kill -0 "$kafka_frontend_pid" 2>/dev/null; then
        echo -e "  • Kafka前端 (PID: $kafka_frontend_pid): ${GREEN}运行中${NC}"
    else
        echo -e "  • Kafka前端: ${RED}已停止${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}🌐 端口状态：${NC}"
    
    # 检查端口
    for port in 8080 8081 3000 3001; do
        if netstat -tuln 2>/dev/null | grep -q ":$port " || ss -tuln 2>/dev/null | grep -q ":$port "; then
            echo -e "  • 端口 $port: ${GREEN}已监听${NC}"
        else
            echo -e "  • 端口 $port: ${RED}未监听${NC}"
        fi
    done
    
    echo ""
    
    # 执行健康检查
    health_check
}

# 查看日志
show_logs() {
    echo "======================================================"
    echo -e "${BLUE}📋 GRY Demo 服务日志${NC}"
    echo "======================================================"
    
    for service in backend-api kafka-backend frontend kafka-frontend; do
        local log_file="logs/${service}.log"
        if [ -f "$log_file" ]; then
            echo ""
            echo -e "${YELLOW}📄 $service 日志 (最新10行):${NC}"
            echo "------------------------------------------------------"
            tail -10 "$log_file"
        else
            echo -e "${RED}❌ $service 日志文件不存在${NC}"
        fi
    done
}

# 完全停止服务
stop_all_services() {
    log_info "停止所有GRY Demo服务..."
    
    # 根据PID文件停止服务
    for service in backend-api kafka-backend frontend kafka-frontend; do
        local pid_file="pids/${service}.pid"
        if [ -f "$pid_file" ]; then
            local pid=$(cat "$pid_file")
            if kill -0 "$pid" 2>/dev/null; then
                kill "$pid" 2>/dev/null || true
                log_info "停止 $service (PID: $pid)"
            fi
            rm -f "$pid_file"
        fi
    done
    
    # 强制杀死相关进程
    pkill -f "test-server.js" 2>/dev/null || true
    pkill -f "kafka-demo-server.js" 2>/dev/null || true
    pkill -f "frontend-server.js" 2>/dev/null || true
    pkill -f "kafka-frontend-server.js" 2>/dev/null || true
    
    sleep 2
    
    log_success "所有服务已停止"
}

# 主部署函数
deploy() {
    echo "======================================================"
    echo -e "${BLUE}🚀 GRY Demo 一键部署脚本${NC}"
    echo -e "${BLUE}   全栈演示应用 | Spring Boot + React + Kafka${NC}"
    echo "======================================================"
    
    # 创建必要目录
    mkdir -p logs pids
    
    # 环境检查
    check_environment
    
    # 停止现有服务
    stop_services
    
    # 安装依赖 (可选)
    # install_frontend_deps
    
    # 启动服务
    start_services
    
    # 健康检查
    health_check
    
    # 显示部署结果
    show_deployment_info
}

# 主程序
main() {
    case "${1:-deploy}" in
        "deploy" | "start")
            deploy
            ;;
        "stop")
            stop_all_services
            ;;
        "restart")
            stop_all_services
            sleep 2
            deploy
            ;;
        "status")
            show_status
            ;;
        "logs")
            show_logs
            ;;
        "health")
            health_check
            ;;
        "help" | "-h" | "--help")
            echo "GRY Demo 部署脚本使用说明："
            echo ""
            echo "  ./deploy.sh          # 一键部署 (默认)"
            echo "  ./deploy.sh start    # 启动服务"
            echo "  ./deploy.sh stop     # 停止服务" 
            echo "  ./deploy.sh restart  # 重启服务"
            echo "  ./deploy.sh status   # 查看状态"
            echo "  ./deploy.sh logs     # 查看日志"
            echo "  ./deploy.sh health   # 健康检查"
            echo "  ./deploy.sh help     # 显示帮助"
            echo ""
            ;;
        *)
            log_error "未知命令: $1"
            log_info "使用 './deploy.sh help' 查看帮助"
            exit 1
            ;;
    esac
}

# 执行主程序
main "$@"