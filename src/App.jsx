import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bag,
  CaretDown,
  CaretLeft,
  Check,
  CheckCircle,
  ClipboardText,
  Clock,
  CreditCard,
  Funnel,
  Heart,
  House,
  Info,
  List,
  MagnifyingGlass,
  MapPin,
  Minus,
  Package,
  Plus,
  Receipt,
  SealCheck,
  ShoppingCart,
  SignIn,
  SlidersHorizontal,
  Sparkle,
  SquaresFour,
  Star,
  Storefront,
  Trash,
  Truck,
  User,
  Warning,
  X,
} from "@phosphor-icons/react";
import { brandLogos, brands, categories, formatPrice, guides, navItems, products } from "./data.js";

const CartContext = createContext({ cart: {}, changeQuantity: () => {} });

function resetScrollPosition() {
  const scrollingElement = document.scrollingElement || document.documentElement;
  scrollingElement.scrollTop = 0;
  scrollingElement.scrollLeft = 0;
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
}

function usePath() {
  const [location, setLocation] = useState(() => `${window.location.pathname}${window.location.search}`);
  useEffect(() => {
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    const handle = () => {
      setLocation(`${window.location.pathname}${window.location.search}`);
      window.requestAnimationFrame(resetScrollPosition);
    };
    window.addEventListener("popstate", handle);
    return () => {
      window.removeEventListener("popstate", handle);
      window.history.scrollRestoration = previousRestoration;
    };
  }, []);
  useEffect(() => {
    resetScrollPosition();
    const frame = window.requestAnimationFrame(resetScrollPosition);
    return () => window.cancelAnimationFrame(frame);
  }, [location]);
  return location;
}

function navigate(href) {
  window.history.pushState({}, "", href);
  resetScrollPosition();
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function useDialogA11y(open, onClose) {
  const dialogRef = useRef(null);
  const previousFocus = useRef(null);

  useEffect(() => {
    if (!open || !dialogRef.current) return undefined;
    previousFocus.current = document.activeElement;
    const dialog = dialogRef.current;
    const selector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusables = () => [...dialog.querySelectorAll(selector)].filter((element) => element.offsetParent !== null);
    const initialFocus = dialog.querySelector("[data-dialog-initial], input, textarea, select") || focusables()[0];
    initialFocus?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus.current?.focus?.();
    };
  }, [open, onClose]);

  return dialogRef;
}

function Link({ href, children, className = "", onClick, ...props }) {
  return (
    <a
      href={href}
      className={className}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        onClick?.(event);
        if (event.defaultPrevented) return;
        event.preventDefault();
        navigate(href);
      }}
      {...props}
    >
      {children}
    </a>
  );
}

function IconButton({ label, children, className = "", ...props }) {
  return (
    <button className={`icon-button ${className}`} aria-label={label} title={label} {...props}>
      {children}
    </button>
  );
}

function Logo() {
  return (
    <Link href="/" className="brand-logo" aria-label="صفحه اصلی Magieto">
      <img src={`${import.meta.env.BASE_URL}assets/magieto-logo.png`} alt="" />
    </Link>
  );
}

const megaDetails = {
  "مراقبت پوست": { image: categories[0].image, title: "مراقبت پوست", links: ["ضدآفتاب", "آبرسان و مرطوب‌کننده", "سرم و درمان هدفمند", "پاک‌کننده"] },
  "مراقبت مو": { image: categories[1].image, title: "مراقبت مو", links: ["شامپو", "ماسک و نرم‌کننده", "روغن و سرم مو", "مراقبت موی رنگ‌شده"] },
  "آرایش": { image: categories[2].image, title: "آرایش", links: ["آرایش صورت", "آرایش لب", "آرایش چشم", "ابزار آرایشی"] },
  "عطر": { image: categories[3].image, title: "عطر و رایحه", links: ["عطر زنانه", "عطر مردانه", "بادی اسپلش", "اسپری بدن"] },
  "برندها": { image: "/assets/hero-banner-makeup.webp", title: "برندها", links: brands.slice(0, 4) },
  "راهنماها": { image: guides[0].image, title: "راهنمای انتخاب", links: ["ترکیبات پوست", "روتین روزانه", "مراقبت مو", "انتخاب رنگ"] },
  "پیشنهادهای ویژه": { image: "/assets/hero-banner-suncare.webp", title: "پیشنهادهای ویژه", links: ["میز تخفیف", "پرفروش‌ها", "خرید روزمره", "موجودی محدود"] },
};

const navIcons = {
  "مراقبت پوست": Sparkle,
  "مراقبت مو": SlidersHorizontal,
  "آرایش": Star,
  "عطر": SealCheck,
  "برندها": Storefront,
  "راهنماها": ClipboardText,
  "پیشنهادهای ویژه": Receipt,
};

function Header({ cart, wishlist, cartCount, wishlistCount, isLoggedIn, onLogin, onLogout, onOpenMenu }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [activeMega, setActiveMega] = useState(null);
  const cartItems = Object.values(cart);
  const wishlistItems = products.filter((product) => wishlist.has(product.id));
  const matches = useMemo(
    () =>
      query.trim()
        ? products.filter((p) => `${p.name} ${p.brand} ${p.category}`.includes(query.trim())).slice(0, 4)
        : [],
    [query],
  );

  const submit = (event) => {
    event.preventDefault();
    const normalized = query.trim();
    if (!normalized) return;
    setSearchOpen(false);
    navigate(`/products?q=${encodeURIComponent(normalized)}`);
  };

  return (
    <>
      <div className="announcement">
        <div className="container announcement__inner">
          <span>اطلاعات موجودی و قیمت پیش از پرداخت دوباره بررسی می‌شود</span>
          <Link href="/authenticity">شیوه بررسی اصالت و تأمین <CaretLeft size={14} /></Link>
        </div>
      </div>
      <header className="site-header">
        <div className="container header-main">
          <button className="mobile-menu-button" aria-label="باز کردن منو" onClick={onOpenMenu}>
            <List size={24} />
          </button>
          <Logo />
          <form className={`search-box ${searchOpen ? "is-open" : ""}`} onSubmit={submit}>
            <MagnifyingGlass size={21} aria-hidden="true" />
            <input
              value={query}
              onFocus={() => setSearchOpen(true)}
              onChange={(event) => {
                setQuery(event.target.value);
                setSearchOpen(true);
              }}
              placeholder="نام محصول، برند یا نیاز پوست و مو"
              aria-label="جست‌وجوی محصولات"
            />
            {query && (
              <button type="button" aria-label="پاک کردن جست‌وجو" onClick={() => setQuery("")}>
                <X size={17} />
              </button>
            )}
            {searchOpen && (
              <div className="search-popover">
                <div className="search-popover__head">
                  <strong>{query ? "پیشنهادهای مرتبط" : "جست‌وجوهای پیشنهادی"}</strong>
                  <button type="button" onClick={() => setSearchOpen(false)}>بستن</button>
                </div>
                {!query && (
                  <div className="chip-row">
                    {["ضدآفتاب پوست چرب", "سرم ویتامین C", "ماسک موی رنگ‌شده"].map((item) => (
                      <button key={item} type="button" className="chip" onClick={() => setQuery(item)}>{item}</button>
                    ))}
                  </div>
                )}
                {query && matches.length === 0 && (
                  <div className="search-empty">
                    <MagnifyingGlass size={24} />
                    نتیجه دقیقی پیدا نشد. عبارت کوتاه‌تری امتحان کنید.
                  </div>
                )}
                {matches.map((product) => (
                  <Link key={product.id} href={`/product/${product.id}`} className="search-result" onClick={() => setSearchOpen(false)}>
                    <img src={product.image} alt="" />
                    <span><strong>{product.name}</strong><small>{product.brand} · {product.volume}</small></span>
                    <span>{formatPrice(product.price)}</span>
                  </Link>
                ))}
                {query && matches.length > 0 && (
                  <button className="search-all" type="submit">مشاهده همه نتایج برای «{query}»</button>
                )}
              </div>
            )}
          </form>
          <div className="header-actions">
            <div className="header-action-wrap" onPointerEnter={(event) => { if (event.pointerType === "mouse") { setAccountOpen(true); setCartOpen(false); setWishlistOpen(false); } }} onPointerLeave={(event) => { if (event.pointerType === "mouse") setAccountOpen(false); }}>
              <button className="header-action" aria-label="حساب کاربری" aria-expanded={accountOpen} onClick={() => { setAccountOpen((open) => !open); setCartOpen(false); setWishlistOpen(false); }}>
                <User size={24} />
              </button>
              {accountOpen && <div className="header-popover account-popover">
                <div className="popover-user"><span>س</span><div><strong>{isLoggedIn ? "سارا نادری" : "حساب Magieto"}</strong><small>{isLoggedIn ? "۰۹۱۲•••۴۵۶۷" : "برای مشاهده سفارش‌ها وارد شوید"}</small></div></div>
                <Link href="/account"><House size={17} />نمای کلی حساب</Link>
                <Link href="/account/profile"><User size={17} />اطلاعات شخصی</Link>
                <Link href="/account/orders"><Package size={17} />سفارش‌های من</Link>
                {isLoggedIn ? <button className="popover-logout" onClick={onLogout}><SignIn size={17} />خروج از حساب</button> : <button className="popover-login" onClick={onLogin}>ورود یا ساخت حساب</button>}
              </div>}
            </div>
            <div className="header-action-wrap wishlist-action-wrap" onPointerEnter={(event) => { if (event.pointerType === "mouse") { setWishlistOpen(true); setAccountOpen(false); setCartOpen(false); } }} onPointerLeave={(event) => { if (event.pointerType === "mouse") setWishlistOpen(false); }}>
              <button className="header-action cart-trigger" aria-label="علاقه‌مندی‌ها" aria-expanded={wishlistOpen} onClick={() => { setWishlistOpen((open) => !open); setAccountOpen(false); setCartOpen(false); }}>
                <Heart size={24} />{wishlistCount > 0 && <b>{wishlistCount}</b>}
              </button>
              {wishlistOpen && <div className="header-popover wishlist-popover">
                <div className="cart-popover__head"><strong>علاقه‌مندی‌ها</strong><span>{wishlistCount.toLocaleString("fa-IR")} محصول</span></div>
                <div className="cart-popover__items">{wishlistItems.length ? wishlistItems.slice(0, 4).map((product) => <Link href={`/product/${product.id}`} key={product.id}><img src={product.image} alt="" /><span><strong>{product.name}</strong><small>{product.brand} · {formatPrice(product.price)}</small></span></Link>) : <p>هنوز محصولی ذخیره نشده است.</p>}</div>
                <div className="header-popover__footer"><Link href="/wishlist" className="button primary wide">مشاهده علاقه‌مندی‌ها <ArrowLeft size={17} /></Link></div>
              </div>}
            </div>
            <div className="header-action-wrap cart-action-wrap" onPointerEnter={(event) => { if (event.pointerType === "mouse") { setCartOpen(true); setAccountOpen(false); setWishlistOpen(false); } }} onPointerLeave={(event) => { if (event.pointerType === "mouse") setCartOpen(false); }}>
              <button className="header-action cart-trigger" aria-label="سبد خرید" aria-expanded={cartOpen} onClick={() => { setCartOpen((open) => !open); setAccountOpen(false); setWishlistOpen(false); }}>
                <Bag size={24} />{cartCount > 0 && <b>{cartCount}</b>}
              </button>
              {cartOpen && <div className="header-popover cart-popover">
                <div className="cart-popover__head"><strong>سبد خرید</strong><span>{cartCount.toLocaleString("fa-IR")} کالا</span></div>
                <div className="cart-popover__items">
                  {cartItems.length ? cartItems.slice(0, 4).map(({ product, qty }) => <Link href={`/product/${product.id}`} key={product.id}><img src={product.image} alt="" /><span><strong>{product.name}</strong><small>{qty.toLocaleString("fa-IR")} عدد · {formatPrice(product.price * qty)}</small></span></Link>) : <p>سبد خرید شما خالی است.</p>}
                </div>
                <div className="header-popover__footer"><Link href="/cart" className="button primary wide">رفتن به سبد خرید <ArrowLeft size={17} /></Link></div>
              </div>}
            </div>
          </div>
        </div>
        <nav className="main-nav" aria-label="دسته‌بندی‌های اصلی" onPointerLeave={(event) => { if (event.pointerType === "mouse") setActiveMega(null); }}>
          <div className="container main-nav__inner">
            {navItems.map((item) => {
              const NavIcon = navIcons[item.label];
              return <Link key={item.href} href={item.href} onPointerEnter={(event) => { if (event.pointerType === "mouse") setActiveMega(item.label); }}><NavIcon size={13} weight="regular" />{item.label}</Link>;
            })}
          </div>
          {activeMega && <div className="mega-menu container">
            <div><span>{megaDetails[activeMega].title}</span><div className="mega-menu__links">{megaDetails[activeMega].links.map((label) => <Link key={label} href={`/products?q=${encodeURIComponent(label)}`}>{label}<ArrowLeft size={14} /></Link>)}</div></div>
            <Link href={navItems.find((item) => item.label === activeMega)?.href || "/products"} className="mega-menu__image"><img src={megaDetails[activeMega].image} alt="" /><span>مشاهده مجموعه {activeMega}</span></Link>
          </div>}
        </nav>
      </header>
    </>
  );
}

