import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaPause, FaPlay, FaInfoCircle } from 'react-icons/fa';
import { apiRequest } from '../../api';
import { FIVE_CITIES, FIVE_CITIES_POPULATION, KENYA_POPULATION } from './cityData';
import '../../styles/cities.css';

// The map (and the charting library) only download when this section scrolls into view
const KenyaMap = lazy(() => import('./KenyaMap'));

const TOUR_STEP_MS = 4500;
const OVERVIEW = -1;
const fmt = (n) => n.toLocaleString('en-US');
const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const CitiesSection = () => {
  const sectionRef = useRef(null);
  const [inView, setInView] = useState(false);
  const [mapRequested, setMapRequested] = useState(false);
  const [active, setActive] = useState(OVERVIEW);
  const [touring, setTouring] = useState(() => !prefersReducedMotion());
  const [showRoutes, setShowRoutes] = useState(true);
  const [registered, setRegistered] = useState(null);

  // Load the map the first time the section is visible; pause the tour while it's off screen
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
      if (entry.isIntersecting) setMapRequested(true);
    }, { rootMargin: '200px 0px' });
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Live count of registered voters in each city
  useEffect(() => {
    apiRequest('/stats')
      .then(data => setRegistered(data.registered_by_county || null))
      .catch(() => setRegistered(null));
  }, []);

  // Guided tour: whole country → each city in turn → whole country ...
  useEffect(() => {
    if (!touring || !inView) return undefined;
    const timer = setInterval(() => {
      setActive(current => (current + 1 >= FIVE_CITIES.length ? OVERVIEW : current + 1));
    }, TOUR_STEP_MS);
    return () => clearInterval(timer);
  }, [touring, inView]);

  const selectCity = (index) => {
    setTouring(false);
    setActive(index);
  };

  const showWholeCountry = () => {
    setTouring(false);
    setActive(OVERVIEW);
  };

  const share = (FIVE_CITIES_POPULATION / KENYA_POPULATION) * 100;
  const maxPop = Math.max(...FIVE_CITIES.map(c => c.pop));

  return (
    <section className="cities-section" ref={sectionRef} aria-labelledby="cities-title">
      <div className="cities-inner">
        <header className="cities-header">
          <p className="cities-eyebrow"><span className="cities-dot" /> Who can vote on Digivote</p>
          <h2 id="cities-title">
            Digivote is open only to voters in <em>Kenya's five cities</em>
          </h2>
          <p className="cities-lead">
            Online voting is available to registered voters living in <strong>Nairobi</strong>,{' '}
            <strong>Mombasa</strong>, <strong>Kisumu</strong>, <strong>Nakuru</strong> and{' '}
            <strong>Eldoret</strong>. When you register, you choose one of these five counties, and
            your ballot shows the Governor and Senator candidates for that county.
          </p>
        </header>

        <div className="cities-grid">
          <div className="cities-stage">
            <div className="cities-map" role="img"
              aria-label="Map of Kenya's 47 counties with Nairobi, Mombasa, Kisumu, Nakuru and Uasin Gishu (Eldoret) highlighted">
              {mapRequested ? (
                <Suspense fallback={<div className="cities-map-loading">Loading map...</div>}>
                  <KenyaMap active={active} showRoutes={showRoutes} onSelectCity={selectCity} />
                </Suspense>
              ) : (
                <div className="cities-map-loading">Map of Kenya</div>
              )}
            </div>

            <div className="cities-controls">
              <button type="button" className="cities-btn" aria-pressed={touring}
                onClick={() => setTouring(t => !t)}>
                {touring ? <FaPause /> : <FaPlay />} {touring ? 'Pause tour' : 'Play tour'}
              </button>
              <button type="button" className="cities-btn" aria-pressed={showRoutes}
                onClick={() => setShowRoutes(r => !r)}>
                Corridor trails
              </button>
              <button type="button" className="cities-btn" onClick={showWholeCountry}>Whole country</button>
            </div>
          </div>

          <aside className="cities-panel">
            <div className="cities-totals">
              <div className="cities-total-big">
                <p className="cities-k">People living in the five cities' counties</p>
                <p className="cities-v">{fmt(FIVE_CITIES_POPULATION)}</p>
              </div>
              <div>
                <p className="cities-k">Share of Kenya</p>
                <p className="cities-v">{share.toFixed(1)}%</p>
              </div>
              <div>
                <p className="cities-k">Counties covered</p>
                <p className="cities-v">5 of 47</p>
              </div>
              <div className="cities-share" aria-hidden="true"><i style={{ width: `${share}%` }} /></div>
            </div>

            <ul className="cities-list">
              {FIVE_CITIES.map((c, i) => (
                <li key={c.county}>
                  <button type="button" className={`city-ticket${active === i ? ' on' : ''}`}
                    onClick={() => selectCity(i)} aria-pressed={active === i}>
                    <span className="city-code">{c.code}</span>
                    <span className="city-name">{c.pin}</span>
                    <span className="city-pop">
                      {fmt(c.pop)}
                      <small>{((c.pop / KENYA_POPULATION) * 100).toFixed(1)}% of Kenya</small>
                    </span>
                    <span className="city-sub">
                      {c.city}
                      {registered && (
                        <span className="city-registered">
                          <FaMapMarkerAlt aria-hidden="true" /> {fmt(registered[c.appCounty] || 0)} registered on Digivote
                        </span>
                      )}
                    </span>
                    <span className="city-bar"><i style={{ width: `${(c.pop / maxPop) * 100}%` }} /></span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>
        </div>

        <div className="cities-notice">
          <FaInfoCircle className="cities-notice-icon" aria-hidden="true" />
          <div>
            <p className="cities-notice-title">Live outside these five cities?</p>
            <p>
              Registration on Digivote isn't open in your county yet. You can still vote in person
              at your IEBC polling station.
            </p>
          </div>
          <div className="cities-notice-actions">
            <Link to="/register" className="cities-cta">Register to vote</Link>
            <Link to="/verify" className="cities-cta secondary">Verify my details</Link>
          </div>
        </div>

        <p className="cities-source">
          Population from the 2019 Kenya Population and Housing Census (KNBS). The trails follow the
          Northern Corridor from the port of Mombasa through Nairobi, Nakuru and Eldoret, with a branch
          to Kisumu. Click a city on the map or in the list to zoom in.
        </p>
      </div>
    </section>
  );
};

export default CitiesSection;
