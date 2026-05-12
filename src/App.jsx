import { useEffect, useMemo, useRef, useState } from 'react';

const weddingDate = new Date('2026-09-24T12:00:00+08:00');
const weddingVenue = '内江市';
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
    type: 'proposal',
    label: '03',
    title: '那一晚，灯光很暖，答案很坚定',
    text: '从藏在身后的花束，到认真说出的承诺，幸福在灯光里被温柔接住。',
    items: [
      {
        image: '/optimized/gallery/proposal-3.webp',
        alt: '求婚现场新郎藏起花束准备惊喜',
      },
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
    type: 'wide',
    label: '04',
    image: '/optimized/gallery/IMGL5055.webp',
    alt: '湖边夕阳下的新郎新娘婚纱照',
    title: '把余生，轻轻交给你',
  },
  {
    type: 'trio',
    label: '05',
    title: '晴空与绿意之间，爱意慢慢铺展',
    text: '把笑意交给风，也把以后交给彼此。',
    feature: {
      image: '/optimized/gallery/IMGL4991.webp',
      alt: '草地与蓝天里的新人婚纱照',
    },
    items: [
      {
        image: '/optimized/gallery/IMGL4980.webp',
        alt: '草地里相望的新人婚纱照',
      },
      {
        image: '/optimized/gallery/IMGL4985.webp',
        alt: '草地里相依的新人婚纱照',
      },
    ],
  },
  {
    type: 'duo',
    label: '06',
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
    label: '07',
    image: '/optimized/gallery/IMGL4949.webp',
    alt: '桥下光影电影感婚纱照',
    title: '在光影交错的人海里\n我们还是走向了彼此',
  },
  {
    type: 'portrait',
    label: '08',
    image: '/optimized/gallery/IMGL4748.webp',
    alt: '新郎新娘黑色背景婚纱照',
    title: '故事未完，婚礼现场继续',
  },
];

const cinematicScenes = [
  {
    id: 'future',
    image: '/optimized/cinematic/IMGL5133.webp',
    alt: '夕阳湖边相拥的新郎新娘婚纱照',
    title: '把未来\n交给彼此',
    text: '余生很长，我们慢慢走。',
    tone: 'sunset',
    align: 'lower-left',
  },
  {
    id: 'city',
    image: '/optimized/cinematic/IMGL4964.webp',
    alt: '暖色光影里回眸的新娘婚纱照',
    title: '在人海与晚风里\n我们终于走向彼此',
    tone: 'city',
    align: 'upper-left',
  },
  {
    id: 'beside',
    image: '/optimized/cinematic/IMGL5105.webp',
    alt: '湖边新郎抱起新娘的婚纱照',
    title: '从此\n不再是一个人',
    text: '有你在身边，就是未来。',
    tone: 'soft',
    align: 'upper-left',
  },
];

