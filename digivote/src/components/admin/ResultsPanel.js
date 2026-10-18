import React, { useState, useEffect, useCallback } from 'react';
import { FaUsers, FaVoteYea, FaUserTie, FaTrophy, FaTable, FaChartBar } from 'react-icons/fa';
import { apiRequest } from '../../api';
import { COUNTIES } from '../../candidates';
import EChart from './EChart';
import {
  COLORS, FONT, baseTextStyle, colorByCandidate, emptyGraphic, formatPercent, tooltipStyle
} from './chartTheme';

const REFRESH_SECONDS = 10;

// ---------------------------------------------------------------------------
// Data helpers

// Group flat results into races: { key, title, position, county, candidates, total }
const groupIntoRaces = (results) => {
  const races = {};
  results.forEach(result => {
    const key = `${result.position}|${result.county || ''}`;
    if (!races[key]) {
      races[key] = {
        key,
        title: result.county ? `${result.county} ${result.position}` : 'President',
        position: result.position,
        county: result.county,
        candidates: [],
        total: 0
      };
    }
    races[key].candidates.push(result);
    races[key].total += result.vote_count;
  });
  return Object.values(races);
};

const leaderOf = (race) => {
  if (race.total === 0) return null;
  const sorted = [...race.candidates].sort((a, b) => b.vote_count - a.vote_count);
  const [first, second] = sorted;
  return {
    candidate: first,
    tied: second && second.vote_count === first.vote_count,
    share: formatPercent(first.vote_count, race.total),
    margin: second ? first.vote_count - second.vote_count : first.vote_count
  };
};

// ---------------------------------------------------------------------------
// Chart options

const lastName = (fullName) => fullName.split(' ').slice(-1)[0];

const raceBarOption = (race, compact) => {
  const colors = colorByCandidate(race.candidates);
  const sorted = [...race.candidates].sort((a, b) => b.vote_count - a.vote_count || a.candidate_id - b.candidate_id);
  const partyByName = Object.fromEntries(sorted.map(c => [c.candidate_name, c.party]));

  return {
    textStyle: baseTextStyle,
    animationDurationUpdate: 800,
    grid: { left: 8, right: compact ? 76 : 110, top: 8, bottom: 8, containLabel: true },
    tooltip: {
      ...tooltipStyle,
      trigger: 'item',
      formatter: (p) => `<b>${p.name}</b><br/>${partyByName[p.name]}<br/>${p.value.toLocaleString()} votes · ${formatPercent(p.value, race.total)}`
    },
    xAxis: { type: 'value', max: (v) => Math.max(v.max, 1), splitLine: { lineStyle: { color: COLORS.grid } }, axisLabel: { show: false } },
    yAxis: {
      type: 'category',
      inverse: true,
      data: sorted.map(c => c.candidate_name),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        // On phones, show only the surname so the bars keep most of the width
        formatter: (name) => `{name|${compact ? lastName(name) : name}}\n{party|${partyByName[name]}}`,
        rich: {
          name: { fontFamily: FONT, fontSize: 13, fontWeight: 600, color: COLORS.textPrimary, lineHeight: 18 },
          party: { fontFamily: FONT, fontSize: 11, color: COLORS.textMuted, lineHeight: 16 }
        }
      }
    },
    series: [{
      type: 'bar',
      barWidth: 18,
      barCategoryGap: 2,
      showBackground: true,
      backgroundStyle: { color: COLORS.track, borderRadius: [0, 4, 4, 0] },
      data: sorted.map(c => ({
        value: c.vote_count,
        itemStyle: { color: colors[c.candidate_id], borderRadius: [0, 4, 4, 0] }
      })),
      label: {
        show: true,
        position: 'right',
        distance: 10,
        formatter: (p) => compact
          ? `{v|${p.value.toLocaleString()}}\n{p|${formatPercent(p.value, race.total)}}`
          : `{v|${p.value.toLocaleString()}}  {p|${formatPercent(p.value, race.total)}}`,
        rich: {
          v: { fontFamily: FONT, fontSize: 13, fontWeight: 700, color: COLORS.textPrimary },
          p: { fontFamily: FONT, fontSize: 12, color: COLORS.textSecondary }
        }
      }
    }]
  };
};

