Vocab Verse - 沉浸式词汇星系技术设计文档 (Production Ready)

版本: 2.5.0 (3D WebGL Spec)
日期: 2026-02-05
状态: 开发中 (Ready for Coding)

变更摘要:
- 3D 渲染方案确定 (react-force-graph-3d + Three.js)
- 补充相机控制、3D LOD 与性能约束
- 修正力场配置示例 (react-force-graph 正确用法)
- 增补 API/数据契约、性能指标、风险与测试方案

1. 项目概述 (Project Overview)

Vocab Verse 是一个基于 WebGL 的高性能沉浸式词汇知识图谱应用。它摒弃了传统的列表式学习，利用宇宙星系的视觉隐喻，将 10,000+ 个英语单词根据语义关系可视化为深空中的恒星系统。

核心价值:

宏观不乱 (Macro Clarity): 通过 5 层宇宙模型解决大规模数据的“毛球效应”，让知识结构清晰可见。

微观不卡 (Micro Performance): 使用 WebGL 渲染引擎支撑万级节点流畅交互 (60FPS)。

物理交互 (Physics Feedback): 实现基于引力的拖拽、跟随和排斥效果，增强记忆的“牵引感”。

语义归类 (Semantic Anchors): 支持按“地点、人物、动作”等维度自动归类，构建平行宇宙。

AI 赋能 (AI Integration): 集成 Gemini API，提供实时的单词深度解析和同义词扩展。

范围 (Scope):
- 覆盖 10,000+ 英语核心词汇，提供多视角语义组织与交互式探索。
- 前端本地渲染为主，后端仅负责用户进度与 AI 代理。

非目标 (Non-Goals):
- 不做完整词典/课程体系。
- 不提供多人实时协作编辑图谱能力。

2. 系统架构 (System Architecture)

采用 "Static Topology + Dynamic State" (静态拓扑 + 动态状态) 的混合架构，以确保极致的前端性能和极低的后端压力。

2.1 架构数据流

离线层 (Python ETL):

输入：词频表 (Oxford 3000/5000) + ConceptNet 数据。

处理：计算词向量、执行分层聚类/锚点归类、构建图谱骨架。

输出：生成静态的 universe_graph.json。

传输层 (CDN):

通过 CDN 分发压缩后的 JSON 静态文件 (Gzip/Brotli)。

渲染层 (Client - React + WebGL 3D):

前端加载 JSON。

react-force-graph-3d 负责 WebGL 渲染和实时物理模拟 (Three.js)。

业务层 (API Server):

轻量级 Node.js/Go 服务。

负责存储用户进度 (mastered_ids)，并实时“覆盖”在静态地图上。

智能层 (Google Cloud):

后端代理转发前端的 Gemini API 请求，保护 API Key。

3. 技术栈选型 (Technology Stack)

3.1 前端 (核心)

框架: React 18+ (Vite 构建)

可视化引擎 (关键): react-force-graph-3d (WebGL/Three.js)
渲染核心: Three.js (由 react-force-graph-3d 内置)

选型理由: 底层基于 Three.js/WebGL，只有它能在普通设备上流畅渲染 10,000+ 动态节点。Canvas 原生 API 性能不足，SVG 会导致 DOM 爆炸。

物理引擎: d3-force (内置于 react-force-graph 中)

状态管理: Zustand (管理全局 Filter、Search 状态和用户进度)

UI 组件: Tailwind CSS + Lucide React (图标)

3.2 后端 (数据处理)

语言: Python 3.9+

NLP 库 (核心): spaCy (en_core_web_md), scikit-learn (K-Means, Cosine Similarity)

NLP 库 (增强): nltk (WordNet)

用途: 用于分类结果的二次校验 (Validation) 和提取精确的上下位关系 (Hypernyms)。

图算法: networkx

4. 数据层设计 (Data Schema) & 构建策略

为了适配 WebGL 渲染和物理引擎，数据结构需严格遵循以下 5 层模型。

4.1 宇宙层级模型 (The 5-Level Hierarchy)

层级

宇宙对应

数量级

物理属性 (d3-force 配置)

可见性 (LOD 阈值)

L0

Root (根)

2-3

固定锚点 (fx, fy 锁定)

始终可见 (背景光晕)

L1

Galaxy (星系)

~20

强引力中心，极大排斥力

Zoom > 0.1

L2

Nebula (星云)

~100

中等引力，围绕星系

Zoom > 0.5

L3

Star (恒星)

