# VocNet Universe 未来进化路线图

> **核心愿景**: 从单一通用宇宙进化到多场景专业宇宙矩阵，让每个学习者都能找到最适合自己的词汇星空。

---

## 📊 当前状态 (Phase 0 - 已完成 ✅)

**底座架构建立** (Feb 2026)
- ✅ 模块化框架：可组合的数据源 + 处理器架构
- ✅ 4种数据源：WordNet, Spacy, LLM, ConceptNet
- ✅ 4种处理器：层级、语义、聚类、排序
- ✅ 3个基础构建器：Simple, LLM, Hybrid
- ✅ 统一CLI：`python cli.py build --builder [type]`
- ✅ 前端就绪：v4.0-static 格式完美集成

---

## 🚀 第一阶段：学习路径宇宙 (Q1 2026)

### 1.1 渐进学习宇宙 (Progressive Learning Universe) 📚

**目标用户**: ESL/EFL 学习者，零基础到高级

**核心理念**: 太阳系隐喻 = 学习旅程
```
太阳中心 (Sun)     → A1 基础 500词
内行星带           → A2 扩展 1000词
小行星带           → B1 中级 2000词
外行星带           → B2 中高级 3000词
柯伊伯带           → C1 高级 5000词
奥尔特云           → C2 精通 10000+词
```

**数据需求**:
- [ ] CEFR 分级词汇表 (Cambridge/Oxford)
- [ ] COCA/BNC 词频数据
- [ ] Age of Acquisition 分数
- [ ] 认知难度评级

**实现**:
```python
class CEFRDataSource(DataSource):
    """欧洲语言框架分级数据源"""

class ProgressiveLevelProcessor(Processor):
    """按CEFR等级分配空间位置"""

# 使用
python cli.py build --builder progressive \
  --level A1-B2 \
  --out universe_beginner.json
```

**成功指标**:
- 5000+ 词完成 CEFR 映射
- 用户测试显示清晰学习路径
- 与传统教材对比，记忆效率提升 >30%

---

### 1.2 考试备考宇宙 (Exam Prep Universe) 🎓

**目标用户**: GRE/TOEFL/IELTS/SAT 考生

**核心理念**: 按真题频率 + 考点分类组织

**宇宙变体**:
- **GRE Universe**: 3500 高频词，按真题出现次数排序
- **TOEFL Universe**: 2000 学术词汇，按学科分类
- **IELTS Universe**: 2500 英式英语词汇

**关键特性**:
- 历年真题频率热力图
- 同义词/反义词星团（考试常考）
- 按分数段推荐学习顺序

**数据需求**:
- [ ] 官方考试词表
- [ ] 历年真题词频统计
- [ ] 典型考试语境
- [ ] 同反义词对

**实现**:
```python
class ExamVocabSource(DataSource):
    exams = ['GRE', 'TOEFL', 'IELTS', 'SAT']

class ExamFrequencyProcessor(Processor):
    def rank_by_importance(self, word):
        return (
            exam_frequency * 0.5 +
            difficulty_match * 0.3 +
            topic_coverage * 0.2
        )

# 使用
python cli.py build --builder exam \
  --exam-type GRE \
  --target-score 160 \
  --out universe_gre.json
```

---

## 🌟 第二阶段：领域专家宇宙 (Q2 2026)

### 2.1 医学宇宙 (Medical Universe) 🏥

**目标用户**: 医学生、医护人员

**组织方式**: 按人体系统 + 临床路径
```
银河系：心血管系统 (Cardiovascular)
  ├─ 星团：解剖 (heart, artery, vein, ventricle)
  ├─ 星团：疾病 (hypertension, angina, atherosclerosis)
  ├─ 星团：治疗 (angioplasty, bypass, stent)
  └─ 星团：药物 (aspirin, statin, ACE inhibitor)
```

**数据需求**:
- [ ] MeSH (Medical Subject Headings)
- [ ] SNOMED CT 术语库
- [ ] 医学教材语料
- [ ] 临床笔记数据集

**关系增强**:
- `treats`: 药物 → 疾病
- `causes`: 病因 → 疾病
- `located_in`: 器官 → 系统
- `procedure_for`: 手术 → 疾病

---

### 2.2 技术宇宙 (Tech Universe) 💻