const voteShareOption = (race) => {
  const colors = colorByCandidate(race.candidates);
  const ordered = [...race.candidates].sort((a, b) => a.candidate_id - b.candidate_id);
  const hasVotes = race.total > 0;

  return {
    textStyle: baseTextStyle,
    tooltip: {
      ...tooltipStyle,
      trigger: 'item',
      formatter: (p) => `<b>${p.data.fullName}</b><br/>${p.value.toLocaleString()} votes · ${p.percent}%`
    },
    graphic: [
      { id: 'total', type: 'text', left: 'center', top: '42%', invisible: !hasVotes, style: { text: race.total.toLocaleString(), fill: COLORS.textPrimary, font: `700 26px ${FONT}`, textAlign: 'center' } },
      { id: 'caption', type: 'text', left: 'center', top: '56%', invisible: !hasVotes, style: { text: 'votes cast', fill: COLORS.textMuted, font: `500 12px ${FONT}`, textAlign: 'center' } },
      emptyGraphic('No votes yet', !hasVotes)
    ],
    series: [{
      type: 'pie',
      radius: ['62%', '88%'],
      center: ['50%', '50%'],
      itemStyle: { borderColor: COLORS.surface, borderWidth: 2, borderRadius: 4 },
      // Slices are labelled by the ShareLegend under the chart, which has room for full names
      label: { show: false },
      data: hasVotes
        ? ordered.map(c => ({ name: lastName(c.candidate_name), fullName: c.candidate_name, value: c.vote_count, itemStyle: { color: colors[c.candidate_id] } }))
        : [{ name: 'none', fullName: 'No votes yet', value: 1, itemStyle: { color: COLORS.track }, emphasis: { disabled: true } }],
      silent: !hasVotes
    }]
  };
};

const turnoutGaugeOption = (percent, compact) => ({
  series: [{
    type: 'gauge',
    startAngle: 90,
    endAngle: -270,
    min: 0,
    max: 100,
    radius: '92%',
    pointer: { show: false },
    progress: { show: true, roundCap: true, width: compact ? 8 : 12, itemStyle: { color: COLORS.accent } },
    axisLine: { lineStyle: { width: compact ? 8 : 12, color: [[1, COLORS.track]] } },
    splitLine: { show: false },
    axisTick: { show: false },
    axisLabel: { show: false },
    title: { show: false },
    detail: {
      offsetCenter: [0, 0],
      formatter: '{value}%',
      fontFamily: FONT,
      fontSize: compact ? 14 : 22,
      fontWeight: 700,
      color: COLORS.textPrimary
    },
    data: [{ value: percent }]
  }]
});

const timelineOption = (timeline) => {
  // Start the line at zero, one hour before the first ballot
  const points = timeline.length
    ? [[new Date(new Date(`${timeline[0].hour}Z`).getTime() - 3600 * 1000), 0],
       ...timeline.map(t => [new Date(`${t.hour}Z`), t.cumulative])]
    : [];

  return {
    textStyle: baseTextStyle,
    grid: { left: 8, right: 24, top: 20, bottom: 8, containLabel: true },
    graphic: [emptyGraphic('No ballots cast yet', points.length === 0)],
    tooltip: {
      ...tooltipStyle,
      trigger: 'axis',
      axisPointer: { type: 'line', lineStyle: { color: COLORS.textMuted, type: 'dashed' } },
      formatter: (params) => {
        const [time, total] = params[0].value;
        return `<b>${new Date(time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</b><br/>${total.toLocaleString()} ballots cast in total`;
      }
    },
    xAxis: {
      type: 'time',
      axisLine: { lineStyle: { color: COLORS.grid } },
      axisLabel: { color: COLORS.textMuted, fontFamily: FONT, formatter: '{HH}:{mm}', hideOverlap: true },
      splitLine: { show: false }
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      axisLabel: { color: COLORS.textMuted, fontFamily: FONT },
      splitLine: { lineStyle: { color: COLORS.grid } }
    },
    series: [{
      type: 'line',
      smooth: 0.3,
      showSymbol: true,
      symbolSize: 8,
      lineStyle: { width: 2, color: COLORS.accent },
      itemStyle: { color: COLORS.accent, borderColor: COLORS.surface, borderWidth: 2 },
      areaStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [{ offset: 0, color: 'rgba(31, 138, 76, 0.28)' }, { offset: 1, color: 'rgba(31, 138, 76, 0.02)' }]
        }
      },
      data: points
    }]
  };
};