function MobileDrawer({ open, onClose, onLogin }) {
  const dialogRef = useDialogA11y(open, onClose);
  if (!open) return null;
  return (
    <div ref={dialogRef} className="drawer-layer" role="dialog" aria-modal="true" aria-label="منوی موبایل">
      <button className="drawer-backdrop" aria-label="بستن منو" tabIndex="-1" onClick={onClose} />
      <aside className="mobile-drawer">
        <div className="drawer-head"><IconButton label="بستن منو" data-dialog-initial onClick={onClose}><X size={22} /></IconButton><Logo /></div>
        <button className="account-entry" onClick={() => { onClose(); onLogin(); }}>
          <User size={24} /><span><strong>ورود یا ساخت حساب</strong><small>پیگیری سفارش و خرید سریع‌تر</small></span><CaretLeft size={18} />
        </button>
        <nav>
          {navItems.map((item) => <Link key={item.href} href={item.href} onClick={onClose}>{item.label}<CaretLeft size={17} /></Link>)}
          <Link href="/tracking" onClick={onClose}>پیگیری سفارش <CaretLeft size={17} /></Link>
          <Link href="/faq" onClick={onClose}>پرسش‌های متداول <CaretLeft size={17} /></Link>
        </nav>
      </aside>
    </div>
  );
}

function LoginModal({ open, onClose, onSuccess }) {
  const [mode, setMode] = useState("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const dialogRef = useDialogA11y(open, onClose);
  const submit = (event) => {
    event.preventDefault();
    if (mode === "phone") {
      if (!/^09\d{9}$/.test(phone)) {
        setError("شماره موبایل را به‌صورت ۰۹xxxxxxxxx وارد کنید.");
        return;
      }
      setError("");
      setMode("otp");
      return;
    }
    if (otp !== "12345") {
      setError("برای نسخه نمایشی، کد ۱۲۳۴۵ را وارد کنید.");
      return;
    }
    onSuccess();
    onClose();
  };
  if (!open) return null;
  return (
    <div ref={dialogRef} className="modal-layer" role="dialog" aria-modal="true" aria-labelledby="login-title">
      <button className="modal-backdrop" tabIndex="-1" onClick={onClose} aria-label="بستن پنجره ورود" />
      <div className="login-modal">
        <div className="modal-head">
          <div><span className="eyebrow">حساب Magieto</span><h2 id="login-title">{mode === "phone" ? "ورود با شماره موبایل" : "کد تأیید را وارد کنید"}</h2></div>
          <IconButton label="بستن" onClick={onClose}><X size={21} /></IconButton>
        </div>
        <p>{mode === "phone" ? "برای پیگیری سفارش‌ها و نگهداری انتخاب‌ها، شماره همراه خود را وارد کنید." : `کد نمایشی برای ${phone} ارسال شد.`}</p>
        <form onSubmit={submit} noValidate>
          {mode === "phone" ? (
            <label className="field"><span>شماره موبایل</span><input inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))} placeholder="۰۹۱۲۱۲۳۴۵۶۷" /></label>
          ) : (
            <label className="field"><span>کد پنج‌رقمی</span><input inputMode="numeric" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 5))} placeholder="۱۲۳۴۵" /></label>
          )}
          {error && <div className="field-error"><Warning size={17} />{error}</div>}
          <button className="button primary wide" type="submit">{mode === "phone" ? "دریافت کد ورود" : "تأیید و ورود"}</button>
          {mode === "otp" && <button className="button text wide" type="button" onClick={() => { setMode("phone"); setError(""); }}>اصلاح شماره موبایل</button>}
        </form>
        <small>با ادامه، <Link href="/terms" onClick={onClose}>قوانین استفاده</Link> و <Link href="/privacy" onClick={onClose}>حریم خصوصی</Link> را می‌پذیرید.</small>
      </div>
    </div>
  );
}

function Toast({ message }) {
  if (!message) return null;
  return <div className="toast" role="status"><CheckCircle size={21} weight="fill" />{message}</div>;
}