**目标用户**: 程序员、IT 从业者

**组织方式**: 按技术栈分层
```
Web开发星系
  ├─ 前端星团 (React, component, state, hook)
  ├─ 后端星团 (API, endpoint, middleware, ORM)
  └─ DevOps星团 (Docker, Kubernetes, CI/CD)
```

**数据需求**:
- [ ] GitHub 文档语料
- [ ] Stack Overflow 数据
- [ ] 技术术语数据库
- [ ] API 文档集合

---

### 2.3 商务宇宙 (Business Universe) 💼

**目标用户**: MBA 学生、商务人士

**组织方式**: 按业务职能
```
企业运营星系
  ├─ 市场营销 (branding, campaign, ROI)
  ├─ 财务管理 (revenue, expense, balance sheet)
  └─ 人力资源 (recruitment, retention, compensation)
```

---

## 🎭 第三阶段：场景化宇宙 (Q3 2026)

### 3.1 情境使用宇宙 (Contextual Usage Universe) 🌍

**目标用户**: 实用主义学习者

**核心理念**: 按真实使用场景组织
```
旅行场景星系
  ├─ 机场 (check-in, boarding pass, gate, customs)
  ├─ 酒店 (reservation, amenities, concierge)
  └─ 餐厅 (menu, order, bill, tip)
```

**每个词包含**:
- 典型对话片段
- 常见搭配
- 正式度标记
- 地区变体 (US/UK/AU)

**数据需求**:
- [ ] 对话语料库
- [ ] 影视字幕数据
- [ ] 旅游指南词汇
- [ ] 日常对话录音

---

### 3.2 搭配宇宙 (Collocation Universe) 🧩

**目标用户**: 高级学习者，追求地道表达

**核心理念**: 词汇不是孤立的，而是成群出现
```
动词中心："make"
  ├─ 强搭配 ✓ (make a decision, make progress)
  ├─ 典型搭配 (make an effort, make an attempt)
  └─ 常见错误 ❌ (make homework → use "do")
```

**视觉特色**:
- 线条粗细 = 搭配强度
- 红色虚线 = 错误搭配
- 绿色实线 = 正确替代

**数据需求**:
- [ ] Oxford Collocations Dictionary
- [ ] COCA 搭配统计
- [ ] 学习者错误数据库

---

## 🌳 第四阶段：词源宇宙 (Q4 2026)

### 4.1 词源探索宇宙 (Etymology Universe) 📜

**目标用户**: 语言爱好者、高级学习者

**核心理念**: 词根词缀树状可视化
```
词根星系: "spect" (看)
  ├─ inspect (in + spect) [1400年]
  ├─ spectator (spect + ator) [1500年]
  ├─ perspective (per + spect + ive) [1380年]
  └─ retrospect (retro + spect) [1600年]
```

**视觉设计**:
- 颜色 = 语言源头 (拉丁=红, 希腊=蓝, 日耳曼=绿)
- 饱和度 = 年代 (越古老越暗)
- 连线 = 派生关系

**数据需求**:
- [ ] Online Etymology Dictionary
- [ ] Wiktionary 词源数据
- [ ] 历史语言学数据库

---

## 🌈 第五阶段：多模态 + 个性化 (2027+)

### 5.1 多感官宇宙 (Multi-Sensory Universe) 🎨

**目标用户**: 儿童、视觉/听觉学习者

**增强要素**:
- 🖼️ 每个词配图
- 🔊 原生发音音频
- 🤲 动作/手势描述
- 💭 记忆口诀

**示例**:
```json
{
  "word": "apple",
  "visual": {"image": "🍎", "color": "red"},
  "auditory": {"ipa": "/ˈæp.əl/", "audio_url": "..."},
  "kinesthetic": {"gesture": "假装咬一口"},
  "mnemonic": "An Apple a day keeps the doctor away"
}
```

---

### 5.2 个性化宇宙 (Personalized Universe) 🎯

**核心理念**: 你的宇宙会"成长"

**自适应特性**:
- 已掌握的词 → 变小变暗
- 学习中的词 → 中等大小，高亮
- 未知的词 → 大而明亮
- 推荐学习 → 闪烁动画

**数据追踪**:
- 用户交互日志
- 测验/quiz 结果
- 停留时间分析
- 遗忘曲线模型

