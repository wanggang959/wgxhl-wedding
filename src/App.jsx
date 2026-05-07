import { useEffect, useMemo, useState } from 'react';

const weddingDate = new Date('2026-10-01T18:00:00+08:00');

const photos = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1460364157752-926555421a7e?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?auto=format&fit=crop&w=900&q=80',
];

function Countdown() {
  const [timeLeft, setTimeLeft] = useState(() => weddingDate - new Date());

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(weddingDate - new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { days, hours, minutes, seconds } = useMemo(() => {
    const total = Math.max(0, timeLeft);
    return {
      days: Math.floor(total / (1000 * 60 * 60 * 24)),
      hours: Math.floor((total / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((total / (1000 * 60)) % 60),
      seconds: Math.floor((total / 1000) % 60),
    };
  }, [timeLeft]);

  return (
    <div className="countdown-grid">
      {[['天', days], ['时', hours], ['分', minutes], ['秒', seconds]].map(([label, value]) => (
        <div className="time-card" key={label}>
          <div className="time-value">{String(value).padStart(2, '0')}</div>
          <div className="time-label">{label}</div>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  return (
    <div className="page">
      <header className="hero section">
        <p className="domain">wgxhl.space</p>
        <h1>王刚 & 谢何丽</h1>
        <p className="subtitle">诚挚邀请您参加我们的婚礼</p>
        <p className="date">2026年10月1日 · 18:00 · 杭州西子湖四季酒店</p>
        <a className="btn" href="#rsvp">立即 RSVP</a>
      </header>

      <section className="section glass">
        <h2>婚礼信息</h2>
        <ul className="info-list">
          <li><strong>婚礼时间：</strong>2026年10月1日（周四）18:00</li>
          <li><strong>婚礼地点：</strong>杭州西子湖四季酒店 · 湖畔宴会厅</li>
          <li><strong>着装建议：</strong>优雅正式 / 浅色系</li>
        </ul>
      </section>

      <section className="section glass">
        <h2>浪漫倒计时</h2>
        <Countdown />
      </section>

      <section className="section glass">
        <h2>婚礼地图</h2>
        <div className="map-wrap">
          <iframe
            title="婚礼地图"
            src="https://www.openstreetmap.org/export/embed.html?bbox=120.1207%2C30.2334%2C120.1507%2C30.2534&layer=mapnik&marker=30.2434%2C120.1357"
            loading="lazy"
            allowFullScreen
          />
        </div>
      </section>

      <section className="section glass">
        <h2>照片墙</h2>
        <div className="gallery">
          {photos.map((photo) => (
            <img key={photo} src={photo} alt="couple memory" loading="lazy" />
          ))}
        </div>
      </section>

      <section className="section glass" id="rsvp">
        <h2>RSVP</h2>
        <p>请于 2026年9月15日前 告知我们您的出席安排。</p>
        <a className="btn" href="mailto:rsvp@wgxhl.space?subject=婚礼出席确认">点击回复出席</a>
      </section>
    </div>
  );
}
