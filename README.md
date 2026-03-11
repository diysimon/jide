# Jide - 阿尔兹海默症大脑训练系统

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="license">
  <img src="https://img.shields.io/github/stars/diysimon/jide" alt="stars">
  <img src="https://img.shields.io/github/forks/diysimon/jide" alt="forks">
</p>

> 用科技守护记忆，让爱不被遗忘

## 📖 项目简介

Jide 是一个开源的、基于 Web 技术的大脑训练平台，专为阿尔茨海默症患者设计。通过科学设计的认知训练游戏和练习，帮助患者延缓病情发展，保持大脑活跃度。

## ✨ 核心特性

- **24种训练方式** - 覆盖记忆力、注意力、逻辑思维、语言能力、执行功能、情绪感知六大认知维度
- **难度自适应** - 根据用户表现智能调整难度，确保训练效果
- **成就系统** - 60+成就激励，持续保持训练动力
- **家属支持** - 家人可查看训练数据，提供远程关怀
- **适老化设计** - 大字体、语音播报、高对比度，关爱老年用户

## 🧠 训练模块

| 维度 | 训练方式 | 数量 |
|-----|---------|-----|
| 记忆力 | 卡片配对、数字记忆、图片顺序、人脸姓名等 | 8种 |
| 注意力 | 舒尔特方格、找不同、视觉搜索、追踪目标 | 4种 |
| 逻辑思维 | 图形推理、数独入门、序列找规律、分类游戏 | 4种 |
| 语言能力 | 词语接龙、造句练习、看图说话 | 3种 |
| 执行功能 | 双重任务、停止-开始、计划安排 | 3种 |
| 情绪感知 | 音乐感知、颜色情绪匹配 | 2种 |

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装

```bash
# 克隆项目
git clone git@github.com:diysimon/jide.git
cd jide

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 http://localhost:5173 开始使用。

### 构建生产版本

```bash
npm run build
```

## 📁 项目结构

```
jide/
├── public/                  # 静态资源
├── src/
│   ├── components/         # Vue组件
│   ├── views/               # 页面视图
│   ├── stores/              # 状态管理
│   └── router/              # 路由配置
├── doc/                     # 设计文档
│   ├── 需求文档.md          # 需求规格
│   ├── design/             # 详细设计
│   ├── 系统设计/            # 系统级设计
│   └── 技术设计/            # 技术文档
├── tests/                   # 测试文件
└── CONTRIBUTING.md          # 贡献指南
```

## 📚 文档

- [需求文档](doc/需求文档.md) - 完整需求规格
- [API设计](doc/技术设计-API接口设计.md) - 接口文档
- [前端设计](doc/技术设计-前端组件设计.md) - 组件设计
- [数据库设计](doc/技术设计-数据库设计.md) - 数据结构
- [部署指南](doc/技术设计-部署指南.md) - 部署文档

## 🤝 贡献

欢迎任何形式的贡献！请阅读 [贡献指南](CONTRIBUTING.md) 了解更多。

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件。

## 🙏 致谢

- 感谢所有阿尔茨海默症患者和照护者的信任
- 感谢开源社区的支持
- 感谢每一位贡献者

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/diysimon">diysimon</a>
</p>
