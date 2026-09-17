---
tags: [验收, 图表]
---
# Mermaid 图表

检查深浅模式、阅读模式、实时预览，以及手机窄屏：文字应可读，大图应能横向浏览，自定义节点颜色应保留。这里的图均为独立测试样例，不包含参考项目的代码或架构。

## 流程图：分组、中文与多种连线

```mermaid
flowchart TB
  U[用户] --> A
  subgraph desktop[桌面应用]
    A[工作台<br/>聊天 / 设置 / 笔记] --> B{是否保存草稿？}
    B -->|保存| C[本地存储]
    B -.->|稍后处理| D[这是一段较长的中文节点说明<br/>用于检查换行与文字可读性]
  end
  C ==>|完成| E((月下归档))
  D --> E
```

## 小图：避免无必要地放大

```mermaid
flowchart LR
  A[记录] --> B[整理]
```

## 大图：横向滚动与末端可达

```mermaid
flowchart LR
  A[收集灵感] --> B[整理素材] --> C[拟定提纲] --> D[完成初稿]
  D --> E[检查引用] --> F[校对文字] --> G[确认排版] --> H[导出文档] --> I[保存归档]
  subgraph review[复核流程]
    E --> J[补充依据] --> K[重新检查] --> F
  end
```

## 时序图

```mermaid
sequenceDiagram
  actor U as 用户
  participant N as 笔记界面
  participant S as 本地存储
  U->>N: 编辑中文笔记
  activate N
  N->>S: 保存草稿
  alt 保存成功
    S-->>N: 返回版本
    N-->>U: 显示完成
  else 磁盘不可用
    S-->>N: 返回错误
    Note over U,N: 保留未保存的文字
  end
  deactivate N
```

## 类图

```mermaid
classDiagram
  class Notebook {
    +String title
    +addNote(Note note)
  }
  class Note {
    +String content
    +save()
  }
  class Searchable {
    <<interface>>
    +search(String query)
  }
  Notebook "1" *-- "many" Note : 包含
  Note ..|> Searchable
```

## 状态图

```mermaid
stateDiagram-v2
  [*] --> 草稿
  草稿 --> 校对: 完成写作
  state 校对 {
    [*] --> 检查文字
    检查文字 --> 检查引用
    检查引用 --> [*]
  }
  校对 --> 已归档: 确认保存
  已归档 --> [*]
```

## 实体关系图

```mermaid
erDiagram
  NOTEBOOK ||--o{ NOTE : contains
  NOTE ||--o{ ATTACHMENT : includes
  NOTEBOOK {
    string id PK
    string title
  }
  NOTE {
    string id PK
    string content
  }
  ATTACHMENT {
    string path PK
    string mediaType
  }
```

## 显式颜色：主题应尊重作者选择

```mermaid
flowchart LR
  A[默认节点] --> B[自定义绿底] --> C[自定义蓝底]
  classDef approved fill:#e4f4df,stroke:#32622f,color:#183816
  class B approved
  style C fill:#dbeafe,stroke:#1d4ed8,color:#172554
  linkStyle 1 stroke:#b45309,stroke-width:3px
```

## 图内主题配置

```mermaid
---
config:
  theme: base
  themeVariables:
    primaryColor: '#ffe4e6'
    primaryTextColor: '#881337'
    primaryBorderColor: '#be123c'
    lineColor: '#9f1239'
    clusterBkg: '#fff1f2'
    clusterBorder: '#fda4af'
---
flowchart TB
  subgraph custom[作者自定义的暖色分组]
    A[粉色节点] --> B[保留原始色彩意图]
  end
```

## SVG 文字标签：关闭 HTML 标签

```mermaid
---
config:
  htmlLabels: false
---
flowchart TB
  subgraph svgLabels[原生 SVG 文字]
    A[中文标签] -->|普通连线文字| B{是否通过}
    B -->|通过| C[默认文字颜色]
    B -.->|重新处理| D[作者指定色彩]
  end
  style D fill:#dbeafe,stroke:#1d4ed8,color:#172554
```

## 状态图：注释、分叉与汇合

```mermaid
stateDiagram-v2
  state 分叉 <<fork>>
  state 汇合 <<join>>
  state 判断 <<choice>>
  [*] --> 分叉
  分叉 --> 文字校对
  分叉 --> 引用校对
  note right of 文字校对
    检查中文标点和错别字
  end note
  文字校对 --> 汇合
  引用校对 --> 汇合
  汇合 --> 判断
  判断 --> 已归档: 已确认
  判断 --> 文字校对: 需要修改
  已归档 --> [*]
```

## 只指定背景色：保留默认深色标签

```mermaid
flowchart TB
  A[主题默认节点] --> B
  subgraph pale[自定义浅色分组]
    B[只设浅色背景的节点] --> C[分组内默认节点]
  end
  style pale fill:#fff4cf
  style B fill:#fff4cf
```

[[00-欢迎来到月读|返回月读]]