---

## 🛠️ 技术演进路线

### 数据源扩展
```
✅ WordNetSource        # 已完成
✅ SpacySource          # 已完成
✅ LLMSource            # 已完成
✅ ConceptNetSource     # 已完成
⬜ CEFRLevelSource      # Q1 2026
⬜ FrequencyDataSource  # Q1 2026
⬜ ExamVocabSource      # Q1 2026
⬜ DomainTermSource     # Q2 2026
⬜ CollocationSource    # Q3 2026
⬜ EtymologySource      # Q4 2026
⬜ MultiModalSource     # 2027
```

### 处理器扩展
```
✅ HierarchyProcessor         # 已完成
✅ SemanticProcessor          # 已完成
✅ ClusteringProcessor        # 已完成
✅ RankingProcessor           # 已完成
⬜ ProgressiveLevelProcessor  # Q1
⬜ ExamFrequencyProcessor     # Q1
⬜ DomainClusteringProcessor  # Q2
⬜ CollocationProcessor       # Q3
⬜ PersonalizationProcessor   # 2027
```

---

## 🎯 优先级矩阵

| 宇宙类型 | 教育价值 | 数据可得性 | 技术难度 | 优先级 |
|---------|---------|----------|---------|--------|
| Progressive Learning | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | **P0** |
| Exam Prep (GRE) | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | **P0** |
| Medical | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | **P1** |
| Tech | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | **P1** |
| Contextual Usage | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | **P2** |
| Collocation | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | **P2** |
| Etymology | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | **P2** |
| Multi-Sensory | ⭐⭐⭐⭐ | ⭐ | ⭐⭐⭐⭐ | **P3** |

---

## 📅 里程碑时间线

### 2026 Q1 (当前季度)
- [ ] Progressive Learning Universe 上线
- [ ] GRE Universe Beta 版
- [ ] CEFR 数据集成完成
- [ ] 前端学习路径可视化

### 2026 Q2
- [ ] Medical Universe 基础版
- [ ] Tech Universe 基础版
- [ ] 音频播放集成
- [ ] 用户进度追踪系统

### 2026 Q3
- [ ] Contextual Usage Universe
- [ ] Collocation Universe
- [ ] 交互式 Quiz 模式
- [ ] 场景对话系统

### 2026 Q4
- [ ] Etymology Universe
- [ ] 时间轴可视化
- [ ] 多宇宙对比功能
- [ ] REST API 上线

### 2027+
- [ ] Multi-Sensory Universe
- [ ] Personalized Universe
- [ ] AR/VR 探索模式
- [ ] 社交学习网络

---

## 💡 创新探索方向

### AI 驱动
1. **AI 语义蒸馏**: 用 LLM 预处理 10,000 词，生成高质量语义图
2. **智能课程生成**: 根据用户水平自动生成学习路径
3. **实时助教**: Inspector 面板集成 AI，生成记忆口诀和情景对话

### 社交化
4. **共享探索**: 多人协作探索同一宇宙
5. **社区贡献**: 用户可以贡献自己的主题宇宙
6. **学习排行**: 游戏化激励机制

### 沉浸式
7. **AR 模式**: 在真实环境中叠加词汇信息
8. **VR 星空**: 沉浸式 3D 宇宙漫游
9. **空间记忆**: 利用空间定位增强记忆

---

## 🎓 研究与验证

### 学习效果研究
- [ ] A/B 测试：宇宙学习 vs 传统方法
- [ ] 认知负荷测量
- [ ] 长期记忆保持率跟踪
- [ ] 用户满意度调研

### 学术合作
- [ ] 与语言学系合作研究
- [ ] 认知科学实验验证
- [ ] 发表教育技术论文

---

## 🤝 开放贡献

想要贡献新宇宙？

1. **提议**: 在 issues 中描述宇宙概念
2. **数据**: 确定或提供所需数据源
3. **实现**: 创建数据源 + 处理器
4. **测试**: 生成 100+ 词的示例宇宙
5. **文档**: 更新此路线图
6. **提交**: 创建 PR

---

**最后更新**: 2026-02-07
**版本**: v2.0
**状态**: 🚧 活跃开发中

*这是一个活文档，将根据用户反馈、研究发现和技术突破持续演进。*
