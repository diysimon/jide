# Jide 贡献指南

感谢你对 Jide 项目的兴趣！我们欢迎任何形式的贡献。

---

## 1. 如何参与

### 1.1 报告问题
- 前往 [Issues](https://github.com/diysimon/jide/issues) 
- 搜索是否已有相同问题
- 创建新 Issue，包含：
  - 清晰的问题描述
  - 复现步骤
  - 环境和版本信息
  - 截图（如有）

### 1.2 功能建议
- 创建 Feature Request
- 描述你的想法
- 说明为什么这个功能有用

### 1.3 提交代码

#### 步骤 1: Fork 项目
点击页面右上角的 Fork 按钮。

#### 步骤 2: 克隆到本地
```bash
git clone git@github.com:你的用户名/jide.git
cd jide
```

#### 步骤 3: 创建分支
```bash
git checkout -b feature/你的功能名称
# 或
git checkout -b fix/问题描述
```

#### 步骤 4: 开发
```bash
npm install
npm run dev
```

#### 步骤 5: 提交
```bash
git add .
git commit -m 'feat: 添加新功能'
# 或
git commit -m 'fix: 修复问题'
```

#### 步骤 6: 推送
```bash
git push origin feature/你的功能名称
```

#### 步骤 7: 创建 PR
前往 GitHub 仓库，点击 "Compare & pull request"

---

## 2. 代码规范

### 2.1 代码风格
- 使用 ESLint + Prettier
- 运行 `npm run lint` 检查代码

### 2.2 提交信息规范
使用 [Conventional Commits](https://www.conventionalcommits.org/)：

```
feat: 新功能
fix: 修复问题
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建/工具更新
```

示例：
- `feat: 添加卡片配对训练`
- `fix: 修复舒尔特方格计时器`
- `docs: 更新API文档`

### 2.3 分支命名
- `feature/` 新功能
- `fix/` 修复
- `docs/` 文档
- `refactor/` 重构

---

## 3. 项目结构

```
jide/
├── public/              # 静态资源
├── src/
│   ├── components/      # Vue组件
│   ├── views/           # 页面
│   ├── stores/          # 状态管理
│   ├── router/          # 路由
│   ├── utils/           # 工具函数
│   └── styles/          # 样式
├── doc/                 # 文档
├── tests/               # 测试
└── README.md
```

---

## 4. 开发指南

### 4.1 添加新训练
1. 在 `src/views/training/` 创建组件
2. 在路由添加配置
3. 在训练列表添加入口
4. 编写对应的设计文档

### 4.2 添加新成就
1. 在 `doc/系统设计-成就系统.md` 添加定义
2. 在数据库添加记录
3. 实现解锁逻辑

---

## 5. 行为准则

### 5.1 我们承诺
- 尊重所有贡献者
- 欢迎新人参与
- 专业、友好地交流

### 5.2 不可接受的行为
- 人身攻击
- 歧视性言论
- 垃圾信息

---

## 6. 鸣谢

感谢所有为 Jide 做出贡献的人！

---

*文档版本：v1.0*  
*最后更新：2026-03-11*
