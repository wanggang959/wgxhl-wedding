import { useEffect, useMemo, useRef, useState } from 'react';

const weddingDate = new Date('2026-09-24T12:00:00+08:00');
const weddingVenue = '元坝子';
const amapPoiId = 'B072800CZO';
const defaultVenuePosition = [104.5317122340202, 29.80980960267427];
const amapUrl = 'https://surl.amap.com/1W8bjcaR23B';
const amapKey = '2c4e88f3b767db0de947d306d17b7b7c';
const amapSecurityCode = '04344977613a3a9c257ced37751adc5a';
const venueMapZoom = 15;
const musicSrc = '/wedding-music.mp3';
const weddingAddress = '资中县 · 罗泉镇';
const groomPhone = '15828839312';
const bridePhone = '15883294178';
let amapLoader;

const storyTimeline = [
  {
    type: 'hero',
    label: '01',
    image: '/optimized/gallery/IMGL4578.webp',
    alt: '海边新郎亲吻新娘手背',
    title: '海风轻轻，心动有了名字',
    text: '亲密对望的瞬间，作为故事的开篇。',
  },
  {
    type: 'duo',
    label: '02',
    title: '从目光相遇，到并肩看海',
    items: [
      {
        image: '/optimized/gallery/IMGL4513.webp',
        alt: '蓝色礼服新娘回眸',
      },
      {
        image: '/optimized/gallery/IMGL4519.webp',
        alt: '新人湖边挥手',
      },
    ],
  },
  {
    type: 'wide',
    label: '03',
    image: '/optimized/gallery/IMGL4693.webp',
    alt: '室内求婚画面',
    title: '把余生，轻轻交给你',
  },
  {
    type: 'duo',
    title: '那一晚，灯光很暖，答案很坚定',
    items: [
      {
        image: '/optimized/gallery/proposal.webp',
        alt: '夜晚布置现场单膝求婚',
      },
      {
        image: '/optimized/gallery/proposal-ring.webp',
        alt: '求婚成功后的拥抱和戒指',
      },
    ],
  },
  {
    type: 'duo',
    label: '04',
    title: '晚风与城市，也收藏我们的默契',
    items: [
      {
        image: '/optimized/gallery/IMGL4914.webp',
        alt: '桥边黑裙情侣照',
      },
      {
        image: '/optimized/gallery/IMGL4938.webp',
        alt: '新郎黑西装肖像',
      },
    ],
  },
  {
    type: 'cinema',
    label: '05',
    image: '/optimized/gallery/IMGL4949.webp',
    alt: '桥下光影电影感婚纱照',
    title: '温暖时光，静谧相伴',
  },
  {
    type: 'wide',
    label: '06',
    image: '/optimized/gallery/IMGL5105.webp',
    alt: '夕阳下新郎抱起新娘',
    title: '故事未完，婚礼现场继续',
  },
];

const petals = Array.from({ length: 16 }, (_, index) => ({
  id: index,
  image: `/optimized/petal-${(index % 3) + 1}.webp`,
  left: `${(index * 17) % 100}%`,
  drift: `${index % 2 === 0 ? 1 : -1}px`,
  scale: (0.38 + (index % 5) * 0.08).toFixed(2),
  opacity: (0.72 + (index % 4) * 0.06).toFixed(2),
  rotate: `${(index * 37) % 180}deg`,
  delay: `${(index % 8) * 0.75}s`,
  duration: `${10 + (index % 6)}s`,
}));

