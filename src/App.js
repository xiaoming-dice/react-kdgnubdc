// App.jsx
import React, { useMemo, useState } from 'react';

// 层级定义：每上一层都按 3 倍组合；最底层“排”固定 10 人
const UNITS = [
  { name: '排', factorFromPrev: null, peoplePerUnit: 10 },
  { name: '连', factorFromPrev: 3 },
  { name: '团', factorFromPrev: 3 },
  { name: '旅', factorFromPrev: 3 },
  { name: '师', factorFromPrev: 3 },
  { name: '军', factorFromPrev: 3 },
];

const unitIndex = Object.fromEntries(UNITS.map((u, i) => [u.name, i]));

function computePeopleByIndex(idx) {
  // idx=0 -> 10；idx=1 -> 30；...
  return 10 * Math.pow(3, idx);
}

function FormulaLine({ idx }) {
  const names = UNITS.map(u => u.name);
  const total = computePeopleByIndex(idx);
  if (idx === 0) return <div className="formula">1 排 = 10 人</div>;
  const left = `1 ${names[idx]} = 3 ${names[idx - 1]}`;
  const times = new Array(idx).fill('3').join(' × ');
  return (
    <div className="formula">
      {left} = {times} × 10 = <strong>{total}</strong> 人
    </div>
  );
}