function Breadcrumb({ items }) {
  return (
    <nav className="breadcrumb" aria-label="مسیر صفحه">
      <Link href="/">Magieto</Link>
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`}><CaretLeft size={13} />{item.href ? <Link href={item.href}>{item.label}</Link> : <b>{item.label}</b>}</span>
      ))}
    </nav>
  );
}

function SectionHead({ eyebrow, title, text, href, action = "مشاهده همه" }) {
  return (
    <div className="section-head">
      <div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h2>{title}</h2>{text && <p>{text}</p>}</div>
      {href && <Link className="text-link" href={href}>{action}<ArrowLeft size={18} /></Link>}
    </div>
  );
}

function ProductCard({ product, view = "grid", isWishlisted, onWishlist, onAdd }) {
  const { cart, changeQuantity } = useContext(CartContext);
  const cartQuantity = cart[product.id]?.qty || 0;
  return (
    <article className={`product-card ${view === "list" ? "product-card--list" : ""}`}>
      <div className="product-card__media">
        <Link href={`/product/${product.id}`}><img src={product.image} alt="" /></Link>
        <IconButton label={isWishlisted ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"} className={isWishlisted ? "is-active" : ""} onClick={() => onWishlist(product)}>
          <Heart size={20} weight={isWishlisted ? "fill" : "regular"} />
        </IconButton>
      </div>
      <div className="product-card__body">
        <span className="product-brand">{product.brand}</span>
        <Link href={`/product/${product.id}`} className="product-name">{product.name}</Link>
        <div className="price-row">
          <div><strong>{formatPrice(product.price)}</strong></div>
          {cartQuantity > 0 ? (
            <div className="card-quantity" aria-label={`تعداد ${product.name} در سبد`}>
              <button type="button" aria-label={`کم کردن ${product.name}`} onClick={() => changeQuantity(product, -1)}><Minus size={13} /></button>
              <span aria-live="polite">{cartQuantity.toLocaleString("fa-IR")}</span>
              <button type="button" aria-label={`اضافه کردن ${product.name}`} onClick={() => changeQuantity(product, 1)}><Plus size={13} /></button>
            </div>
          ) : (
            <IconButton label="افزودن به سبد" className="add-compact" onClick={() => changeQuantity(product, 1)}><Plus size={18} /></IconButton>
          )}
        </div>
      </div>
    </article>
  );
}

function ProductRail({ list, wishlist, onWishlist, onAdd }) {
  return <div className="product-grid">{list.map((product) => <ProductCard key={product.id} product={product} isWishlisted={wishlist.has(product.id)} onWishlist={onWishlist} onAdd={onAdd} />)}</div>;
}

function BrandCarousel() {
  const railRef = useRef(null);
  const indexRef = useRef(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const timer = window.setInterval(() => {
      const rail = railRef.current;
      if (!rail) return;
      indexRef.current = (indexRef.current + 1) % brands.length;
      const target = rail.children[indexRef.current];
      if (!target) return;
      const railBounds = rail.getBoundingClientRect();
      const targetBounds = target.getBoundingClientRect();
      rail.scrollBy({ left: targetBounds.right - railBounds.right, behavior: "smooth" });
    }, 2000);
    return () => window.clearInterval(timer);
  }, [paused]);

  return (
    <div
      className="brand-strip"
      ref={railRef}
      aria-label="کاروسل برندهای مژیتو"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false); }}
    >
      {brands.map((brand) => <Link href={`/brand/${encodeURIComponent(brand)}`} key={brand}><img className="brand-logo-placeholder" src={brandLogos[brand]} alt="" /><strong>{brand}</strong></Link>)}
    </div>
  );
}

function CompactProductCarousel({ title, subtitle, list, wishlist, onWishlist, onAdd, href = "/products", className = "" }) {
  const railRef = useRef(null);
  const scrollRail = (direction) => railRef.current?.scrollBy({ left: direction * 620, behavior: "smooth" });
  const handleRailWheel = (event) => {
    if (!event.shiftKey && Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
    event.preventDefault();
    railRef.current?.scrollBy({ left: event.deltaX || event.deltaY, behavior: "smooth" });
  };
  return (
    <section className={`compact-section product-carousel-section container ${className}`.trim()}>
      <div className="compact-section__head">
        <div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>
        <div className="compact-section__actions">
          <button aria-label="محصولات قبلی" onClick={() => scrollRail(1)}><ArrowRight size={17} /></button>
          <button aria-label="محصولات بعدی" onClick={() => scrollRail(-1)}><ArrowLeft size={17} /></button>
          {href && <Link href={href}>مشاهده همه</Link>}
        </div>
      </div>
      <div
        className="compact-product-rail"
        ref={railRef}
        tabIndex="0"
        aria-label={`کاروسل ${title}`}
        onWheel={handleRailWheel}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") scrollRail(-1);
          if (event.key === "ArrowRight") scrollRail(1);
        }}
      >
        {list.map((product) => <ProductCard key={product.id} product={product} isWishlisted={wishlist.has(product.id)} onWishlist={onWishlist} onAdd={onAdd} />)}
      </div>
    </section>
  );
}

const heroSlides = [
  {
    brand: "مولهنس",
    title: "تازگی در هر لحظه",
    description: "با بادی‌اسپلش‌های مولهنس، رایحه‌ای ماندگار و خاص را تجربه کنید؛ با انتخاب‌هایی برای رایحه‌های زنانه و مردانه.",
    primaryLabel: "محصولات مولهنس",
    primaryHref: "/products?q=مولهنس",
    leftImage: "/assets/hero-section/mulhens-left.png",
    middleImage: "/assets/hero-section/mulhens-middle.png",
    imageAlt: "بادی اسپلش مولهنس در فضایی آبی و خنک",
    index: "۰۱",
  },
  {
    brand: "لورینت",
    title: "میکاپی ماندگار و بی‌نقص",
    description: "با پرایمر لورینت، پایه‌ای فاقد چربی و سبک برای آرایش بسازید؛ بدون ایجاد حس سنگینی روی پوست.",
    primaryLabel: "محصولات لورینت",
    primaryHref: "/products?q=لورینت",
    leftImage: "/assets/hero-section/Primer left.png",
    middleImage: "/assets/hero-section/primer middle.png",
    imageAlt: "پرایمر لورینت در فضایی بنفش",
    index: "۰۲",
  },
  {
    brand: "تاکوری",
    title: "موهایی زیبا و سالم",
    description: "با روغن جادویی تاکوری، لطافت و درخشندگی را به موها برگردانید و روتین مراقبت مو را کامل کنید.",
    primaryLabel: "محصولات تاکوری",
    primaryHref: "/products?q=تاکوری",
    leftImage: "{`${import.meta.env.BASE_URL}/assets/hero-section/tacori left.png`}",
    middleImage: "{`${import.meta.env.BASE_URL}/assets/hero-section/tacori right.png`}",
    imageAlt: "روغن موی تاکوری در میان قطره‌های طلایی",
    index: "۰۳",
  },
];

function HomePage({ wishlist, onWishlist, onAdd }) {
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);
  const heroPointerStart = useRef(null);
  const heroDragged = useRef(false);
  const heroPointerType = useRef("mouse");
  const heroInteractionHandled = useRef(false);
  const slide = heroSlides[activeHeroSlide];

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion || heroPaused) return undefined;
    const timer = window.setInterval(() => {
      setActiveHeroSlide((current) => (current + 1) % heroSlides.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [heroPaused]);

  const showHeroSlide = (index) => {
    setActiveHeroSlide((index + heroSlides.length) % heroSlides.length);
  };
  const startHeroDrag = (event) => {
    heroPointerStart.current = event.clientX;
    heroDragged.current = false;
    heroPointerType.current = event.pointerType;
    heroInteractionHandled.current = false;
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };
  const moveHeroDrag = (event) => {
    if (heroPointerStart.current === null) return;
    if (Math.abs(event.clientX - heroPointerStart.current) > 8) heroDragged.current = true;
  };
  const endHeroDrag = (event) => {
    if (heroPointerStart.current === null) return;
    const distance = event.clientX - heroPointerStart.current;
    if (Math.abs(distance) > 45) {
      showHeroSlide(activeHeroSlide + (distance > 0 ? -1 : 1));
      heroInteractionHandled.current = true;
    } else if (heroPointerType.current !== "mouse") {
      const bounds = event.currentTarget.getBoundingClientRect();
      const tappedOnRight = event.clientX > bounds.left + bounds.width / 2;
      showHeroSlide(activeHeroSlide + (tappedOnRight ? -1 : 1));
      heroInteractionHandled.current = true;
    }
    heroPointerStart.current = null;
  };

  return (
    <>
      <main className="home-main">
        <section
          className="hero"
          aria-roledescription="carousel"
          aria-label="بنرهای فروشگاه Magieto"
          onMouseEnter={() => setHeroPaused(true)}
          onMouseLeave={() => setHeroPaused(false)}
        >
          <div className="container hero-banner">
            <div
              className="hero-banner__image hero-showcase"
              key={activeHeroSlide}
              aria-live="polite"
              onPointerDown={startHeroDrag}
              onPointerMove={moveHeroDrag}
              onPointerUp={endHeroDrag}
              onPointerCancel={() => { heroPointerStart.current = null; }}
              onDragStart={(event) => event.preventDefault()}
            >
              <div className="hero-showcase__left"><img src={slide.leftImage} alt="" draggable="false" /></div>
              <div className="hero-showcase__middle"><img src={slide.middleImage} alt="" draggable="false" /></div>
              <div className="hero-showcase__copy"><h1>{slide.title}</h1><p>{slide.description}</p><Link className="button primary" href={slide.primaryHref}>{slide.primaryLabel}<ArrowLeft size={18} /></Link></div>
            </div>
          </div>
        </section>

        <section className="compact-section container category-section">
          <div className="category-grid">
            {categories.map((category, index) => (
              <Link href={`/products?category=${category.id}`} className={`category-tile category-tile--${index + 1}`} key={category.id}>
                <span className="category-tile__media">
                  <img src={category.image} alt="" />
                </span>
                <strong>{category.title}</strong>
              </Link>
            ))}
          </div>
        </section>

        <section className="deal-table container">
          <div className="deal-table__head"><h2>پیشنهاد ویژه</h2><Link href="/offers">مشاهده همه <ArrowLeft size={16} /></Link></div>
          <div className="compact-product-rail deal-table__grid">
            {products.filter((product) => product.collection === "پیشنهاد ویژه").map((product) => <ProductCard key={product.id} product={product} isWishlisted={wishlist.has(product.id)} onWishlist={onWishlist} onAdd={onAdd} />)}
          </div>
        </section>

        <section className="promo-pair container">
          <div className="promo-item"><Link href="/products?category=skin" className="promo-image"><img src="/assets/magieto-hero-sunscreen.webp" alt="" /></Link></div>
          <div className="promo-item"><Link href="/products?category=makeup" className="promo-image"><img src="/assets/magieto-hero-makeup.webp" alt="" /></Link></div>
        </section>

        <CompactProductCarousel className="care-highlight-section" title="جدیدترین‌ها" list={products.filter((product) => product.collection === "جدیدترین ها")} wishlist={wishlist} onWishlist={onWishlist} onAdd={onAdd} />

        <section className="compact-section container">
          <div className="compact-section__head"><div><h2>برندهای مژیتو</h2><p>مرور سریع محصولات هر برند</p></div><Link href="/brands">همه برندها</Link></div>
          <BrandCarousel />
        </section>

        <CompactProductCarousel className="care-highlight-section" title="مراقبت مو" list={products.filter((product) => product.collection === "مراقبت مو")} wishlist={wishlist} onWishlist={onWishlist} onAdd={onAdd} href="/products?category=hair" />

        <CompactProductCarousel className="deal-surface-section" title="آرایش" list={products.filter((product) => product.collection === "آرایش")} wishlist={wishlist} onWishlist={onWishlist} onAdd={onAdd} href="/products?category=makeup" />

        <section className="compact-section container">
          <div className="compact-section__head"><div><h2>مجله مژیتو</h2><p>راهنمای کوتاه برای خرید مطمئن‌تر</p></div><Link href="/guides">همه مقاله‌ها</Link></div>
          <div className="guide-grid">{guides.map((guide) => <GuideCard key={guide.slug} guide={guide} />)}</div>
        </section>

        <section className="service-band">
          <div className="container service-grid">
            <div><SealCheck size={24} /><span><strong>اطلاعات تأمین</strong><small>قابل مشاهده پیش از خرید</small></span></div>
            <div><SlidersHorizontal size={24} /><span><strong>مقایسه ساده</strong><small>قیمت، حجم و کاربرد</small></span></div>
            <div><Receipt size={24} /><span><strong>هزینه شفاف</strong><small>نمایش پیش از پرداخت</small></span></div>
            <div><Package size={24} /><span><strong>پیگیری سفارش</strong><small>از ثبت تا تحویل</small></span></div>
          </div>
        </section>
      </main>
    </>
  );
}

function ProductsPage({ wishlist, onWishlist, onAdd }) {
  const params = new URLSearchParams(window.location.search);
  const q = params.get("q") || "";
  const [view, setView] = useState("grid");
  const [sort, setSort] = useState("relevant");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [priceMax, setPriceMax] = useState(900000);
  const state = params.get("state");
  const filtered = useMemo(() => {
    let list = products.filter((p) => !q || `${p.name} ${p.brand} ${p.category} ${p.concerns.join(" ")}`.includes(q));
    if (selectedBrands.length) list = list.filter((p) => selectedBrands.includes(p.brand));
    if (onlyAvailable) list = list.filter((p) => p.stock > 0);
    list = list.filter((p) => p.price <= priceMax);
    if (sort === "cheap") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "expensive") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [q, selectedBrands, onlyAvailable, priceMax, sort]);

  const filters = (
    <div className="filters">
      <div className="filters__head"><strong>فیلتر نتایج</strong><button onClick={() => { setSelectedBrands([]); setOnlyAvailable(false); setPriceMax(900000); }}>پاک کردن همه</button></div>
      <FilterGroup title="برند">
        {brands.slice(0, 6).map((brand) => (
          <label className="check-row" key={brand}><input type="checkbox" checked={selectedBrands.includes(brand)} onChange={() => setSelectedBrands((current) => current.includes(brand) ? current.filter((x) => x !== brand) : [...current, brand])} /><span>{brand}</span><small>{products.filter((p) => p.brand === brand).length.toLocaleString("fa-IR")}</small></label>
        ))}
      </FilterGroup>
      <FilterGroup title="محدوده قیمت">
        <input className="range" type="range" min="350000" max="900000" step="25000" value={priceMax} onChange={(e) => setPriceMax(Number(e.target.value))} aria-label="حداکثر قیمت" />
        <div className="range-values"><span>تا {formatPrice(priceMax)}</span><small>از ۳۵۰٬۰۰۰ تومان</small></div>
      </FilterGroup>
      <FilterGroup title="نوع نیاز">
        {["کم‌آبی", "کدری", "چربی", "حساسیت", "خشکی ساقه"].map((item) => <button className="filter-option" key={item}>{item}<Plus size={16} /></button>)}
      </FilterGroup>
      <label className="switch-row"><input type="checkbox" checked={onlyAvailable} onChange={(e) => setOnlyAvailable(e.target.checked)} /><span>فقط کالاهای موجود</span></label>
    </div>
  );

  return (
    <main className="container page-shell products-page">
      {(selectedBrands.length > 0 || onlyAvailable || priceMax < 900000) && (
        <div className="active-filters">
          <span>فیلترهای فعال:</span>
          {selectedBrands.map((brand) => <button key={brand} onClick={() => setSelectedBrands((x) => x.filter((b) => b !== brand))}>{brand}<X size={14} /></button>)}
          {onlyAvailable && <button onClick={() => setOnlyAvailable(false)}>فقط موجود<X size={14} /></button>}
          {priceMax < 900000 && <button onClick={() => setPriceMax(900000)}>تا {formatPrice(priceMax)}<X size={14} /></button>}
        </div>
      )}
      <div className="catalog-toolbar">
        <button className="button secondary filter-mobile catalog-filter-button" onClick={() => setFilterOpen(true)}><Funnel size={17} />فیلترها</button>
        <div className="sort-options" aria-label="مرتب‌سازی محصولات">
          {[
            ["relevant", "مرتبط‌ترین"],
            ["cheap", "کمترین قیمت"],
            ["expensive", "بیشترین قیمت"],
            ["rating", "بیشترین امتیاز"],
          ].map(([value, label]) => (
            <button type="button" key={value} className={sort === value ? "is-active" : ""} aria-pressed={sort === value} onClick={() => setSort(value)}>{label}</button>
          ))}
        </div>
        <div className="view-toggle"><IconButton label="نمایش شبکه‌ای" className={view === "grid" ? "is-active" : ""} onClick={() => setView("grid")}><SquaresFour size={19} /></IconButton><IconButton label="نمایش فهرستی" className={view === "list" ? "is-active" : ""} onClick={() => setView("list")}><List size={19} /></IconButton></div>
        <span className="catalog-toolbar__count">{filtered.length.toLocaleString("fa-IR")} محصول</span>
      </div>
      <div className="catalog-layout">
        <aside className="catalog-sidebar">{filters}</aside>
        <div className="catalog-results">
          {state === "loading" ? <SkeletonGrid /> : state === "error" ? <ErrorState /> : filtered.length === 0 ? <EmptySearch query={q} /> : (
            <>
              <div className={view === "grid" ? "product-grid product-grid--catalog" : "product-list"}>
                {filtered.map((product) => <ProductCard key={product.id} product={product} view={view} isWishlisted={wishlist.has(product.id)} onWishlist={onWishlist} onAdd={onAdd} />)}
              </div>
              <button className="button secondary load-more">نمایش محصولات بیشتر</button>
            </>
          )}
        </div>
      </div>
      {filterOpen && <div className="drawer-layer"><button className="drawer-backdrop" aria-label="بستن فیلتر" onClick={() => setFilterOpen(false)} /><aside className="filter-drawer"><div className="drawer-head"><strong>فیلتر نتایج</strong><IconButton label="بستن" onClick={() => setFilterOpen(false)}><X size={21} /></IconButton></div>{filters}<button className="button primary wide" onClick={() => setFilterOpen(false)}>مشاهده {filtered.length.toLocaleString("fa-IR")} نتیجه</button></aside></div>}
    </main>
  );
}

function FilterGroup({ title, children }) {
  const [open, setOpen] = useState(true);
  return <section className="filter-group"><button onClick={() => setOpen(!open)}><strong>{title}</strong><CaretDown size={17} className={open ? "rotate" : ""} /></button>{open && <div>{children}</div>}</section>;
}

function SkeletonGrid() {
  return <div className="product-grid product-grid--catalog">{Array.from({ length: 6 }).map((_, i) => <div className="skeleton-card" key={i}><div /><span /><span /><b /></div>)}</div>;
}

function ErrorState() {
  return <div className="state-box"><Warning size={34} /><h2>نمایش محصولات با مشکل روبه‌رو شد</h2><p>اتصال را بررسی کنید و دوباره تلاش کنید. انتخاب‌های فیلتر شما حفظ شده‌اند.</p><button className="button primary" onClick={() => navigate("/products")}>تلاش دوباره</button></div>;
}

function EmptySearch({ query }) {
  return <div className="state-box"><MagnifyingGlass size={34} /><h2>نتیجه دقیقی پیدا نشد</h2><p>{query ? `برای «${query}» محصولی در این مجموعه نداریم.` : "فیلترها بیش از حد محدود شده‌اند."}</p><div className="state-actions"><button className="button primary" onClick={() => navigate("/products")}>مشاهده همه محصولات</button><Link className="button secondary" href="/guides">راهنمای انتخاب</Link></div></div>;
}

function ProductPage({ id, wishlist, onWishlist, onAdd, cart }) {
  const product = products.find((p) => p.id === id) || products[0];
  const [activeImage, setActiveImage] = useState(product.image);
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState("details");
  const [selectedSize, setSelectedSize] = useState("استاندارد");
  const [selectedColor, setSelectedColor] = useState("مشکی");
  const inCart = cart[product.id]?.qty || 0;
  return (
    <main className="container page-shell product-page">
      <Breadcrumb items={[{ label: product.category, href: "/products" }, { label: product.name }]} />
      <div className="pdp-grid">
        <section className="product-gallery">
          <div className="gallery-thumbs">
            {[product.image, product.alternate].map((image) => <button key={image} className={activeImage === image ? "is-active" : ""} onClick={() => setActiveImage(image)}><img src={image} alt="" /></button>)}
          </div>
          <div className="gallery-main"><img src={activeImage} alt="" /><span>برای مشاهده جزئیات، تصویر را انتخاب کنید</span></div>
        </section>
        <section className="product-summary">
          <Link href={`/brand/${encodeURIComponent(product.brand)}`} className="product-brand-link">{product.brand}<ArrowLeft size={16} /></Link>
          <h1>{product.name}</h1>
          <p className="english-title">{product.englishName}</p>
          <div className="pdp-rating"><span><Star size={17} weight="fill" />{product.rating.toLocaleString("fa-IR")}</span><button onClick={() => document.getElementById("product-reviews")?.scrollIntoView({ behavior: "smooth" })}>{product.reviews.toLocaleString("fa-IR")} نظر ثبت‌شده</button><span className="stock-ok"><Check size={15} />موجود</span></div>
          <div className="product-overview">
            <h2>در یک نگاه</h2>
            <p>{product.description}</p>
            <dl className="spec-list"><div><dt>مناسب برای</dt><dd>{product.suitable}</dd></div><div><dt>حجم</dt><dd>{product.volume}</dd></div><div><dt>کشور سازنده</dt><dd>{product.origin}</dd></div><div><dt>کاربرد اصلی</dt><dd>{product.concerns.join("، ")}</dd></div></dl>
          </div>
          <div className="variant-block">
            <fieldset className="variant-group">
              <legend><strong>رنگ</strong><span>{selectedColor}</span></legend>
              <div className="variant-options variant-options--color">
                {[{ name: "مشکی", color: "#1f1f1f" }, { name: "طلایی", color: "#c9a34e" }].map((option) => (
                  <label key={option.name} className={selectedColor === option.name ? "is-selected" : ""}>
                    <input type="radio" name="product-color" value={option.name} checked={selectedColor === option.name} onChange={() => setSelectedColor(option.name)} />
                    <span className="variant-swatch" style={{ background: option.color }} />
                    <span>{option.name}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset className="variant-group">
              <legend><strong>سایز</strong><span>{selectedSize}</span></legend>
              <div className="variant-options">
                <label className={selectedSize === "استاندارد" ? "is-selected" : ""}>
                  <input type="radio" name="product-size" value="استاندارد" checked={selectedSize === "استاندارد"} onChange={() => setSelectedSize("استاندارد")} />
                  <span>استاندارد</span><small>{formatPrice(product.price)}</small>
                </label>
                <label className="is-unavailable" aria-disabled="true">
                  <input type="radio" name="product-size" value="بزرگ" disabled />
                  <span>بزرگ</span><small>ناموجود</small>
                </label>
              </div>
            </fieldset>
          </div>
          <div className="purchase-panel">
            <div className="pdp-price">{product.oldPrice && <del>{formatPrice(product.oldPrice)}</del>}<strong>{formatPrice(product.price)}</strong><small>قیمت هر واحد با همین حجم نمایش داده شده است</small></div>
            <div className="purchase-actions">
              <div className="quantity-control"><button aria-label="کاهش تعداد" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={16} /></button><span>{quantity.toLocaleString("fa-IR")}</span><button aria-label="افزایش تعداد" onClick={() => setQuantity(quantity + 1)}><Plus size={16} /></button></div>
              <button className="button primary" onClick={() => onAdd(product, quantity)}>{inCart ? `${inCart.toLocaleString("fa-IR")} عدد در سبد` : "افزودن به سبد"}<Bag size={19} /></button>
              <IconButton label="افزودن به علاقه‌مندی" className={wishlist.has(product.id) ? "is-active" : ""} onClick={() => onWishlist(product)}><Heart size={21} weight={wishlist.has(product.id) ? "fill" : "regular"} /></IconButton>
            </div>
          </div>
          <div className="fulfillment-list">
            <div><Truck size={22} /><span><strong>ارسال</strong><small>هزینه و بازه تحویل پس از انتخاب نشانی محاسبه می‌شود</small></span></div>
            <div><SealCheck size={22} /><span><strong>اطلاعات اصالت و تأمین</strong><small>جزئیات روی بسته و فاکتور سفارش قابل بررسی است</small></span></div>
          </div>
        </section>
      </div>
      <section className="product-information">
        <div className="tabs" role="tablist">
          {[["details", "مشخصات"], ["ingredients", "ترکیبات و مصرف"]].map(([key, label]) => <button role="tab" aria-selected={tab === key} className={tab === key ? "is-active" : ""} onClick={() => setTab(key)} key={key}>{label}</button>)}
        </div>
        {tab === "details" && <div className="tab-content two-col"><div className="fit-summary"><span className="eyebrow">چرا ممکن است مناسب باشد؟</span><ul><li>مناسب {product.suitable}</li><li>برای {product.concerns.slice(0, 2).join(" و ")}</li><li>بافت و روش مصرف برای روتین روزانه توضیح داده شده</li></ul></div><aside className="note-panel"><Info size={22} /><strong>توجه</strong><p>اطلاعات «مناسب برای» راهنمای خرید است و جایگزین توصیه پزشکی یا تست حساسیت نیست.</p></aside></div>}
        {tab === "ingredients" && <div className="tab-content two-col"><div><h2>ترکیبات کلیدی</h2><ul className="ingredient-list">{product.ingredients.map((item) => <li key={item}><CheckCircle size={19} />{item}</li>)}</ul></div><div><h2>روش استفاده</h2><p>{product.usage}</p><div className="warning-note"><Warning size={19} /><span>{product.warning}</span></div></div></div>}
      </section>
      <section className="section product-reviews" id="product-reviews">
        <SectionHead eyebrow="تجربه خریداران" title="نظرها و پرسش‌ها" />
        <div className="review-layout"><div className="review-summary"><strong>{product.rating.toLocaleString("fa-IR")}</strong><div><span>{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={18} weight="fill" />)}</span><small>از {product.reviews.toLocaleString("fa-IR")} نظر ثبت‌شده</small></div></div><div className="review-placeholder"><h2>نظرهای تأییدنشده نمایش داده نمی‌شوند</h2><button className="button secondary">نوشتن نظر پس از خرید</button></div></div>
      </section>
      <section className="section">
        <SectionHead eyebrow="گزینه‌های نزدیک" title="برای مقایسه بیشتر" />
        <ProductRail list={products.filter((p) => p.id !== product.id).slice(0, 4)} wishlist={wishlist} onWishlist={onWishlist} onAdd={onAdd} />
      </section>
      <div className="mobile-sticky-buy"><div><small>قیمت</small><strong>{formatPrice(product.price)}</strong></div><button className="button primary" onClick={() => onAdd(product)}>افزودن به سبد</button></div>
    </main>
  );
}

function CartPage({ cart, setQuantity, removeItem, moveToWishlist }) {
  const items = Object.values(cart);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  const [coupon, setCoupon] = useState("");
  const [couponState, setCouponState] = useState(null);
  const discount = couponState === "success" ? Math.round(subtotal * 0.08) : 0;
  const applyCoupon = () => setCouponState(coupon.trim().toUpperCase() === "MAGIETO8" ? "success" : "error");
  if (items.length === 0) {
    return <main className="container page-shell"><Breadcrumb items={[{ label: "سبد خرید" }]} /><div className="state-box large"><ShoppingCart size={42} /><h1 className="empty-cart-title">سبد خرید شما خالی است</h1><p>محصولات انتخاب‌شده را اینجا نگه می‌داریم تا بتوانید قیمت و تعداد را پیش از پرداخت مرور کنید.</p><Link href="/products" className="button primary">مشاهده محصولات</Link></div></main>;
  }
  return (
    <main className="container page-shell">
      <Breadcrumb items={[{ label: "سبد خرید" }]} />
      <div className="page-title-row"><div><span className="eyebrow">مرور انتخاب‌ها</span><h1>سبد خرید</h1><p>{items.length.toLocaleString("fa-IR")} محصول در انتظار بررسی نهایی</p></div><Link href="/products" className="text-link">ادامه خرید<ArrowLeft size={17} /></Link></div>
      <div className="cart-layout">
        <section className="cart-items">
          {items.map(({ product, qty }) => (
            <article className="cart-item" key={product.id}>
              <img src={product.image} alt="" />
              <div className="cart-item__info"><span>{product.brand}</span><Link href={`/product/${product.id}`}>{product.name}</Link><small>{product.volume} · {product.stock > 5 ? "موجود" : "موجودی محدود"}</small><div className="cart-item__actions"><button onClick={() => moveToWishlist(product)}><Heart size={17} />انتقال به علاقه‌مندی</button><button onClick={() => removeItem(product.id)}><Trash size={17} />حذف</button></div></div>
              <div className="cart-item__price"><strong>{formatPrice(product.price * qty)}</strong>{product.oldPrice && <del>{formatPrice(product.oldPrice * qty)}</del>}<div className="quantity-control"><button aria-label="کاهش تعداد" onClick={() => setQuantity(product.id, qty - 1)}><Minus size={15} /></button><span>{qty.toLocaleString("fa-IR")}</span><button aria-label="افزایش تعداد" onClick={() => setQuantity(product.id, qty + 1)}><Plus size={15} /></button></div></div>
            </article>
          ))}
          <div className="cart-alert"><Info size={19} /><span>قیمت و موجودی پیش از انتقال به درگاه دوباره بررسی می‌شود.</span></div>
        </section>
        <aside className="order-summary">
          <h2>خلاصه سفارش</h2>
          <div className="coupon-field"><label htmlFor="coupon">کد تخفیف</label><div><input id="coupon" value={coupon} onChange={(e) => { setCoupon(e.target.value); setCouponState(null); }} placeholder="برای نمونه: MAGIETO8" /><button onClick={applyCoupon}>اعمال</button></div>{couponState === "success" && <small className="success-text"><Check size={15} />کد ۸٪ روی کالاها اعمال شد</small>}{couponState === "error" && <small className="error-text">این کد معتبر نیست یا شرایط آن برقرار نیست.</small>}</div>
          <dl><div><dt>جمع کالاها</dt><dd>{formatPrice(subtotal)}</dd></div>{discount > 0 && <div className="discount-row"><dt>تخفیف</dt><dd>− {formatPrice(discount)}</dd></div>}<div><dt>هزینه ارسال</dt><dd>پس از انتخاب نشانی</dd></div></dl>
          <div className="summary-total"><span>مبلغ قابل پرداخت فعلی</span><strong>{formatPrice(subtotal - discount)}</strong></div>
          <Link href="/checkout" className="button primary wide">ادامه و انتخاب نشانی<ArrowLeft size={19} /></Link>
          <p><SealCheck size={17} />جزئیات اقلام و هزینه‌ها پیش از پرداخت نهایی دوباره نمایش داده می‌شود.</p>
        </aside>
      </div>
    </main>
  );
}

function CheckoutPage({ cart, onComplete, isLoggedIn, onLogin, initialStep = 1 }) {
  const items = Object.values(cart);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  const [step, setStep] = useState(initialStep);
  const [fields, setFields] = useState(initialStep > 1
    ? { name: "سارا نادری", phone: "09121234567", province: "تهران", city: "تهران", address: "میدان هفت تیر، خیابان مفتح، پلاک ۳۲، واحد ۶", postal: "1587614311" }
    : { name: "", phone: "", province: "تهران", city: "تهران", address: "", postal: "" });
  const [shipping, setShipping] = useState("standard");
  const [payment, setPayment] = useState("gateway");
  const [errors, setErrors] = useState({});
  const shippingCost = shipping === "standard" ? 69000 : 119000;
  if (!items.length) return <NavigateTo href="/cart" />;
  const validateAddress = () => {
    const next = {};
    if (fields.name.trim().length < 3) next.name = "نام و نام خانوادگی را کامل وارد کنید.";
    if (!/^09\d{9}$/.test(fields.phone)) next.phone = "شماره موبایل معتبر نیست.";
    if (fields.address.trim().length < 12) next.address = "نشانی را با جزئیات بیشتری وارد کنید.";
    if (!/^\d{10}$/.test(fields.postal)) next.postal = "کد پستی باید ۱۰ رقم باشد.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };
  const nextStep = () => {
    if (step === 1 && !validateAddress()) return;
    if (step < 3) setStep(step + 1);
  };
  const finish = () => {
    onComplete();
    navigate("/checkout/success");
  };
  return (
    <main className="checkout-page">
      <div className="checkout-header container"><Logo /><span>تسویه امن و مرحله‌ای</span><Link href="/cart"><ArrowRight size={17} />بازگشت به سبد</Link></div>
      <div className="container checkout-shell">
        <div className="checkout-progress">
          {[["نشانی", MapPin], ["ارسال و پرداخت", CreditCard], ["مرور نهایی", ClipboardText]].map(([label, Icon], index) => <div key={label} className={step >= index + 1 ? "is-active" : ""}><span>{step > index + 1 ? <Check size={17} /> : <Icon size={18} />}</span><b>{label}</b></div>)}
        </div>
        <div className="checkout-layout">
          <section className="checkout-content">
            {step === 1 && (
              <div className="checkout-card">
                <span className="eyebrow">مرحله ۱ از ۳</span><h1>نشانی و اطلاعات گیرنده</h1><p>اطلاعاتی را وارد کنید که هنگام تحویل بسته قابل دسترسی باشد.</p>
                {!isLoggedIn && <div className="guest-box"><SignIn size={22} /><span><strong>قبلاً از Magieto خرید کرده‌اید؟</strong><small>با ورود، نشانی‌های ذخیره‌شده در دسترس خواهد بود.</small></span><button className="button secondary" onClick={onLogin}>ورود</button></div>}
                <div className="form-grid">
                  <Field label="نام و نام خانوادگی" error={errors.name}><input value={fields.name} onChange={(e) => setFields({ ...fields, name: e.target.value })} /></Field>
                  <Field label="شماره موبایل" error={errors.phone}><input inputMode="numeric" value={fields.phone} onChange={(e) => setFields({ ...fields, phone: e.target.value.replace(/\D/g, "").slice(0, 11) })} /></Field>
                  <Field label="استان"><select value={fields.province} onChange={(e) => setFields({ ...fields, province: e.target.value })}><option>تهران</option><option>البرز</option><option>اصفهان</option><option>فارس</option></select></Field>
                  <Field label="شهر"><input value={fields.city} onChange={(e) => setFields({ ...fields, city: e.target.value })} /></Field>
                  <Field label="نشانی کامل" error={errors.address} wide><textarea rows="3" value={fields.address} onChange={(e) => setFields({ ...fields, address: e.target.value })} placeholder="خیابان، کوچه، پلاک، واحد" /></Field>
                  <Field label="کد پستی" error={errors.postal}><input inputMode="numeric" value={fields.postal} onChange={(e) => setFields({ ...fields, postal: e.target.value.replace(/\D/g, "").slice(0, 10) })} /></Field>
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="checkout-card">
                <span className="eyebrow">مرحله ۲ از ۳</span><h1>روش ارسال و پرداخت</h1><p>هزینه هر گزینه پیش از تأیید نهایی در جمع سفارش منظور می‌شود.</p>
                <h2>روش ارسال</h2>
                <div className="selection-list">
                  <Selection checked={shipping === "standard"} onClick={() => setShipping("standard")} icon={<Truck size={24} />} title="ارسال استاندارد" text="بازه تقریبی پس از ثبت و پردازش سفارش اعلام می‌شود" price={formatPrice(69000)} />
                  <Selection checked={shipping === "priority"} onClick={() => setShipping("priority")} icon={<Package size={24} />} title="ارسال سریع درون‌شهری" text="نمایش این گزینه به نشانی و ظرفیت روز وابسته است" price={formatPrice(119000)} />
                </div>
                <h2>روش پرداخت</h2>
                <div className="selection-list">
                  <Selection checked={payment === "gateway"} onClick={() => setPayment("gateway")} icon={<CreditCard size={24} />} title="پرداخت آنلاین" text="انتقال به درگاه بانکی پس از تأیید سفارش" />
                  <Selection checked={payment === "wallet"} onClick={() => setPayment("wallet")} icon={<Receipt size={24} />} title="اعتبار حساب" text="در نسخه عملیاتی، موجودی اعتبار اینجا نمایش داده می‌شود" disabled />
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="checkout-card">
                <span className="eyebrow">مرحله ۳ از ۳</span><h1>مرور و تأیید سفارش</h1><p>پیش از پرداخت، اقلام و اطلاعات تحویل را یک بار دیگر بررسی کنید.</p>
                <div className="review-block"><div><h2>تحویل به</h2><button onClick={() => setStep(1)}>ویرایش</button></div><p><strong>{fields.name}</strong> · {fields.phone}</p><p>{fields.province}، {fields.city}، {fields.address}، کدپستی {fields.postal}</p></div>
                <div className="review-block"><div><h2>ارسال و پرداخت</h2><button onClick={() => setStep(2)}>ویرایش</button></div><p>{shipping === "standard" ? "ارسال استاندارد" : "ارسال سریع درون‌شهری"} · پرداخت آنلاین</p></div>
                <div className="checkout-items">{items.map(({ product, qty }) => <div key={product.id}><img src={product.image} alt="" /><span><strong>{product.name}</strong><small>{qty.toLocaleString("fa-IR")} عدد · {product.volume}</small></span><b>{formatPrice(product.price * qty)}</b></div>)}</div>
                <label className="confirm-check"><input type="checkbox" defaultChecked /><span>اقلام، نشانی و مبلغ نهایی را بررسی کرده‌ام.</span></label>
              </div>
            )}
            <div className="checkout-actions">{step > 1 && <button className="button secondary" onClick={() => setStep(step - 1)}>مرحله قبل</button>}<button className="button primary" onClick={step === 3 ? finish : nextStep}>{step === 3 ? "تأیید و انتقال به پرداخت" : "ادامه"}<ArrowLeft size={18} /></button></div>
          </section>
          <aside className="order-summary checkout-summary">
            <h2>خلاصه پرداخت</h2>
            <button className="summary-items-toggle">{items.length.toLocaleString("fa-IR")} کالا <CaretDown size={16} /></button>
            <dl><div><dt>جمع کالاها</dt><dd>{formatPrice(subtotal)}</dd></div><div><dt>ارسال</dt><dd>{step === 1 ? "در مرحله بعد" : formatPrice(shippingCost)}</dd></div></dl>
            <div className="summary-total"><span>مبلغ نهایی</span><strong>{formatPrice(subtotal + (step === 1 ? 0 : shippingCost))}</strong></div>
            <p><SealCheck size={17} />پس از بازگشت از درگاه، وضعیت پرداخت به‌صورت روشن نمایش داده می‌شود.</p>
          </aside>
        </div>
      </div>
    </main>
  );
}

function AuthFlowPage({ mode = "login", onSuccess }) {
  const [phone, setPhone] = useState("09121234567");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const isOtp = mode === "otp";
  const isRegister = mode === "register";
  const isForgot = mode === "forgot-password";
  const titles = {
    login: ["ورود به حساب", "برای مشاهده سفارش‌ها و نشانی‌های ذخیره‌شده وارد شوید."],
    register: ["ساخت حساب Magieto", "شماره موبایل و یک رمز امن برای خریدهای بعدی ثبت کنید."],
    otp: ["تأیید شماره موبایل", `کد ارسال‌شده به ${phone || "شماره شما"} را وارد کنید.`],
    "forgot-password": ["بازیابی رمز عبور", "کد بازیابی فقط برای شماره ثبت‌شده ارسال می‌شود."],
  };
  const [title, description] = titles[mode] || titles.login;

  const submit = (event) => {
    event.preventDefault();
    if (!/^09\d{9}$/.test(phone)) {
      setMessage("شماره موبایل را به‌صورت ۱۱ رقمی وارد کنید.");
      return;
    }
    if (isOtp && code.length !== 5) {
      setMessage("کد تأیید باید ۵ رقم باشد.");
      return;
    }
    if (isRegister && password.length < 8) {
      setMessage("رمز عبور باید حداقل ۸ کاراکتر باشد.");
      return;
    }
    if (isOtp) {
      onSuccess?.();
      navigate("/account");
      return;
    }
    navigate("/auth/otp");
  };

  return (
    <main className="auth-page">
      <section className="auth-editorial" aria-label="راهنمای ورود">
        <Logo />
        <div>
          <span className="eyebrow">حساب Magieto</span>
          <h1>خریدهای بعدی را از همان‌جایی ادامه دهید که متوقف شدید.</h1>
          <ul>
            <li><CheckCircle size={20} />پیگیری سفارش با وضعیت روشن</li>
            <li><CheckCircle size={20} />نگهداری نشانی‌ها و علاقه‌مندی‌ها</li>
            <li><CheckCircle size={20} />خرید مجدد بدون جست‌وجوی دوباره</li>
          </ul>
        </div>
        <small>اطلاعات حساب فقط برای ارائه خدمات فروشگاه استفاده می‌شود.</small>
      </section>
      <section className="auth-panel">
        <Link href="/" className="auth-back"><ArrowRight size={18} />بازگشت به فروشگاه</Link>
        <form onSubmit={submit} noValidate>
          <span className="eyebrow">{isOtp ? "مرحله تأیید" : "ورود امن"}</span>
          <h2>{title}</h2>
          <p>{description}</p>
          {!isOtp && <Field label="شماره موبایل" error={message && !/^09\d{9}$/.test(phone) ? message : ""}><input inputMode="numeric" autoComplete="tel" value={phone} onChange={(event) => { setPhone(event.target.value.replace(/\D/g, "").slice(0, 11)); setMessage(""); }} /></Field>}
          {isOtp && <Field label="کد پنج‌رقمی" error={message}><input className="otp-input" inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(event) => { setCode(event.target.value.replace(/\D/g, "").slice(0, 5)); setMessage(""); }} placeholder="— — — — —" /></Field>}
          {(mode === "login" || isRegister) && <Field label="رمز عبور" error={message && isRegister ? message : ""}><input type="password" autoComplete={isRegister ? "new-password" : "current-password"} value={password} onChange={(event) => { setPassword(event.target.value); setMessage(""); }} placeholder={isRegister ? "حداقل ۸ کاراکتر" : "رمز عبور"} /></Field>}
          {message && !isOtp && !isRegister && <div className="form-message error-text"><Warning size={16} />{message}</div>}
          <button className="button primary wide" type="submit">{isOtp ? "تأیید و ورود" : isForgot ? "دریافت کد بازیابی" : isRegister ? "ساخت حساب" : "ادامه"}<ArrowLeft size={18} /></button>
          {isOtp && <button className="auth-resend" type="button">ارسال دوباره کد در ۰۰:۴۸</button>}
          <div className="auth-switch">
            {mode === "login" && <><Link href="/auth/forgot-password">رمز را فراموش کرده‌ام</Link><span>حساب ندارید؟ <Link href="/auth/register">ساخت حساب</Link></span></>}
            {mode !== "login" && !isOtp && <span>قبلاً ثبت‌نام کرده‌اید؟ <Link href="/auth/login">ورود</Link></span>}
            {isOtp && <Link href="/auth/login">اصلاح شماره موبایل</Link>}
          </div>
        </form>
      </section>
    </main>
  );
}

function Field({ label, error, wide, children }) {
  return <label className={`field ${wide ? "field--wide" : ""} ${error ? "has-error" : ""}`}><span>{label}</span>{children}{error && <small><Warning size={15} />{error}</small>}</label>;
}

function Selection({ checked, onClick, icon, title, text, price, disabled }) {
  return <button className={`selection-card ${checked ? "is-selected" : ""}`} disabled={disabled} onClick={onClick}>{icon}<span><strong>{title}</strong><small>{text}</small></span>{price && <b>{price}</b>}<i>{checked && <Check size={16} />}</i></button>;
}

function CheckoutResult({ success, orderCode }) {
  return (
    <main className="result-page">
      <div className={`result-symbol ${success ? "success" : "failed"}`}>{success ? <CheckCircle size={58} weight="fill" /> : <Warning size={58} weight="fill" />}</div>
      <span className="eyebrow">{success ? "پرداخت ثبت شد" : "پرداخت کامل نشد"}</span>
      <h1>{success ? "سفارش شما با موفقیت ثبت شد" : "مبلغی از سمت Magieto ثبت نشده است"}</h1>
      <p>{success ? "جزئیات سفارش در حساب کاربری قابل مشاهده است. وضعیت‌های بعدی نیز در همان صفحه به‌روزرسانی می‌شوند." : "می‌توانید دوباره به درگاه بروید یا سفارش را برای بعد نگه دارید. وضعیت واقعی تراکنش پیش از تلاش دوباره بررسی می‌شود."}</p>
      <div className="order-code"><span>کد سفارش</span><strong>{orderCode || "MG-۱۴۰۵۰۵۰۷-۱۲۸۴"}</strong></div>
      <div className="result-actions">{success ? <><Link href="/account/orders" className="button primary">مشاهده سفارش</Link><Link href="/" className="button secondary">بازگشت به فروشگاه</Link></> : <><Link href="/checkout" className="button primary">تلاش دوباره</Link><Link href="/cart" className="button secondary">بازگشت به سبد</Link></>}</div>
      {success && <div className="result-timeline"><div className="is-active"><span /><b>ثبت سفارش</b><small>انجام شد</small></div><div><span /><b>پردازش</b><small>پس از بررسی موجودی</small></div><div><span /><b>ارسال</b><small>پس از تحویل به حامل</small></div></div>}
    </main>
  );
}

function WishlistPage({ wishlist, onWishlist, onAdd }) {
  const list = products.filter((p) => wishlist.has(p.id));
  return <main className="container page-shell"><Breadcrumb items={[{ label: "علاقه‌مندی‌ها" }]} /><div className="page-title-row"><div><span className="eyebrow">انتخاب‌های ذخیره‌شده</span><h1>علاقه‌مندی‌ها</h1><p>محصولاتی که می‌خواهید بعداً مقایسه یا خریداری کنید.</p></div></div>{list.length ? <ProductRail list={list} wishlist={wishlist} onWishlist={onWishlist} onAdd={onAdd} /> : <div className="state-box large"><Heart size={42} /><h2>هنوز محصولی ذخیره نکرده‌اید</h2><p>از آیکن قلب روی کارت هر محصول استفاده کنید.</p><Link href="/products" className="button primary">پیدا کردن محصول</Link></div>}</main>;
}

function AccountPage({ section = "overview" }) {
  const menu = [["overview", "نمای کلی", House], ["orders", "سفارش‌ها", Package], ["addresses", "نشانی‌ها", MapPin], ["wishlist", "علاقه‌مندی‌ها", Heart], ["profile", "اطلاعات شخصی", User]];
  return (
    <main className="container page-shell">
      <Breadcrumb items={[{ label: "حساب کاربری" }]} />
      <div className="account-layout">
        <aside className="account-nav"><div className="account-user"><span>س</span><div><strong>سارا نادری</strong><small>۰۹۱۲•••۴۵۶۷</small></div></div><nav>{menu.map(([key, label, Icon]) => <Link key={key} href={`/account${key === "overview" ? "" : `/${key}`}`} className={section === key ? "is-active" : ""}><Icon size={19} />{label}<CaretLeft size={15} /></Link>)}</nav><button><SignIn size={19} />خروج از حساب</button></aside>
        <section className="account-content">
          {section === "overview" && <><div className="page-title-row"><div><span className="eyebrow">حساب شما</span><h1>سلام سارا،</h1><p>آخرین سفارش و انتخاب‌های ذخیره‌شده را از اینجا دنبال کنید.</p></div></div><div className="account-stat-grid"><div><Package size={24} /><strong>۱ سفارش</strong><small>در حال پردازش</small></div><div><Heart size={24} /><strong>۳ محصول</strong><small>در علاقه‌مندی‌ها</small></div><div><MapPin size={24} /><strong>۲ نشانی</strong><small>ذخیره‌شده</small></div></div><OrderPreview /></>}
          {section === "orders" && <><h1>سفارش‌های من</h1><p>وضعیت هر سفارش بر پایه رویدادهای واقعی ارسال نمایش داده می‌شود.</p><OrderPreview /><div className="order-card muted"><span>MG-۱۴۰۵۰۳۱۸-۰۹۳۱</span><strong>تحویل‌شده</strong><small>۳ قلم · ۱٬۷۸۴٬۰۰۰ تومان</small><button>مشاهده جزئیات</button></div></>}
          {section === "addresses" && <><div className="page-title-row"><div><h1>نشانی‌ها</h1><p>برای انتخاب سریع‌تر در تسویه نگهداری می‌شوند.</p></div><button className="button primary"><Plus size={18} />افزودن نشانی</button></div><div className="address-card"><MapPin size={23} /><div><strong>خانه</strong><p>تهران، میدان هفت تیر، خیابان مفتح، پلاک ۳۲، واحد ۶</p><small>گیرنده: سارا نادری · ۰۹۱۲•••۴۵۶۷</small></div><button>ویرایش</button></div></>}
          {section === "wishlist" && <NavigateTo href="/wishlist" />}
          {section === "profile" && <>
            <div className="page-title-row"><div><span className="eyebrow">حساب کاربری</span><h1>اطلاعات و مشخصات کاربری</h1><p>اطلاعات تماس و امنیت حساب را از این بخش مدیریت کنید.</p></div></div>
            <div className="profile-form profile-form--reference">
              <Field label="نام"><input defaultValue="سارا" /></Field>
              <Field label="نام خانوادگی"><input defaultValue="نادری" /></Field>
              <Field label="شماره موبایل"><input defaultValue="۰۹۱۲۱۲۳۴۵۶۷" readOnly /></Field>
              <Field label="شماره ثابت"><input inputMode="tel" placeholder="۰۲۱۴۴۴۴۴۴۴۴" /></Field>
              <Field label="تاریخ تولد" wide><div className="birth-fields"><select defaultValue=""><option value="" disabled>روز</option><option>۱۲</option></select><select defaultValue=""><option value="" disabled>ماه</option><option>شهریور</option></select><select defaultValue=""><option value="" disabled>سال</option><option>۱۳۷۴</option></select></div></Field>
              <Field label="ایمیل" wide><input type="email" placeholder="name@example.com" /></Field>
              <div className="gender-field"><span>جنسیت</span><label><input type="radio" name="gender" defaultChecked /> زن</label><label><input type="radio" name="gender" /> مرد</label></div>
              <button className="button primary">به‌روزرسانی اطلاعات</button>
              <div className="profile-separator" />
              <div className="profile-section-title"><strong>تغییر کلمه عبور</strong><small>برای امنیت بیشتر از یک رمز متفاوت استفاده کنید.</small></div>
              <Field label="کلمه عبور فعلی" wide><input type="password" placeholder="کلمه عبور فعلی" /></Field>
              <Field label="کلمه عبور جدید"><input type="password" placeholder="حداقل ۸ کاراکتر" /></Field>
              <Field label="تکرار کلمه عبور جدید"><input type="password" placeholder="تکرار رمز جدید" /></Field>
              <button className="button primary">به‌روزرسانی کلمه عبور</button>
            </div>
          </>}
        </section>
      </div>
    </main>
  );
}

function OrderDetailPage() {
  const orderItems = products.slice(0, 2);
  return (
    <main className="container page-shell">
      <Breadcrumb items={[{ label: "حساب کاربری", href: "/account" }, { label: "سفارش‌ها", href: "/account/orders" }, { label: "MG-۱۴۰۵۰۵۰۷-۱۲۸۴" }]} />
      <div className="order-detail-head">
        <div><span className="eyebrow">جزئیات سفارش</span><h1>سفارش MG-۱۴۰۵۰۵۰۷-۱۲۸۴</h1><p>ثبت‌شده در ۷ مرداد ۱۴۰۵ · پرداخت آنلاین</p></div>
        <b>در حال پردازش</b>
      </div>
      <div className="order-detail-layout">
        <section>
          <div className="order-progress-detail" aria-label="وضعیت سفارش">
            {[["ثبت سفارش", "۷ مرداد، ۱۸:۴۰", true], ["بررسی موجودی", "در حال انجام", true], ["تحویل به حمل‌کننده", "پس از آماده‌سازی", false], ["تحویل سفارش", "هنوز زمان‌بندی نشده", false]].map(([label, text, active]) => <div className={active ? "is-active" : ""} key={label}><span>{active ? <Check size={15} /> : null}</span><strong>{label}</strong><small>{text}</small></div>)}
          </div>
          <div className="order-lines">
            <div className="subsection-head"><h2>اقلام سفارش</h2><span>{orderItems.length.toLocaleString("fa-IR")} قلم</span></div>
            {orderItems.map((product) => <article key={product.id}><img src={product.image} alt="" /><div><Link href={`/product/${product.id}`}>{product.name}</Link><small>{product.volume} · یک عدد</small></div><strong>{formatPrice(product.price)}</strong></article>)}
          </div>
        </section>
        <aside className="order-meta">
          <h2>تحویل و پرداخت</h2>
          <dl><div><dt>گیرنده</dt><dd>سارا نادری · ۰۹۱۲•••۴۵۶۷</dd></div><div><dt>نشانی</dt><dd>تهران، میدان هفت تیر، خیابان مفتح، پلاک ۳۲، واحد ۶</dd></div><div><dt>ارسال</dt><dd>استاندارد</dd></div><div><dt>جمع کالاها</dt><dd>{formatPrice(orderItems.reduce((sum, item) => sum + item.price, 0))}</dd></div><div><dt>هزینه ارسال</dt><dd>{formatPrice(69000)}</dd></div></dl>
          <Link href="/tracking" className="button secondary wide">پیگیری عمومی سفارش</Link>
          <button className="button primary wide">افزودن دوباره اقلام به سبد</button>
        </aside>
      </div>
    </main>
  );
}

function OrderPreview() {
  return <article className="order-card"><div className="order-card__head"><span><small>کد سفارش</small><strong>MG-۱۴۰۵۰۵۰۷-۱۲۸۴</strong></span><b>در حال پردازش</b></div><div className="mini-timeline"><span className="is-done">ثبت‌شده</span><span className="is-active">پردازش</span><span>ارسال</span><span>تحویل</span></div><div className="order-card__foot"><span>۲ قلم · ۱٬۴۸۶٬۰۰۰ تومان</span><Link href="/account/orders/MG-14050507-1284">جزئیات سفارش <ArrowLeft size={16} /></Link></div></article>;
}

function BrandsPage({ selected }) {
  if (selected) {
    const brandName = decodeURIComponent(selected);
    const list = products.filter((p) => p.brand === brandName);
    return <main className="container page-shell"><Breadcrumb items={[{ label: "برندها", href: "/brands" }, { label: brandName }]} /><div className="brand-hero"><div><span className="eyebrow">صفحه برند</span><h1>{brandName}</h1><p>محصولات این برند با اطلاعات یکسان درباره حجم، کاربرد و روش استفاده نمایش داده می‌شوند.</p></div><strong>{brandName}</strong></div><section className="section"><SectionHead title={`محصولات ${brandName}`} text={`${list.length.toLocaleString("fa-IR")} محصول در نمونه فعلی`} />{list.length ? <div className="product-grid">{list.map((p) => <ProductCard key={p.id} product={p} isWishlisted={false} onWishlist={() => {}} onAdd={() => {}} />)}</div> : <div className="state-box"><Storefront size={34} /><h2>کاتالوگ این برند در حال تکمیل است</h2><p>برای مشاهده گزینه‌های مشابه به فهرست محصولات بروید.</p><Link href="/products" className="button primary">مشاهده محصولات</Link></div>}</section></main>;
  }
  return <main className="container page-shell"><Breadcrumb items={[{ label: "برندها" }]} /><div className="brand-directory-title"><h1>فهرست برندها</h1></div><div className="brand-directory">{brands.map((brand) => <Link href={`/brand/${encodeURIComponent(brand)}`} key={brand}><span className="brand-logo-slot" aria-label={`محل لوگوی ${brand}`} /><strong>{brand}</strong><small>{products.filter((p) => p.brand === brand).length.toLocaleString("fa-IR")} محصول</small><ArrowLeft size={20} /></Link>)}</div></main>;
}

function GuidesPage({ slug, wishlist, onWishlist, onAdd }) {
  const guide = guides.find((g) => g.slug === slug);
  if (guide) return <GuidePage guide={guide} wishlist={wishlist} onWishlist={onWishlist} onAdd={onAdd} />;
  return <main className="container page-shell"><Breadcrumb items={[{ label: "مجله مژیتو" }]} /><div className="catalog-head"><div><h1>مجله مژیتو</h1></div></div><div className="guide-grid guide-grid--page">{guides.map((item) => <GuideCard key={item.slug} guide={item} />)}</div></main>;
}

function GuideCard({ guide }) {
  const displayTitle = guide.title.length > 40 ? `${guide.title.slice(0, 40).trim()}…` : guide.title;
  return <article className="guide-card"><Link href={`/guide/${guide.slug}`}><img src={guide.image} alt="" /></Link><div><span>{guide.category}</span><Link href={`/guide/${guide.slug}`} title={guide.title}>{displayTitle}</Link><p>{guide.excerpt}</p><Link href={`/guide/${guide.slug}`} className="text-link">مشاهده مطلب<ArrowLeft size={17} /></Link></div></article>;
}

function GuidePage({ guide, wishlist, onWishlist, onAdd }) {
  return <main className="article-page"><div className="container"><Breadcrumb items={[{ label: "مجله مژیتو", href: "/guides" }, { label: guide.title }]} /><header className="article-head"><span className="eyebrow">{guide.category}</span><h1>{guide.title}</h1><div><Clock size={17} />زمان مطالعه {guide.readTime}</div></header><img className="article-cover" src={guide.image} alt="" /><article className="article-body"><p className="lead">انتخاب یک محصول زمانی ساده‌تر می‌شود که بدانیم دقیقاً به چه مسئله‌ای پاسخ می‌دهد، محدودیتش چیست و در چه مرحله‌ای از روتین قرار می‌گیرد.</p><h2>از نیاز پوست شروع کنید</h2><p>نام یک ترکیب به‌تنهایی برای تصمیم کافی نیست. نوع پوست، محصولاتی که هم‌زمان استفاده می‌کنید و میزان تحمل پوست، نتیجه تجربه را تغییر می‌دهد. ابتدا مسئله اصلی را مشخص کنید و سپس سراغ غلظت و بافت بروید.</p><aside><Info size={22} /><p>این راهنما برای انتخاب محصول آرایشی و بهداشتی است و توصیه درمانی یا پزشکی محسوب نمی‌شود.</p></aside><h2>برچسب را چطور بخوانیم؟</h2><p>ترکیبات ابتدایی فهرست معمولاً سهم بیشتری در فرمول دارند. با این حال، اثربخشی تنها به ترتیب فهرست وابسته نیست؛ پایداری فرمول و نحوه مصرف نیز اهمیت دارد.</p><h2>محصول را آهسته وارد روتین کنید</h2><p>دفعات استفاده را تدریجی افزایش دهید و در صورت قرمزی یا سوزش مداوم، مصرف را متوقف کنید. استفاده هم‌زمان چند محصول فعال، ارزیابی علت حساسیت را دشوار می‌کند.</p></article><CompactProductCarousel className="article-related-products" title="محصولات مرتبط" subtitle="انتخاب‌های نزدیک به موضوع این مطلب" list={products.slice(0, 6)} wishlist={wishlist} onWishlist={onWishlist} onAdd={onAdd} href="/products" /></div></main>;
}

function OffersPage({ wishlist, onWishlist, onAdd }) {
  const list = products.filter((p) => p.oldPrice);
  return <main className="container page-shell"><Breadcrumb items={[{ label: "پیشنهادهای ویژه" }]} /><ProductRail list={list} wishlist={wishlist} onWishlist={onWishlist} onAdd={onAdd} /></main>;
}

const infoContent = {
  about: ["درباره Magieto", "Magieto برای کم‌کردن تردید در خرید آنلاین زیبایی طراحی شده است؛ با اطلاعات قابل‌مقایسه، زبان روشن و مسیر خریدی که هزینه‌ها را دیرهنگام آشکار نمی‌کند."],
  contact: ["تماس با ما", "در نسخه عملیاتی، کانال‌های پشتیبانی تأییدشده، ساعات پاسخ‌گویی و شماره پیگیری هر درخواست در این صفحه نمایش داده می‌شود."],
  faq: ["پرسش‌های متداول", "پاسخ‌های مربوط به سفارش، پرداخت، ارسال، مرجوعی و اصالت پس از نهایی‌شدن سیاست‌های عملیاتی فروشگاه منتشر می‌شوند."],
  terms: ["قوانین و مقررات", "این صفحه چارچوب استفاده از فروشگاه، ثبت سفارش، پرداخت و مسئولیت‌های طرفین را با متن حقوقی تأییدشده نگهداری خواهد کرد."],
  privacy: ["حریم خصوصی", "داده‌های حساب، نشانی و سفارش فقط در حد لازم برای ارائه خدمت جمع‌آوری می‌شوند. جزئیات نگهداری و حذف داده پیش از انتشار نهایی تأیید خواهد شد."],
  shipping: ["روش‌های ارسال", "روش، هزینه و بازه تحویل براساس نشانی، ظرفیت شرکت حمل و اقلام سبد محاسبه و پیش از پرداخت نمایش داده می‌شود."],
  authenticity: ["اصالت و تأمین کالا", "جزئیات تأمین، وضعیت بسته‌بندی و اطلاعات قابل‌بررسی هر کالا باید پیش از خرید و روی اسناد سفارش قابل مشاهده باشد؛ ادعای بدون مدرک در این صفحه منتشر نمی‌شود."],
  tracking: ["پیگیری سفارش", "کد سفارش را وارد کنید تا آخرین وضعیت ثبت‌شده از پردازش، تحویل به حامل و تحویل نهایی نمایش داده شود."],
};

function InfoPage({ type }) {
  const [title, text] = infoContent[type] || infoContent.about;
  const [tracking, setTracking] = useState("");
  const [open, setOpen] = useState(0);
  const faqs = ["چطور وضعیت سفارش را ببینم؟", "هزینه ارسال چه زمانی مشخص می‌شود؟", "اگر پرداخت ناموفق بود چه کنم؟"];
  return (
    <main className={`container page-shell info-page ${type === "tracking" ? "info-page--tracking" : ""}`}>
      <Breadcrumb items={[{ label: title }]} />
      {type !== "faq" && <div className="info-hero"><span className="eyebrow">اطلاعات فروشگاه</span><h1>{title}</h1><p>{text}</p></div>}
      {type === "tracking" && <div className="tracking-box"><Package size={30} /><div><label htmlFor="track">کد سفارش</label><div><input id="track" value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="MG-۱۴۰۵۰۵۰۷-۱۲۸۴" /><button className="button primary">پیگیری</button></div><small>کد سفارش در صفحه نتیجه پرداخت و حساب کاربری نمایش داده می‌شود.</small></div></div>}
      {type === "faq" ? <div className="accordion">{faqs.map((item, index) => <section key={item}><button onClick={() => setOpen(open === index ? -1 : index)}><strong>{item}</strong><Plus size={18} /></button>{open === index && <p>{index === 0 ? "پس از ورود، بخش «سفارش‌ها» آخرین وضعیت ثبت‌شده را نشان می‌دهد." : index === 1 ? "پس از انتخاب نشانی و روش ارسال، هزینه در خلاصه پرداخت اضافه می‌شود." : "ابتدا وضعیت تراکنش بررسی می‌شود؛ سپس می‌توانید بدون ساخت سفارش تکراری دوباره تلاش کنید."}</p>}</section>)}</div> : type === "tracking" ? <section className="tracking-status"><strong>وضعیت سفارش</strong><div>{["ثبت‌شده", "در حال پردازش", "ارسال‌شده", "تکمیل‌شده", "ناموفق"].map((status) => <span key={status}>{status}</span>)}</div></section> : <div className="policy-layout"><aside><Info size={23} /><strong>وضعیت سند</strong><p>متن نهایی پس از تأیید سیاست عملیاتی و حقوقی فروشگاه منتشر می‌شود.</p></aside><article><h2>اصل راهنما</h2><p>{text}</p><h2>شفافیت پیش از اقدام</h2><p>هر شرطی که روی هزینه، امکان مرجوعی، زمان تحویل یا نتیجه پرداخت اثر دارد باید پیش از اقدام اصلی قابل مشاهده باشد.</p><h2>بازیابی از خطا</h2><p>در خطاهای موقت، انتخاب‌های کاربر حفظ می‌شوند و مسیر تلاش دوباره به‌روشنی ارائه می‌شود.</p></article></div>}
    </main>
  );
}

function DesignSpecPage() {
  const swatches = [["Berry Ink", "#2D2026"], ["Blush Canvas", "#FCF8F8"], ["Magenta 700", "#C2185B"], ["Rose 100", "#FAD7E5"], ["Lavender 500", "#9B5DB0"], ["Danger", "#A33131"]];
  return <main className="container page-shell spec-page"><Breadcrumb items={[{ label: "Design Specification" }]} /><div className="info-hero"><span className="eyebrow">Developer handoff reference</span><h1>Design Specification — Magieto</h1><p>مرجع مستقل از ابزار برای tokenها، typography، component variantها و رفتار responsive. همه نمونه‌ها در همین پروتوتایپ قابل مشاهده و آزمون هستند.</p></div><section><h2>رنگ‌های اصلی</h2><div className="spec-swatches">{swatches.map(([name, value]) => <div key={name}><span style={{ background: value }} /><strong>{name}</strong><code>{value}</code></div>)}</div></section><section><h2>تایپوگرافی</h2><div className="type-spec"><div><span>Display / 48</span><strong>انتخاب آگاهانه زیبایی</strong></div><div><span>Heading / 32</span><h2>محصول مناسب را پیدا کنید</h2></div><div><span>Body / 16</span><p>اطلاعات محصول باید دقیق، قابل‌مقایسه و بدون ادعای مبهم باشد.</p></div></div></section><section><h2>کامپوننت‌ها و Variantها</h2><div className="component-spec"><div><strong>Button</strong><span>Primary · Secondary · Text · Danger</span><small>Small / Medium / Large × Default / Hover / Focus / Disabled / Loading</small></div><div><strong>Input</strong><span>Text · Search · Phone · OTP · Select · Coupon</span><small>Default / Focus / Filled / Error / Success / Disabled</small></div><div><strong>Hero Carousel</strong><span>Skincare · Sun care · Makeup</span><small>Desktop / Tablet / Mobile × Default / Hover paused / Focus</small></div><div><strong>Product Card</strong><span>Grid · Horizontal · Compact</span><small>Default / Hover / Saved / Out of stock / Loading</small></div><div><strong>Feedback</strong><span>Toast · Alert · Empty · Error · Success</span><small>Inline / Page / Modal</small></div></div></section><section><h2>مسیر Prototype</h2><div className="prototype-flow"><span>خانه / اسلاید ۱</span><ArrowLeft /><span>اسلاید ۲ و ۳</span><ArrowLeft /><span>فهرست + فیلتر</span><ArrowLeft /><span>محصول</span><ArrowLeft /><span>سبد</span><ArrowLeft /><span>نشانی</span><ArrowLeft /><span>ارسال و پرداخت</span><ArrowLeft /><span>تأیید</span><ArrowLeft /><span>موفق / ناموفق</span></div></section><p className="spec-file-note">فهرست همه screenها و stateها در <Link href="/prototype">نقشه پروتوتایپ</Link> و سند <code>docs/09-developer-handoff.md</code> قرار دارد.</p></main>;
}

function NotFound() {
  return <main className="not-found"><strong>۴۰۴</strong><span className="eyebrow">مسیر پیدا نشد</span><h1>این صفحه در قفسه Magieto نیست</h1><p>ممکن است نشانی تغییر کرده باشد. از صفحه اصلی یا جست‌وجوی محصولات ادامه دهید.</p><div><Link href="/" className="button primary">صفحه اصلی</Link><Link href="/products" className="button secondary">محصولات</Link></div></main>;
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-top">
        <div className="footer-brand"><Logo /><p>فروشگاه محصولات آرایشی و بهداشتی</p></div>
        <div><strong>انتخاب و خرید</strong><Link href="/products">همه محصولات</Link><Link href="/brands">برندها</Link><Link href="/offers">پیشنهادها</Link><Link href="/wishlist">علاقه‌مندی‌ها</Link></div>
        <div><strong>راهنما و پشتیبانی</strong><Link href="/guides">راهنمای انتخاب</Link><Link href="/tracking">پیگیری سفارش</Link><Link href="/shipping">روش‌های ارسال</Link><Link href="/faq">پرسش‌های متداول</Link></div>
        <div><strong>درباره فروشگاه</strong><Link href="/about">درباره Magieto</Link><Link href="/authenticity">اصالت و تأمین</Link><Link href="/privacy">حریم خصوصی</Link><Link href="/terms">قوانین</Link></div>
      </div>
      <div className="container footer-bottom"><span>کلیه حقوق این وب‌سایت متعلق به Magieto است.</span></div>
    </footer>
  );
}

function MobileBottomNav({ cartCount }) {
  return <nav className="mobile-bottom-nav" aria-label="ناوبری موبایل"><Link href="/"><House size={21} /><span>خانه</span></Link><Link href="/products"><MagnifyingGlass size={21} /><span>محصولات</span></Link><Link href="/cart"><Bag size={21} />{cartCount > 0 && <b>{cartCount}</b>}<span>سبد</span></Link><Link href="/account"><User size={21} /><span>حساب</span></Link></nav>;
}

function NavigateTo({ href }) {
  useEffect(() => navigate(href), [href]);
  return null;
}

export function App() {
  const location = usePath();
  const pathname = location.split("?")[0];
  const [cart, setCart] = useState(() => ({
    [products[0].id]: { product: products[0], qty: 1 },
    [products[2].id]: { product: products[2], qty: 1 },
  }));
  const [wishlist, setWishlist] = useState(() => new Set([products[1].id]));
  const [loginOpen, setLoginOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [toast, setToast] = useState("");
  const toastTimer = useRef();
  const [orderCode, setOrderCode] = useState("");

  const showToast = (message) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 2800);
  };
  const addToCart = (product, qty = 1) => {
    setCart((current) => {
      const nextQuantity = (current[product.id]?.qty || 0) + qty;
      if (nextQuantity <= 0) {
        const next = { ...current };
        delete next[product.id];
        return next;
      }
      return { ...current, [product.id]: { product, qty: nextQuantity } };
    });
    showToast(qty > 0 ? `${product.name} به سبد اضافه شد` : `یک عدد از ${product.name} کم شد`);
  };
  const toggleWishlist = (product) => {
    setWishlist((current) => {
      const next = new Set(current);
      if (next.has(product.id)) { next.delete(product.id); showToast("از علاقه‌مندی‌ها حذف شد"); }
      else { next.add(product.id); showToast("در علاقه‌مندی‌ها ذخیره شد"); }
      return next;
    });
  };
  const updateQuantity = (id, qty) => {
    if (qty < 1) return;
    setCart((current) => ({ ...current, [id]: { ...current[id], qty } }));
  };
  const removeItem = (id) => setCart((current) => { const next = { ...current }; delete next[id]; return next; });
  const moveToWishlist = (product) => { setWishlist((current) => new Set([...current, product.id])); removeItem(product.id); showToast("محصول به علاقه‌مندی‌ها منتقل شد"); };
  const completeOrder = () => { setOrderCode(`MG-۱۴۰۵۰۵۰۷-${Math.floor(1000 + Math.random() * 8000).toLocaleString("fa-IR").replace("٬", "")}`); setCart({}); };
  const cartCount = Object.values(cart).reduce((sum, item) => sum + item.qty, 0);
  const bareLayout = pathname.startsWith("/checkout") || pathname.startsWith("/auth/");

  let page;
  if (pathname === "/") page = <HomePage wishlist={wishlist} onWishlist={toggleWishlist} onAdd={addToCart} />;
  else if (pathname === "/products") page = <ProductsPage wishlist={wishlist} onWishlist={toggleWishlist} onAdd={addToCart} />;
  else if (pathname.startsWith("/product/")) page = <ProductPage id={decodeURIComponent(pathname.split("/")[2] || "")} wishlist={wishlist} onWishlist={toggleWishlist} onAdd={addToCart} cart={cart} />;
  else if (pathname === "/cart") page = <CartPage cart={cart} setQuantity={updateQuantity} removeItem={removeItem} moveToWishlist={moveToWishlist} />;
  else if (pathname === "/checkout/success" || pathname === "/checkout/result/success") page = <CheckoutResult success orderCode={orderCode} />;
  else if (pathname === "/checkout/failed" || pathname === "/checkout/result/failed") page = <CheckoutResult success={false} orderCode={orderCode} />;
  else if (pathname === "/checkout" || pathname.startsWith("/checkout/")) page = <CheckoutPage cart={cart} onComplete={completeOrder} isLoggedIn={isLoggedIn} onLogin={() => setLoginOpen(true)} initialStep={pathname.endsWith("/review") ? 3 : pathname.endsWith("/delivery") || pathname.endsWith("/payment") ? 2 : 1} />;
  else if (pathname.startsWith("/auth/")) page = <AuthFlowPage mode={pathname.split("/")[2] || "login"} onSuccess={() => setIsLoggedIn(true)} />;
  else if (pathname === "/wishlist") page = <WishlistPage wishlist={wishlist} onWishlist={toggleWishlist} onAdd={addToCart} />;
  else if (pathname === "/account") page = <AccountPage />;
  else if (pathname.startsWith("/account/orders/")) page = <OrderDetailPage />;
  else if (pathname.startsWith("/account/")) page = <AccountPage section={pathname.split("/")[2]} />;
  else if (pathname === "/brands") page = <BrandsPage />;
  else if (pathname.startsWith("/brand/")) page = <BrandsPage selected={pathname.split("/")[2]} />;
  else if (pathname === "/guides") page = <GuidesPage wishlist={wishlist} onWishlist={toggleWishlist} onAdd={addToCart} />;
  else if (pathname.startsWith("/guide/")) page = <GuidesPage slug={pathname.split("/")[2]} wishlist={wishlist} onWishlist={toggleWishlist} onAdd={addToCart} />;
  else if (pathname === "/offers") page = <OffersPage wishlist={wishlist} onWishlist={toggleWishlist} onAdd={addToCart} />;
  else if (pathname === "/design-spec") page = <DesignSpecPage />;
  else if (Object.keys(infoContent).some((key) => pathname === `/${key}`)) page = <InfoPage type={pathname.slice(1)} />;
  else page = <NotFound />;

  return (
    <CartContext.Provider value={{ cart, changeQuantity: addToCart }}>
    <div className="app-shell">
      {!bareLayout && <Header cart={cart} wishlist={wishlist} cartCount={cartCount} wishlistCount={wishlist.size} isLoggedIn={isLoggedIn} onLogin={() => setLoginOpen(true)} onLogout={() => { setIsLoggedIn(false); showToast("از حساب خارج شدید"); }} onOpenMenu={() => setMenuOpen(true)} />}
      {page}
      {!bareLayout && <Footer />}
      {!bareLayout && <MobileBottomNav cartCount={cartCount} />}
      <MobileDrawer open={menuOpen} onClose={() => setMenuOpen(false)} onLogin={() => setLoginOpen(true)} />
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} onSuccess={() => { setIsLoggedIn(true); showToast("با موفقیت وارد شدید"); }} />
      <Toast message={toast} />
    </div>
    </CartContext.Provider>
  );
}