const countyTurnoutOption = (rows, compact) => ({
  textStyle: baseTextStyle,
  grid: { left: 8, right: compact ? 64 : 130, top: 36, bottom: 8, containLabel: true },
  legend: {
    top: 0,
    left: 0,
    icon: 'roundRect',
    itemWidth: 12,
    itemHeight: 12,
    textStyle: { fontFamily: FONT, color: COLORS.textSecondary },
    data: ['Voted', 'Not yet voted']
  },
  graphic: [emptyGraphic('No voters registered yet', rows.length === 0)],
  tooltip: {
    ...tooltipStyle,
    trigger: 'axis',
    axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(0,0,0,0.04)' } },
    formatter: (params) => {
      const row = rows[params[0].dataIndex];
      return `<b>${row.county}</b><br/>${row.voted.toLocaleString()} of ${row.registered.toLocaleString()} registered voters<br/>Turnout ${formatPercent(row.voted, row.registered)}`;
    }
  },
  xAxis: { type: 'value', minInterval: 1, axisLabel: { color: COLORS.textMuted, fontFamily: FONT }, splitLine: { lineStyle: { color: COLORS.grid } } },
  yAxis: {
    type: 'category',
    inverse: true,
    data: rows.map(r => r.county),
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: COLORS.textPrimary, fontFamily: FONT, fontWeight: 600, fontSize: 13 }
  },
  series: [
    {
      name: 'Voted',
      type: 'bar',
      stack: 'turnout',
      barWidth: 18,
      itemStyle: { color: COLORS.accent, borderColor: COLORS.surface, borderWidth: 1 },
      data: rows.map(r => r.voted)
    },
    {
      name: 'Not yet voted',
      type: 'bar',
      stack: 'turnout',
      itemStyle: { color: COLORS.remainder, borderRadius: [0, 4, 4, 0], borderColor: COLORS.surface, borderWidth: 1 },
      data: rows.map(r => r.registered - r.voted),
      label: {
        show: true,
        position: 'right',
        distance: 10,
        formatter: (p) => {
          const row = rows[p.dataIndex];
          return compact
            ? `{v|${formatPercent(row.voted, row.registered)}}`
            : `{v|${formatPercent(row.voted, row.registered)}}  {s|${row.voted}/${row.registered}}`;
        },
        rich: {
          v: { fontFamily: FONT, fontSize: 13, fontWeight: 700, color: COLORS.textPrimary },
          s: { fontFamily: FONT, fontSize: 12, color: COLORS.textSecondary }
        }
      }
    }
  ]
});

// ---------------------------------------------------------------------------
// Small presentational pieces

// Colour key with each candidate's share, shown under the donut
const ShareLegend = ({ race }) => {
  const colors = colorByCandidate(race.candidates);
  const ordered = [...race.candidates].sort((a, b) => a.candidate_id - b.candidate_id);
  return (
    <ul className="share-legend">
      {ordered.map(c => (
        <li key={c.candidate_id}>
          <span className="leader-dot" style={{ background: colors[c.candidate_id] }} />
          <span className="share-name">{c.candidate_name}</span>
          <span className="share-value">{formatPercent(c.vote_count, race.total)}</span>
          <span className="share-votes">{c.vote_count.toLocaleString()}</span>
        </li>
      ))}
    </ul>
  );
};