~2,500

核心词汇，普通物理实体

Zoom > 1.0

L4

Planet (行星)

~7,500

轻量级，紧密跟随 L3

Zoom > 2.5

4.2 JSON 数据结构规范

文件: public/data/universe_graph.json

{
  "version": "2.3",
  "meta": {
    "nodeCount": 10500,
    // 定义可用的筛选维度，对应前端 UI 的 Filter 下拉框
    "categories": ["Location", "People", "Time", "Action", "Emotion", "Nature", "Abstract"]
    // 可选: 预计算的全局统计
    // "levelCounts": {"0": 3, "1": 20, "2": 100, "3": 2500, "4": 7800}
  },
  "nodes": [
    {
      "id": "w_hospital",
      "label": "Hospital",
      "level": 3,           // 物理层级：决定大小、LOD
      "val": 15,            // 视觉半径权重
      
      // 预计算的多种分类维度 (关键更新)
      "grouping": {
        "semantic": "Health",      // 纯语义聚类结果 (默认视图)
        "category": "Location",    // 锚点分类结果 (分类视图)
        "pos": "Noun"              // 词性 (语法视图)
      },
      
      // 预计算初始坐标 (减少前端冷启动计算)
      "x": 100.4,
      "y": -50.2,
      "z": 20.0
    }
  ],
  "links": [
    {
      "source": "w_hospital",
      "target": "w_doctor",
      "type": "hierarchy"  // hierarchy(骨架强连线) 或 semantic(语义弱连线)
    }
  ]
}

补充约定:
- id 必须全局唯一，建议前缀 w_/g_/n_ 区分层级 (word/galaxy/nebula)。
- level 与 val 必须存在，用于 LOD 与碰撞半径计算。
- grouping.* 字段可以为空，空值节点默认归类到 "Abstract"。
- links 中 semantic 连线需限制最大数量 (例如每节点前 3-5 条)，避免性能与可视混乱。

索引建议 (前端运行时生成):
- nodeById: Map<id, node>
- nodesByLevel: Map<level, node[]>
- nodesByCategory: Map<category, node[]>


4.3 后端构建流水线 (核心算法)

采用 Hybrid Classification Pipeline (混合分类流水线)：先用 spaCy 粗分，再用 WordNet 精修。

算法逻辑 (Python):

定义星系锚点 (Define Galaxy Anchors):

galaxy_anchors = {
    "Location": nlp("place city country room where area spot building"),
    "People":   nlp("person human man woman child job family doctor teacher"),
    # ... (其他分类)
}


Phase 1: 向量粗分 (spaCy):
遍历 10,000 个目标单词，计算它与 Anchor 的 cosine_similarity。

初步结果: 快速得到每个词最可能的分类。

Phase 2: WordNet 校验 (NLTK - New Step):
对于相似度得分较低 (e.g., < 0.6) 或模棱两可的词，调用 WordNet 进行路径分析。

逻辑: 检查单词在 WordNet 中的上位词路径 (Hypernym Paths)。

Rule: 如果路径中包含 synset('person.n.01')，强制归类为 People，即使向量相似度不高。

Benefit: 这能修正“Robot (机器人)”被向量误判为“People”的情况，或者确认“Ghost (鬼)”是否属于“People”。

层级细分 (Nebula Generation):
在确定的星系内部，运行 K-Means (k=5) 生成子星云。

构建连线:

强引力线 (Skeleton): 单词 -> 所属星云中心 -> 所属星系中心。

弱引力线 (Wormhole): 跨星系的高相似度连线。

4.4 前端混合模式交互

前端不再是一张死图，而是可以动态切换视图：

交互逻辑: 用户在 UI 上点击 "View by Category" 时，前端遍历所有节点，读取 node.grouping.category 字段，重新分配节点的颜色 (node.color) 和所属引力中心 (d3Force center)。

视觉效果: 单词会像流星一样，从“语义星系”飞到“分类星系”去，重新组装成新的宇宙。

5. 本地开发指南 (Implementation Guide)

5.1 步骤一：前端初始化与 3D WebGL 配置

安装:

npm install react-force-graph-3d three d3-force


组件实现逻辑 (CosmicGraph.tsx):