function loadAmap() {
  if (window.AMap) {
    return Promise.resolve(window.AMap);
  }

  if (amapLoader) {
    return amapLoader;
  }

  window._AMapSecurityConfig = {
    securityJsCode: amapSecurityCode,
  };

  amapLoader = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${amapKey}&plugin=AMap.Scale,AMap.ToolBar`;
    script.async = true;
    script.onload = () => resolve(window.AMap);
    script.onerror = () => reject(new Error('高德地图加载失败'));
    document.head.appendChild(script);
  });

  return amapLoader;
}

function Countdown() {
  const [timeLeft, setTimeLeft] = useState(() => weddingDate - new Date());

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(weddingDate - new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { days, hours, minutes, seconds, isWeddingDay } = useMemo(() => {
    const total = Math.max(0, timeLeft);
    return {
      days: Math.floor(total / (1000 * 60 * 60 * 24)),
      hours: Math.floor((total / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((total / (1000 * 60)) % 60),
      seconds: Math.floor((total / 1000) % 60),
      isWeddingDay: timeLeft <= 0,
    };
  }, [timeLeft]);

  return (
    <>
      <div className="countdown-grid" aria-label="距离婚礼开始的倒计时">
        {[
          ['天', days],
          ['时', hours],
          ['分', minutes],
          ['秒', seconds],
        ].map(([label, value]) => (
          <div className="time-card" key={label}>
            <div className="time-value">{String(value).padStart(2, '0')}</div>
            <div className="time-label">{label}</div>
          </div>
        ))}
      </div>
      {isWeddingDay && <p className="countdown-done">今天，我们结婚啦</p>}
    </>
  );
}

function WeddingCalendar() {
  const year = weddingDate.getFullYear();
  const month = weddingDate.getMonth();
  const weddingDay = weddingDate.getDate();
  const hour = String(weddingDate.getHours()).padStart(2, '0');
  const minute = String(weddingDate.getMinutes()).padStart(2, '0');
  const weekDay = new Intl.DateTimeFormat('zh-CN', { weekday: 'long' }).format(weddingDate);
  const monthDays = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const leadingBlanks = (firstDay + 6) % 7;
  const calendarCells = [
    ...Array.from({ length: leadingBlanks }, (_, index) => ({ id: `blank-${index}`, day: null })),
    ...Array.from({ length: monthDays }, (_, index) => ({ id: `day-${index + 1}`, day: index + 1 })),
  ];

  return (
    <section className="section calendar-section" aria-label="婚礼日历">
      <header className="section-title">
        <span>Save the Date</span>
        <h2>婚礼日历</h2>
      </header>

      <div className="date-summary">
        <div className="date-line">
          {year}年 {month + 1}月 {weddingDay}日 {hour}:{minute}
        </div>
        <p>农历：八月十四 {weekDay}</p>
      </div>

      <div className="calendar-card">
        <div className="calendar-month">
          <strong>{year}</strong>
          <span>/</span>
          <strong>{month + 1}月</strong>
        </div>
        <div className="calendar-weekdays" aria-hidden="true">
          {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div className="calendar-grid">
          {calendarCells.map((cell) => (
            <span className={cell.day === weddingDay ? 'is-wedding-day' : ''} key={cell.id}>
              {cell.day}
            </span>
          ))}
        </div>
      </div>

      <p className="calendar-wish">把这一天，留给我们的名字</p>
    </section>
  );
}

function WeddingMap() {
  const mapRef = useRef(null);
  const [mapTip, setMapTip] = useState('地图加载中...');

  useEffect(() => {
    let map;
    let cancelled = false;

    loadAmap()
      .then((AMap) => {
        if (cancelled || !mapRef.current) return;

        map = new AMap.Map(mapRef.current, {
          zoom: venueMapZoom,
          center: defaultVenuePosition,
          viewMode: '2D',
          resizeEnable: true,
        });

        map.addControl(new AMap.Scale());
        map.addControl(new AMap.ToolBar({ position: 'RB' }));

        const placeMarker = (position) => {
          const marker = new AMap.Marker({
            position,
            title: weddingVenue,
          });

          map.add(marker);
          map.setZoomAndCenter(venueMapZoom, position);
          setMapTip('');
        };

        placeMarker(defaultVenuePosition);
      })
      .catch(() => {
        if (!cancelled) {
          setMapTip('地图暂时无法加载，请点击下方按钮打开高德地图');
        }
      });

    return () => {
      cancelled = true;
      map?.destroy();
    };
  }, []);

  return (
    <>
      <div className="wedding-map" ref={mapRef} aria-label="婚礼地点地图" />
      {mapTip && <p className="map-tip">{mapTip}</p>}
    </>
  );
}

function Petals() {
  return (
    <div className="petals" aria-hidden="true">
      {petals.map((petal) => (
        <span
          className="petal"
          key={petal.id}
          style={{
            '--petal-image': `url(${petal.image})`,
            '--petal-drift': petal.drift,
            '--petal-scale': petal.scale,
            '--petal-opacity': petal.opacity,
            '--petal-rotate': petal.rotate,
            left: petal.left,
            animationDelay: petal.delay,
            animationDuration: petal.duration,
          }}
        />
      ))}
    </div>
  );
}

export default function App() {
  const audioRef = useRef(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [showMusicPrompt, setShowMusicPrompt] = useState(true);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.55;
    const tryPlay = () => {
      const playPromise = audio.play();

      if (playPromise) {
        playPromise
          .then(() => setIsMusicPlaying(true))
          .catch(() => setIsMusicPlaying(false));
      }
    };

    tryPlay();
    document.addEventListener('WeixinJSBridgeReady', tryPlay, { once: true });
    window.addEventListener('touchstart', tryPlay, { once: true });
    window.addEventListener('click', tryPlay, { once: true });

    return () => {
      document.removeEventListener('WeixinJSBridgeReady', tryPlay);
      window.removeEventListener('touchstart', tryPlay);
      window.removeEventListener('click', tryPlay);
    };
  }, []);

  const playMusic = () => {
    const audio = audioRef.current;
    if (!audio) return Promise.resolve(false);

    return audio
      .play()
      .then(() => {
        setIsMusicPlaying(true);
        return true;
      })
      .catch(() => {
        setIsMusicPlaying(false);
        return false;
      });
  };

  const startInvitation = () => {
    playMusic().finally(() => setShowMusicPrompt(false));
  };

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      playMusic();
      return;
    }

    audio.pause();
    setIsMusicPlaying(false);
  };

  return (
    <div className="page">
      <Petals />
      <audio ref={audioRef} src={musicSrc} loop autoPlay playsInline preload="auto" />
      {showMusicPrompt && (
        <div className="music-gate" role="dialog" aria-modal="true" aria-label="开启背景音乐">
          <button className="music-gate-button" type="button" onClick={startInvitation}>
            <span className="music-gate-icon" aria-hidden="true">♪</span>
            <span>点击开启音乐</span>
            <small>进入我们的婚礼邀请函</small>
          </button>
        </div>
      )}
      <main className="invitation-card">
        <span className="decorative-flower flower-left" aria-hidden="true" />
        <span className="decorative-flower flower-right" aria-hidden="true" />
        <header className="hero section" id="home">
          <button
            className={`music-button ${isMusicPlaying ? 'is-playing' : 'is-paused'}`}
            type="button"
            aria-label={isMusicPlaying ? '暂停背景音乐' : '播放背景音乐'}
            aria-pressed={isMusicPlaying}
            onClick={toggleMusic}
          >
            <span aria-hidden="true">♪</span>
          </button>
          <div className="heart-mark">♥</div>
          <p className="domain">Wedding Invitation</p>
          <div className="ornament" aria-hidden="true" />
          <h1>我们结婚啦</h1>
          <p className="subtitle">诚挚邀请您见证我们的幸福时刻</p>

          <div className="portrait-frame" aria-label="新人合影剪影">
            <img className="couple-photo" src="/optimized/couple-photo.webp" alt="王刚和谢何丽婚纱照" />
            <span className="gold-heart">♥</span>
          </div>

          <div className="names">
            <div>
              <strong>王刚</strong>
              <span>Wang Gang</span>
            </div>
            <i>♥</i>
            <div>
              <strong>谢何丽</strong>
              <span>Xie Heli</span>
            </div>
          </div>
        </header>

        <section className="section wedding-details" aria-label="婚礼信息">
          <article>
            <span className="detail-icon">▣</span>
            <p>婚礼日期</p>
            <strong>2026.09.24</strong>
            <small>星期四</small>
          </article>
          <article>
            <span className="detail-icon">◷</span>
            <p>婚礼时间</p>
            <strong>12:00</strong>
            <small>午宴启席</small>
          </article>
          <article>
            <span className="detail-icon">⌖</span>
            <p>婚礼地点</p>
            <strong>罗泉镇</strong>
            <small>共和村</small>
          </article>
        </section>

        <section className="section soft-panel">
          <h2>浪漫倒计时</h2>
          <Countdown />
        </section>

        <section className="section soft-panel story" id="story">
          <h2>爱情故事</h2>
          <p>
            从相遇到相知，从心动到相守，我们把每一个平凡日子都写成了温柔的章节。愿这一天，有您在场，见证我们把余生交给彼此。
          </p>
        </section>

        <section className="section soft-panel photo-story-section" id="gallery">
          <h2>照片墙</h2>
          <header className="storyHeader">
            <span>Our Story</span>
            <h2>爱的轨迹</h2>
            <p>记录我们从心动到相守的每一步</p>
          </header>
          <div className="storyGallery">
            {storyTimeline.map((block, index) => {
              if (block.type === 'quote') {
                return (
                  <div className="storyQuote" key={`${block.type}-${index}`}>
                    <p>{block.text}</p>
                  </div>
                );
              }

              if (block.type === 'duo' || block.type === 'stagger') {
                return (
                  <div className={`storyDuo ${block.type === 'stagger' ? 'storyStagger' : ''}`} key={`${block.type}-${index}`}>
                    {block.items.map((item) => (
                      <figure className="storyCard" key={item.image}>
                        <img src={item.image} alt={item.alt} loading="lazy" />
                      </figure>
                    ))}
                    <p className="storyCaption">{block.title}</p>
                  </div>
                );
              }

              if (block.type === 'ending') {
                return (
                  <div className="storyEnding" key={`${block.type}-${index}`}>
                    <p>{block.text}</p>
                  </div>
                );
              }

              return (
                <figure className={`storyCard story${block.type[0].toUpperCase()}${block.type.slice(1)}`} key={block.image}>
                  <img src={block.image} alt={block.alt} loading={index === 0 ? 'eager' : 'lazy'} />
                  <figcaption>
                    <strong>{block.title}</strong>
                    {block.text && <span>{block.text}</span>}
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </section>

        <WeddingCalendar />

        <section className="section venue-section" id="map">
          <h2>婚礼地图</h2>
          <div className="map-wrap" aria-label="婚礼地点导航">
          <header className="section-title">
            <span>The Venue</span>
            <h2>婚礼地图</h2>
          </header>
          <div className="venue-card" aria-label="婚礼地点导航">
            <div className="venue-info">
              <span className="venue-ornament" aria-hidden="true">♡</span>
              <h3>{weddingVenue}</h3>
              <p>{weddingAddress}</p>
            </div>
            <div className="map-frame">
              <WeddingMap />
            </div>
            <p className="map-address">{weddingVenue}</p>
            <a className="btn map-btn" href={amapUrl} target="_blank" rel="noreferrer">
              打开高德地图导航
            </a>
            <div className="contact-actions" aria-label="联系新人">
              <a className={`contact-btn ${groomPhone ? '' : 'is-disabled'}`} href={groomPhone ? `tel:${groomPhone}` : '#map'}>
                <span aria-hidden="true">☎</span>
                联系新郎
              </a>
              <a className={`contact-btn ${bridePhone ? '' : 'is-disabled'}`} href={bridePhone ? `tel:${bridePhone}` : '#map'}>
                <span aria-hidden="true">☎</span>
                联系新娘
              </a>
            </div>
            <p className="venue-note">诚挚邀请您出席，见证我们的幸福时刻</p>
          </div>
          </div>
        </section>

        <section className="section rsvp" id="rsvp">
          <p>诚挚邀请您出席</p>
          <a className="btn" href="mailto:rsvp@wgxhl.space?subject=婚礼出席确认">
            回复出席
          </a>
        </section>

        <nav className="bottom-nav" aria-label="婚礼邀请导航">
          <a href="#home">
            <span>♡</span>
            关于我们
          </a>
          <a href="#story">
            <span>▧</span>
            爱情故事
          </a>
          <a href="#gallery">
            <span>♧</span>
            礼金祝福
          </a>
          <a href="#map">
            <span>✉</span>
            联系新人
          </a>
        </nav>
      </main>
    </div>
  );
}
