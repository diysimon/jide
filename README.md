# 记得 - 阿尔兹海默症大脑训练系统
# Jide - Alzheimer's Brain Training System

<p align="center">
  <img src="https://img.shields.io/badge/license-AGPL3-blue.svg" alt="license">
  <img src="https://img.shields.io/github/stars/diysimon/jide" alt="stars">
  <img src="https://img.shields.io/github/forks/diysimon/jide" alt="forks">
</p>

> 用科技守护记忆，让爱不被遗忘
> Protect memories with technology, let love not be forgotten

## 📖 项目简介 / Project Introduction

**中文：**

Jide 是一个开源的、基于 Web 技术的大脑训练平台，专为阿尔茨海默症患者设计。通过科学设计的认知训练游戏和练习，帮助患者延缓病情发展，保持大脑活跃度。

**English:**

Jide is an open-source, Web-based brain training platform designed specifically for Alzheimer's patients. Through scientifically designed cognitive training games and exercises, it helps patients delay disease progression and maintain brain activity.

## ✨ 核心特性 / Core Features

| 中文 | English |
|------|---------|
| **24种训练方式** - 覆盖记忆力、注意力、逻辑思维、语言能力、执行功能、情绪感知六大认知维度 | **24 Training Modes** - Covering memory, attention, logic, language, executive function, and emotion |
| **难度自适应** - 根据用户表现智能调整难度 | **Adaptive Difficulty** - Intelligently adjusts based on performance |
| **成就系统** - 激励持续训练 | **Achievement System** - Motivates continuous training |
| **适老化设计** - 大字体、高对比度 | **Senior-Friendly** - Large fonts, high contrast |

## 🧠 训练模块 / Training Modules

| 维度 Dimension | 训练方式 Training | 数量 Count |
|-----|---------|-----|
| 记忆力 Memory | 卡片配对、数字记忆、图片顺序、人脸姓名等 | 8种 |
| 注意力 Attention | 舒尔特方格、找不同、视觉搜索、追踪目标 | 4种 |
| 逻辑思维 Logic | 图形推理、数独入门、序列找规律、分类游戏 | 4种 |
| 语言能力 Language | 词语接龙、造句练习、看图说话 | 3种 |
| 执行功能 Executive | 双重任务、停止-开始、计划安排 | 3种 |
| 情绪感知 Emotion | 音乐感知、颜色情绪匹配 | 2种 |

## 🚀 快速开始 / Quick Start

### 环境要求 / Requirements
- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装 / Installation

```bash
# 克隆项目 / Clone project
git clone git@github.com:diysimon/jide.git
cd jide

# 安装依赖 / Install dependencies
npm install

# 启动开发服务器 / Start dev server
npm run dev
```

访问 Visit http://localhost:5173 开始使用 to start.

### 构建生产版本 / Build for Production

```bash
npm run build
```

## 📁 项目结构 / Project Structure

```
jide/
├── public/                  # 静态资源 / Static assets
├── src/
│   ├── components/         # Vue组件 / Vue components
│   ├── views/               # 页面视图 / Page views
│   ├── stores/              # 状态管理 / State management
│   └── router/              # 路由配置 / Router config
├── doc/                     # 设计文档 / Design docs
│   ├── 需求文档.md          # 需求规格 / Requirements
│   └── 技术设计/            # 技术文档 / Tech docs
├── tests/                   # 测试文件 / Tests
└── CONTRIBUTING.md          # 贡献指南 / Contributing guide
```

## 📚 文档 / Documentation

- [需求文档](doc/需求文档.md) - 完整需求规格 / Complete requirements
- [API设计](doc/技术设计-API接口设计.md) - 接口文档 / API docs
- [前端设计](doc/技术设计-前端组件设计.md) - 组件设计 / Component design
- [部署指南](doc/技术设计-部署指南.md) - 部署文档 / Deployment guide

## 🤝 贡献 / Contributing

欢迎任何形式的贡献！请阅读 [贡献指南](CONTRIBUTING.md) 了解更多。

We welcome contributions! Please read the [Contributing Guide](CONTRIBUTING.md) for more details.

## 📄 许可证 / License

本项目采用 AGPL3 许可证 - 详见 [LICENSE](LICENSE) 文件。

This project is licensed under AGPL3 - see the [LICENSE](LICENSE) file for details.

## 🙏 致谢 / Acknowledgments

- 感谢所有阿尔茨海默症患者和照护者的信任
- 感谢开源社区的支持
- 感谢每一位贡献者
- Thanks to all Alzheimer's patients and caregivers for their trust
- Thanks to the open source community
- Thanks to every contributor

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/diysimon">diysimon</a>
</p>
