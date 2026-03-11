#!/bin/bash
# 自动Coding脚本 - 每天执行

REPO_DIR="/home/diysimon/code/jide"
cd "$REPO_DIR"

echo "=== $(date) 自动Coding开始 ==="

# 检查是否有新文件需要添加
git status --short

# 如果有变更，自动提交
if [[ -n $(git status --short) ]]; then
    echo "📝 发现变更，准备提交..."
    
    # 添加所有变更
    git add -A
    
    # 生成提交信息（可以自定义）
    COMMIT_MSG="Auto-update: $(date +%Y-%m-%d %H:%M) - 系统自动更新"
    
    # 提交
    git commit -m "$COMMIT_MSG"
    
    # 推送到GitHub
    git push origin main 2>&1 || git push origin master 2>&1
    
    echo "✅ 已推送到GitHub"
else
    echo "📭 无变更，跳过提交"
fi

echo "=== $(date) 自动Coding完成 ==="