<ForceGraph3D
  graphData={data}
  backgroundColor="#0f172a"
  
  // 1. 物理引擎参数配置
  d3VelocityDecay={0.2} // 阻尼：0.2 比较有粘性，防止震荡
  d3AlphaDecay={0.02}   // 冷却时间
  
  // 2. 自定义力场 (复刻层级引力)
  // 注意: react-force-graph 的 d3Force 用法需要传入 d3-force 实例
  // const charge = d3.forceManyBody().strength(node => (node.level === 1 ? -600 : -30));
  // const link = d3.forceLink().id(d => d.id).distance(link => {
  //   const minLevel = Math.min(link.source.level, link.target.level);
  //   return (4 - minLevel) * 30;
  // });
  // graphRef.current?.d3Force("charge", charge);
  // graphRef.current?.d3Force("link", link);

  // 3. 3D 渲染与 LOD (基于 cameraDistance)
  // const cameraDistance = graphRef.current?.camera().position.length() ?? 0;
  // nodeThreeObject={node => {
  //   if (cameraDistance > 200 && node.level > 2) return null;
  //   if (cameraDistance > 120 && node.level > 3) return null;
  //   // 返回 THREE.Mesh (SphereGeometry + MeshBasicMaterial)
  // }}
/>


5.2 步骤二：后端数据脚本 (Python)

请在 backend/ 目录下创建脚本 build_universe.py。

加载数据: spacy.load('en_core_web_md') 和 nltk.download('wordnet')。

定义 Anchors: 按照 4.3 节的代码定义锚点。

计算: 循环 10,000 次，结合 spaCy 相似度和 WordNet 路径校验，计算分类。

导出: 生成符合 4.2 节结构的 universe_graph.json。

5.3 步骤三：Gemini AI 集成

创建 API Route (/api/gemini/analyze)。

Prompt 设计:
Analyze the word "{word}". Return a JSON object with: { "definition": "...", "etymology": "...", "synonyms": ["...", "..."], "example": "..." }

前端调用: 点击节点 -> 侧边栏 Loading -> 显示解析结果。

5.4 步骤四：用户进度服务 (Progress API)

API 设计 (REST):
- GET /api/progress -> { mastered_ids: string[] }
- POST /api/progress -> { mastered_ids: string[] } (幂等覆盖)

说明:
- 只存用户对单词的掌握状态，不回写图谱结构。
- 使用 localStorage 做前端缓存，后端为主存。

5.5 前端模块划分 (建议)

src/
- features/graph/ (ForceGraph2D 集成、力场、LOD)
- features/ui/ (搜索、筛选、HUD)
- features/ai/ (Gemini 调用与结果缓存)
- store/ (Zustand: filter/view/selected/progress)
- data/ (加载与索引构建)

5.6 关键性能指标 (Performance Budget)
- 首屏加载: < 3.0s (gzip 后 JSON <= 8MB)
- 交互帧率: 45-60 FPS (常规笔记本)
- Force 计算收敛时间: < 4s
- GPU 占用: 高峰期 < 70% (桌面端)

5.7 风险与对策
- 风险: 语义连线过多导致性能下滑
  对策: 限制每节点 semantic 连线数量并抽样
- 风险: LOD 规则过激导致信息缺失
  对策: 使用渐变阈值 (0.5/1.5/2.5) 并提供 UI 提示
- 风险: AI 接口成本波动
  对策: 前端缓存 + 失败回退 (definition-only)

5.8 测试策略
- 数据层: 抽样校验分类准确率 (50-100 个词人工检查)
- 前端: LOD/筛选/搜索的单元测试 (Vitest)
- 后端: Progress API 的集成测试 (基本 CRUD)

6. 实施路线图 (Roadmap)

Day 1: 环境与数据

搭建 React + Vite 项目。

编写 Python 脚本，跑通 "Hybrid Classification" (spaCy + WordNet) 算法，生成第一版数据。

Day 2: 渲染与物理

引入 react-force-graph-2d。

调试 d3-force 参数，实现“果冻”手感。

实现 LOD 缩放显隐逻辑。

Day 3: 交互与多重宇宙

实现 "View Switcher" (切换语义视图/分类视图)。

实现 HUD (搜索框、筛选下拉菜单)。

对接 Gemini API。

7. 参考文献与链接 (References)

react-force-graph: https://github.com/vasturiano/react-force-graph (前端核心库)

spaCy Similarity: https://spacy.io/usage/vectors-similarity (后端分类核心)

NLTK WordNet: https://www.nltk.org/howto/wordnet.html (语义校验)

ConceptNet API: https://github.com/commonsense/conceptnet5/wiki/API (语义关系补充)

Google Gemini API: https://ai.google.dev/docs (AI 智能解析)