const KpiTile = ({ icon: Icon, label, value, hint, tone }) => (
  <div className={`kpi-tile tone-${tone}`}>
    <div className="kpi-icon"><Icon /></div>
    <div>
      <p className="kpi-label">{label}</p>
      <p className="kpi-value">{value}</p>
      {hint && <p className="kpi-hint">{hint}</p>}
    </div>
  </div>
);

const Card = ({ title, subtitle, actions, children, className = '' }) => (
  <section className={`viz-card ${className}`}>
    <header className="viz-card-header">
      <div>
        <h3>{title}</h3>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions}
    </header>
    {children}
  </section>
);

const raceHeight = (race) => 40 + race.candidates.length * 56;

const LeaderBoard = ({ races }) => (
  <ul className="leader-list">
    {races.map(race => {
      const leader = leaderOf(race);
      const colors = colorByCandidate(race.candidates);
      return (
        <li key={race.key}>
          <span className="leader-race">{race.title}</span>
          {leader ? (
            <span className="leader-name">
              <span className="leader-dot" style={{ background: colors[leader.candidate.candidate_id] }} />
              <span>
                <strong>{leader.candidate.candidate_name}</strong>
                <small>
                  {leader.tied ? 'Tied for the lead' : `${leader.share} · leads by ${leader.margin.toLocaleString()}`}
                </small>
              </span>
            </span>
          ) : (
            <span className="leader-empty">No votes yet</span>
          )}
        </li>
      );
    })}
  </ul>
);

// ---------------------------------------------------------------------------

// True on phone-sized screens, so charts can use shorter labels
const useCompact = () => {
  const query = '(max-width: 600px)';
  const [compact, setCompact] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => setCompact(media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);
  return compact;
};

