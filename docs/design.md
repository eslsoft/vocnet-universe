# VocNet Universe 架构设计说明 (v20.2)

## 1. 核心视觉哲学：Stellar Universe
项目采用“恒星宇宙”隐喻，将英语词汇体系模拟为大规模 3D 星系。
- **Galaxy (L1 - 紫色)**: 顶级中枢词 (Root Concepts)，覆盖面最广。
- **Nebula (L2 - 蓝色)**: 大型分类词 (Topic Centers)，知识的骨架。
- **Star (L3 - 琥珀色)**: 核心实义词 (Common Words)。
- **Planet (L4 - 绿色)**: 具体词/叶子词 (Specific Instances)，默认隐藏，通过交互激活。

## 2. 局部交互：原子隔离与横向流 (Lateral Flow)
为了解决万词规模下的视觉混乱，项目确立了以下交互标准：
- **物理删除隔离**: 选中单词时，非关联节点和连线将被物理移除，仅保留“逻辑原子”。
- **空间对齐布局**: 
    - **中心**: 被选中词 (Selected Node)。
    - **左侧 (x: -500)**: 所有的上位分类 (Is-A / Parents)。
    - **右侧 (x: 500)**: 所有的子类与部位 (Has-Kind / Has-Part / Children)。
    - **上方/下方**: 场景、动作与属性关联。
- **引用持久化**: 保持 D3 物理引擎中的对象引用一致性，确保拖拽时连线不脱落。

## 3. 数据层：混合常识引擎 (Hybrid Intelligence)
- **WordNet**: 负责严谨的层级溯源与解剖学关系（通过递归跳跃实现实词连接）。
- **ConceptNet**: 负责横向常识（AtLocation, UsedFor 等），采用 `weight > 1.5` 的高置信度过滤。
- **语义防弹 (Bulletproof Logic)**:
    - **义项锚定**: 对核心高频词进行手动义项锁定 (SENSE_HINTS)。
    - **物种隔离**: 严禁生物物种（如鸭子）混入另一物种（如鱼）的解剖结构。
    - **向量校验**: 建立连线前通过 Cosine Similarity 进行语义相关性二次验证。

## 4. UI 控制：全连接同步 (Total Control)
底部的 Legend（图例）不仅是说明，更是实时过滤器。
- **Nodes 控制**: 一键开关不同能量等级的单词。
- **Links 控制**: 10 个维度的关系开关，点击即触发物理引擎的增量重组。