function Node({ idx, openDepth, setOpenDepth }) {
  const u = UNITS[idx];
  const isOpenRange = idx < openDepth;
  return (
    <div
      className={`node ${isOpenRange ? 'node-open' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        // 若当前节点是“最深可见层”（openDepth === idx+1），则点击继续向下展开到 idx+2；
        // 若不是最深，则点击收起到该层（openDepth = idx+1）。
        setOpenDepth(prev => (prev === idx + 1 ? Math.min(idx + 2, UNITS.length) : idx + 1));
      }}
    >
      <div className="node-header">
        <div className="node-title">{u.name}</div>
        <div className="node-meta">{idx === 0 ? '10 人' : '×3'}</div>
      </div>
      <FormulaLine idx={idx} />
      {idx < UNITS.length - 1 && isOpenRange && (
        <div className="node-children">
          <Node idx={idx + 1} openDepth={openDepth} setOpenDepth={setOpenDepth} />
        </div>
      )}
      {idx === UNITS.length - 1 && isOpenRange && (
        <div className="node-summary">✅ 1 军 = {computePeopleByIndex(idx).toLocaleString()} 人</div>
      )}
    </div>
  );
}

function Boxes({ count }) {
  const capped = Math.min(count, 50);
  const items = Array.from({ length: capped }, (_, i) => i);
  return (
    <div>
      <div className="boxes">
        {items.map(i => (
          <div key={i} className="box" />
        ))}
      </div>
      {count > 50 && <div className="hint">… 仅显示前 50 个排</div>}
    </div>
  );
}

function AlgebraPanel() {
  const [expr, setExpr] = useState('2 团 + 1 连');
  const scaleX = useMemo(() => ({
    排: 1,
    连: 3,
    团: 9,
    旅: 27,
    师: 81,
    军: 243,
  }), []);

  const result = useMemo(() => {
    const terms = expr
      .split('+')
      .map(s => s.trim())
      .filter(Boolean);
    let sumX = 0;
    const re = /(\d+)\s*(排|连|团|旅|师|军)/;
    for (const t of terms) {
      const m = t.match(re);
      if (!m) continue;
      const n = parseInt(m[1], 10);
      const unit = m[2];
      sumX += n * (scaleX[unit] || 0);
    }
    return { sumX, people: sumX * 10 };
  }, [expr, scaleX]);

  return (
    <div className="panel">
      <div className="panel-title">🧮 代数视角（组合与分解）</div>
      <div className="panel-body">
        <div className="equation">X = 1 排 = 10 人</div>
        <div className="equation">1 连 = 3X</div>
        <div className="equation">1 团 = 9X</div>
        <div className="equation">1 旅 = 27X</div>
        <div className="equation">1 师 = 81X</div>
        <div className="equation">1 军 = 243X</div>

        <div className="input-row">
          <input
            className="input"
            value={expr}
            onChange={e => setExpr(e.target.value)}
            placeholder="例如：2 团 + 1 连"
          />
          <div className="result">
            = <strong>{result.sumX}</strong> X = <strong>{result.sumX}</strong> 排 ={' '}
            <strong>{result.people}</strong> 人
          </div>
        </div>
        <Boxes count={result.sumX} />
      </div>
    </div>
  );
}

function CampGame() {
  const [target, setTarget] = useState(1000);
  const [counts, setCounts] = useState({ 团: 0, 连: 0, 排: 0 });
  const people = counts.排 * 10 + counts.连 * 30 + counts.团 * 90;
  const diff = people - target;

  function update(unit, delta) {
    setCounts(prev => ({ ...prev, [unit]: Math.max(0, prev[unit] + delta) }));
  }

  function suggest() {
    if (diff === 0) return '✅ 刚刚好！结构合理。';
    if (diff > 0) {
      if (diff >= 90 && counts.团 > 0) return '太多了！减少 1 个“团”试试。';
      if (diff >= 30 && counts.连 > 0) return '太多了！减少 1 个“连”试试。';
      if (counts.排 > 0) return '太多了！减少一些“排”。';
      return '太多了！尝试减小各单位数量。';
    }
    const need = -diff;
    if (need >= 90) return '不够！增加 1 个“团”。';
    if (need >= 30) return '不够！增加 1 个“连”。';
    return '不够！再增加一些“排”。';
  }

  return (
    <div className="panel">
      <div className="panel-title">🪄 问题分解任务（夏令营组队）</div>
      <div className="panel-body">
        <div className="input-row">
          <label className="label">目标总人数：</label>
          <input
            className="input"
            type="number"
            value={target}
            min={10}
            onChange={e => setTarget(parseInt(e.target.value || '0', 10))}
          />
        </div>

        <div className="counter-row">
          <div className="counter">
            <div className="counter-title">团（每团 90 人）</div>
            <div className="counter-controls">
              <button className="btn" onClick={() => update('团', -1)}>-</button>
              <span className="count">{counts.团}</span>
              <button className="btn btn-primary" onClick={() => update('团', 1)}>+</button>
            </div>
          </div>

          <div className="counter">
            <div className="counter-title">连（每连 30 人）</div>
            <div className="counter-controls">
              <button className="btn" onClick={() => update('连', -1)}>-</button>
              <span className="count">{counts.连}</span>
              <button className="btn btn-primary" onClick={() => update('连', 1)}>+</button>
            </div>
          </div>

          <div className="counter">
            <div className="counter-title">排（每排 10 人）</div>
            <div className="counter-controls">
              <button className="btn" onClick={() => update('排', -1)}>-</button>
              <span className="count">{counts.排}</span>
              <button className="btn btn-primary" onClick={() => update('排', 1)}>+</button>
            </div>
          </div>
        </div>

        <div className="summary">
          当前总人数：<strong>{people}</strong> 人
        </div>
        <div className={`hint ${diff === 0 ? 'ok' : diff > 0 ? 'warn' : 'info'}`}>{suggest()}</div>
        <div className="actions">
          <button className="btn btn-secondary" onClick={() => setCounts({ 团: 0, 连: 0, 排: 0 })}>重置</button>
        </div>
      </div>
    </div>
  );
}

function SummaryPanel() {
  return (
    <div className="panel">
      <div className="panel-title">🧠 思维总结</div>
      <div className="panel-body">
        <p>
          你刚刚学到：每个层级都是“一组一组的组合”；用代数式可以表示“关系”；复杂问题可以分成“小组”，再整合成“整体”。
        </p>
        <div className="grid-two">
          <div>
            军事结构：排 → 连 → 团 → 旅 → 师 → 军
          </div>
          <div>
            数学表达：X → 3X → 9X → 27X → 81X → 243X
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  // openDepth 表示可见层级数量，从“排”开始；1=只显示排；2=显示排和连；依次类推。
  const [openDepth, setOpenDepth] = useState(1);
  return (
    <div className="app">
      <h1 className="title">🧭 结构化组织 × 数学代数 × 问题分解</h1>
      <p className="subtitle">点击“排 → 连 → 团 → 旅 → 师 → 军”，观察人数的层级组合与代数关系。</p>

      <div className="columns">
        <div className="col">
          <div className="panel">
            <div className="panel-title">🧱 认识结构（从下到上）</div>
            <div className="panel-body">
              <Node idx={0} openDepth={openDepth} setOpenDepth={setOpenDepth} />
            </div>
          </div>
        </div>
        <div className="col">
          <AlgebraPanel />
          <CampGame />
        </div>
      </div>

      <SummaryPanel />
    </div>
  );
}