const petals = Array.from({ length: 18 }, (_, index) => ({
  id: index,
  image: `/optimized/petal-${(index % 3) + 1}.webp`,
  left: `${(index * 17) % 100}%`,
  size: `${48 + (index % 5) * 12}px`,
  xMid: `${(index % 2 === 0 ? 1 : -1) * (28 + (index % 4) * 14)}px`,
  xEnd: `${(index % 3 - 1) * (42 + (index % 5) * 10)}px`,
  scale: (0.42 + (index % 6) * 0.07).toFixed(2),
  opacity: (0.34 + (index % 5) * 0.08).toFixed(2),
  rotate: `${(index * 37) % 220}deg`,
  delay: `${(index % 9) * -1.35}s`,
  duration: `${14 + (index % 7) * 1.6}s`,
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
  const monthNumber = String(month + 1).padStart(2, '0');
  const dayNumber = String(weddingDay).padStart(2, '0');
  const hour = String(weddingDate.getHours()).padStart(2, '0');
  const minute = String(weddingDate.getMinutes()).padStart(2, '0');
  const weekDay = new Intl.DateTimeFormat('zh-CN', { weekday: 'long' }).format(weddingDate);
  const monthDays = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const leadingBlanks = firstDay;
  const calendarCells = [
    ...Array.from({ length: leadingBlanks }, (_, index) => ({ id: `blank-${index}`, day: null })),
    ...Array.from({ length: monthDays }, (_, index) => ({ id: `day-${index + 1}`, day: index + 1 })),
  ];

  return (
    <section className="section calendar-section" aria-label="婚礼日历">
      <div className="calendar-invite-card">
        <div className="calendar-topline">
          <figure className="calendar-polaroid calendar-polaroid-groom">
            <img src="/optimized/gallery/IMGL4651.webp" alt="湖边新郎肖像" loading="lazy" />
          </figure>

          <div className="calendar-date-hero">
            <div className="calendar-kicker">
              <span aria-hidden="true" />
              <strong>SAVE THE DATE</strong>
              <span aria-hidden="true" />
            </div>
            <i aria-hidden="true">♥</i>
            <div className="calendar-big-date" aria-label={`${month + 1}月${weddingDay}日`}>
              <span>{monthNumber}</span>
              <em>/</em>
              <span>{dayNumber}</span>
            </div>
            <div className="calendar-year">- {year} -</div>
            <p>
              <span>{year}年 {month + 1}月 {weddingDay}日 {hour}:{minute}</span>
              <span>{weekDay}</span>
            </p>
          </div>

          <figure className="calendar-polaroid calendar-polaroid-bride">
            <img src="/optimized/gallery/IMGL4623.webp" alt="湖边新娘肖像" loading="lazy" />
          </figure>
        </div>

        <div className="calendar-weekdays" aria-hidden="true">
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
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

        <p className="calendar-wish">期待与您共度这一天 ♥</p>
      </div>
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
            '--petal-size': petal.size,
            '--petal-x-mid': petal.xMid,
            '--petal-x-end': petal.xEnd,
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

function CinematicScene({ scene }) {
  return (
    <section className={`section cinematic-scene cinematic-${scene.tone} cinematic-${scene.align}`} aria-label={scene.title}>
      <img className="cinematic-image" src={scene.image} alt={scene.alt} loading="lazy" />
      <div className="cinematic-glow" aria-hidden="true" />
      <div className="cinematic-petals" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="cinematic-copy">
        <span className="cinematic-line" aria-hidden="true" />
        <h2>
          {scene.title.split('\n').map((line) => (
            <span key={line}>{line}</span>
          ))}
        </h2>
        {scene.text && <p>{scene.text}</p>}
      </div>
    </section>
  );
}

function StoryBlock({ block, index }) {
  if (block.type === 'quote') {
    return (
      <div className="storyQuote">
        <p>{block.text}</p>
      </div>
    );
  }

  if (block.type === 'duo' || block.type === 'stagger') {
    return (
      <div className={`storyDuo ${block.type === 'stagger' ? 'storyStagger' : ''}`} data-label={block.label}>
        {block.items.map((item) => (
          <figure className="storyCard" key={item.image}>
            <img src={item.image} alt={item.alt} loading="lazy" />
          </figure>
        ))}
        <p className="storyCaption">{block.title}</p>
      </div>
    );
  }

  if (block.type === 'proposal') {
    return (
      <div className="storyProposal" data-label={block.label}>
        <div className="storyProposalGrid">
          {block.items.map((item) => (
            <figure className="storyCard storyProposalCard" key={item.image}>
              <img src={item.image} alt={item.alt} loading="lazy" />
            </figure>
          ))}
        </div>
        <div className="storyTrioCaption storyProposalCaption">
          <strong>{block.title}</strong>
          <span>{block.text}</span>
        </div>
      </div>
    );
  }

  if (block.type === 'trio') {
    return (
      <div className="storyTrio" data-label={block.label}>
        <figure className="storyCard storyTrioFeature">
          <img src={block.feature.image} alt={block.feature.alt} loading="lazy" />
        </figure>
        <div className="storyTrioPair">
          {block.items.map((item) => (
            <figure className="storyCard" key={item.image}>
              <img src={item.image} alt={item.alt} loading="lazy" />
            </figure>
          ))}
        </div>
        <div className="storyTrioCaption">
          <strong>{block.title}</strong>
          <span>{block.text}</span>
        </div>
      </div>
    );
  }

  if (block.type === 'ending') {
    return (
      <div className="storyEnding">
        <p>{block.text}</p>
      </div>
    );
  }

  return (
    <figure className={`storyCard story${block.type[0].toUpperCase()}${block.type.slice(1)}`} data-label={block.label}>
      <img src={block.image} alt={block.alt} loading={index === 0 ? 'eager' : 'lazy'} />
      <figcaption>
        <strong>{block.title}</strong>
        {block.text && <span>{block.text}</span>}
      </figcaption>
    </figure>
  );
}

function NavIcon({ name }) {
  const icons = {
    home: (
      <>
        <path d="M4 10.5 12 4l8 6.5" />
        <path d="M6.5 9.5V20h11V9.5" />
        <path d="M10 20v-6h4v6" />
      </>
    ),
    story: (
      <>
        <path d="M6 5.5h7a4 4 0 0 1 4 4V19H9a3 3 0 0 0-3 3V5.5Z" />
        <path d="M6 5.5A3 3 0 0 0 3 8.5V19h6" />
        <path d="M9 9h4" />
        <path d="M9 13h5" />
      </>
    ),
    contact: (
      <>
        <path d="M7 6.5h10a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-6a3 3 0 0 1 3-3Z" />
        <path d="m5 9 7 5 7-5" />
      </>
    ),
  };

  return (
    <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
      {icons[name]}
    </svg>
  );
}

export default function App() {
  const audioRef = useRef(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [showMusicPrompt, setShowMusicPrompt] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    const revealItems = Array.from(
      document.querySelectorAll('.section:not(.hero), .storyGallery > *, .date-summary, .calendar-card, .calendar-invite-card, .venue-card, .rsvp')
    );

    root.classList.add('reveal-enabled');
    revealItems.forEach((item, index) => {
      item.classList.add('reveal-item');
      item.style.setProperty('--reveal-delay', `${Math.min(index % 4, 3) * 90}ms`);
    });

    if (!('IntersectionObserver' in window)) {
      revealItems.forEach((item) => item.classList.add('is-visible'));

      return () => {
        revealItems.forEach((item) => {
          item.classList.remove('reveal-item', 'is-visible');
          item.style.removeProperty('--reveal-delay');
        });
        root.classList.remove('reveal-enabled');
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.14 }
    );

    revealItems.forEach((item) => observer.observe(item));

    return () => {
      observer.disconnect();
      revealItems.forEach((item) => {
        item.classList.remove('reveal-item', 'is-visible');
        item.style.removeProperty('--reveal-delay');
      });
      root.classList.remove('reveal-enabled');
    };
  }, []);

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

  const playMusic = (fadeIn = false) => {
    const audio = audioRef.current;
    if (!audio) return Promise.resolve(false);

    if (fadeIn) {
      audio.volume = 0;
    }

    return audio
      .play()
      .then(() => {
        setIsMusicPlaying(true);
        if (fadeIn) {
          const targetVolume = 0.55;
          const startedAt = performance.now();
          const fade = (now) => {
            const progress = Math.min((now - startedAt) / 1200, 1);
            audio.volume = targetVolume * progress;

            if (progress < 1) {
              requestAnimationFrame(fade);
            }
          };

          requestAnimationFrame(fade);
        }
        return true;
      })
      .catch(() => {
        setIsMusicPlaying(false);
        return false;
      });
  };

  const startInvitation = () => {
    playMusic(true).finally(() => setShowMusicPrompt(false));
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
        <div className="music-gate opening-screen" role="dialog" aria-modal="true" aria-label="开启我们的故事">
          <div className="opening-petals" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <button className="music-gate-button" type="button" onClick={startInvitation}>
            <span className="opening-kicker">Wedding Invitation</span>
            <strong>王刚 & 谢何丽</strong>
            <span>点击开启我们的故事</span>
            <small>2026.09.24</small>
          </button>
        </div>
      )}
      <main className="invitation-card">
        <span className="decorative-flower flower-left" aria-hidden="true" />
        <span className="decorative-flower flower-right" aria-hidden="true" />
        <header className="hero section" id="home">
          <div className="hero-sparkles" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
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
            <img className="couple-photo" src="/optimized/couple-photo-4601.webp" alt="王刚和谢何丽湖边婚纱照" />
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
            <strong>资中县</strong>
            <small>罗泉镇</small>
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
            <p>从心动开始</p>
          </header>
          <div className="storyGallery">
            {storyTimeline.slice(0, 3).map((block, index) => (
              <StoryBlock block={block} index={index} key={`${block.type}-${block.label}`} />
            ))}
          </div>
        </section>

        <CinematicScene scene={cinematicScenes[0]} />

        <section className="section soft-panel photo-story-section story-continuation">
          <header className="storyHeader">
            <span>Chapter Two</span>
            <h2>并肩而行</h2>
            <p>把以后慢慢走长</p>
          </header>
          <div className="storyGallery">
            {storyTimeline.slice(3, 7).map((block, index) => (
              <StoryBlock block={block} index={index + 3} key={`${block.type}-${block.label}`} />
            ))}
          </div>
        </section>

        <CinematicScene scene={cinematicScenes[1]} />

        <section className="section soft-panel photo-story-section story-coda">
          <header className="storyHeader">
            <span>From Now On</span>
            <h2>从此</h2>
            <p>故事未完</p>
          </header>
          <div className="storyGallery">
            {storyTimeline.slice(7).map((block, index) => (
              <StoryBlock block={block} index={index + 7} key={`${block.type}-${block.label}`} />
            ))}
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
              <span className="venue-kicker">Wedding Venue</span>
              <h3>{weddingVenue}</h3>
              <p>{weddingAddress}</p>
            </div>
            <div className="map-frame">
              <WeddingMap />
            </div>
            <p className="map-address">
              <span>婚礼地址</span>
              {weddingAddress} · 元坝子
            </p>
            <a className="btn map-btn" href={amapUrl} target="_blank" rel="noreferrer">
              <span className="map-btn-icon" aria-hidden="true">⌖</span>
              <span>立即导航</span>
              <i aria-hidden="true">→</i>
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

        <nav className="bottom-nav" aria-label="婚礼邀请导航">
          <a href="#home">
            <NavIcon name="home" />
            关于我们
          </a>
          <a href="#story">
            <NavIcon name="story" />
            爱情故事
          </a>
          <a href="#map">
            <NavIcon name="contact" />
            联系新人
          </a>
        </nav>

        <CinematicScene scene={cinematicScenes[2]} />

        <section className="section rsvp closing-section" id="rsvp">
          <span className="closing-kicker">With Love</span>
          <time className="closing-date" dateTime="2026-09-24T12:00:00+08:00">2026.09.24</time>
          <p>期待与您相见</p>
          <span className="closing-note">见证我们的幸福时刻</span>
          <div className="closing-names" aria-label="新人姓名">
            <strong>王刚</strong>
            <i>♡</i>
            <strong>谢何丽</strong>
          </div>
        </section>
      </main>
    </div>
  );
}