const ResultsPanel = ({ token }) => {
  const compact = useCompact();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [view, setView] = useState('charts');
  const [county, setCounty] = useState(COUNTIES[0]);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchResults = useCallback(async () => {
    try {
      const result = await apiRequest('/results', { token });
      setData(result);
      setError('');
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
    }
  }, [token]);

  // Live results: refresh every few seconds while this panel is open
  useEffect(() => {
    fetchResults();
    const timer = setInterval(fetchResults, REFRESH_SECONDS * 1000);
    return () => clearInterval(timer);
  }, [fetchResults]);

  if (!data) {
    return (
      <div className="viz-loading">
        {error ? <p className="admin-error">{error}</p> : <><span className="viz-spinner" /> Loading live results...</>}
      </div>
    );
  }

  const races = groupIntoRaces(data.results);
  const presidential = races.find(r => r.position === 'Presidential');
  const countiesWithRaces = COUNTIES.filter(c => races.some(r => r.county === c))
    .concat([...new Set(races.map(r => r.county).filter(c => c && !COUNTIES.includes(c)))]);
  const selectedCounty = countiesWithRaces.includes(county) ? county : countiesWithRaces[0];
  const countyRaces = races.filter(r => r.county === selectedCounty);
  const { summary } = data;
  const leaderRaces = [presidential, ...countiesWithRaces.flatMap(c => races.filter(r => r.county === c))].filter(Boolean);

  return (
    <div className="results-panel">
      {error && <p className="admin-error">Could not refresh: {error}</p>}

      <div className="panel-toolbar">
        <span className="live-indicator"><span className="live-dot" /> Live · updates every {REFRESH_SECONDS}s
          {lastUpdated && <span className="panel-meta"> · {lastUpdated.toLocaleTimeString()}</span>}
        </span>
        <div className="view-toggle" role="group" aria-label="Results view">
          <button className={view === 'charts' ? 'active' : ''} onClick={() => setView('charts')}><FaChartBar /> Charts</button>
          <button className={view === 'table' ? 'active' : ''} onClick={() => setView('table')}><FaTable /> Table</button>
        </div>
      </div>

      <div className="kpi-row">
        <KpiTile icon={FaUsers} tone="blue" label="Registered voters" value={summary.registered_voters.toLocaleString()} />
        <KpiTile icon={FaVoteYea} tone="green" label="Ballots cast" value={summary.ballots_cast.toLocaleString()}
          hint={`${(summary.registered_voters - summary.ballots_cast).toLocaleString()} still to vote`} />
        <KpiTile icon={FaUserTie} tone="violet" label="Candidates" value={data.results.length.toLocaleString()} hint={`${races.length} races`} />
        <div className="kpi-tile kpi-gauge">
          <div className="kpi-gauge-chart">
            <EChart option={turnoutGaugeOption(summary.turnout_percent, compact)} height={compact ? 72 : 96} ariaLabel={`Turnout ${summary.turnout_percent}%`} />
          </div>
          <div>
            <p className="kpi-label">Turnout</p>
            <p className="kpi-hint">of registered voters</p>
          </div>
        </div>
      </div>

      {view === 'table' ? (
        <Card title="All results" subtitle="Every candidate, grouped by race">
          <div className="table-scroll">
            <table className="results-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Party</th>
                  <th>Race</th>
                  <th>Votes</th>
                  <th>Share</th>
                </tr>
              </thead>
              <tbody>
                {races.flatMap(race => race.candidates.map(result => (
                  <tr key={result.candidate_id}>
                    <td>{result.candidate_name}</td>
                    <td>{result.party}</td>
                    <td>{race.title}</td>
                    <td className="votes-count">{result.vote_count.toLocaleString()}</td>
                    <td>{formatPercent(result.vote_count, race.total)}</td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <>
          {presidential && (
            <div className="viz-grid two-one">
              <Card title="Presidential race" subtitle={`${presidential.total.toLocaleString()} votes counted`}>
                <EChart option={raceBarOption(presidential, compact)} height={raceHeight(presidential)} ariaLabel="Presidential race results" />
              </Card>
              <Card title="Vote share" subtitle="Presidential">
                <EChart option={voteShareOption(presidential)} height={190} ariaLabel="Presidential vote share" />
                <ShareLegend race={presidential} />
              </Card>
            </div>
          )}

          <div className="viz-grid two-one">
            <Card title="Turnout over time" subtitle="Running total of ballots cast">
              <EChart option={timelineOption(data.turnout_timeline)} height={280} ariaLabel="Ballots cast over time" />
            </Card>
            <Card title="Race leaders" subtitle="Who is ahead right now" actions={<FaTrophy className="card-icon-accent" />}>
              <LeaderBoard races={leaderRaces} />
            </Card>
          </div>

          <Card title="Turnout by county" subtitle="Voters who have cast their ballot, out of those registered">
            <EChart option={countyTurnoutOption(data.turnout_by_county, compact)} height={Math.max(60 + data.turnout_by_county.length * 44, 160)} ariaLabel="Turnout by county" />
          </Card>

          <Card
            title="County races"
            subtitle="Governor and Senator results for the selected county"
            actions={
              <div className="county-pills" role="tablist" aria-label="County">
                {countiesWithRaces.map(c => (
                  <button key={c} role="tab" aria-selected={c === selectedCounty}
                    className={c === selectedCounty ? 'active' : ''} onClick={() => setCounty(c)}>
                    {c}
                  </button>
                ))}
              </div>
            }
          >
            <div className="viz-grid halves">
              {countyRaces.map(race => (
                <div key={race.key} className="sub-chart">
                  <h4>{race.position} <span>{race.total.toLocaleString()} votes</span></h4>
                  <EChart option={raceBarOption(race, compact)} height={raceHeight(race)} ariaLabel={`${race.title} results`} />
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default ResultsPanel;
