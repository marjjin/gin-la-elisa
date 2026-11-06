import { useRef, useState } from "react";
import AnimatedDialog from "./AnimatedDialog";
import useScrollReveal from "./useScrollReveal";
import { branches, events, products } from "./data";
import imageMetadata from "./image-metadata.json";
import "./App.css";

function Icon({ name = "arrow", className = "", ...props }) {
  const paths = {
    arrow: (
      <>
        <path d="M5 12h14M12 5l7 7-7 7" />
      </>
    ),
    diagonal: (
      <>
        <path d="M6 18 18 6M6 6h12v12" />
      </>
    ),
    pin: (
      <>
        <path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    menu: (
      <>
        <path d="M4 7h16M4 12h16M4 17h16" />
      </>
    ),
    close: (
      <>
        <path d="m6 6 12 12M6 18 18 6" />
      </>
    ),
    glass: (
      <>
        <path d="M6 3h12l-2 9a4 4 0 0 1-8 0L6 3ZM12 16v5M8 21h8M7 8h10" />
      </>
    ),
    leaf: (
      <>
        <path d="M20 3C8 2 2 9 5 16s17 6 15-13Z" />
        <path d="m3 21 12-12M9 15v-5M9 15h6" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M7 3v4M17 3v4M3 11h18M8 15h2M14 15h2" />
      </>
    ),
    check: (
      <>
        <path d="m5 12 4 4L19 6" />
      </>
    ),
    plus: (
      <>
        <path d="M12 5v14M5 12h14" />
      </>
    ),
  };
  return (
    <svg
      className={`icon ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
function Photo({ name, alt, className = "", eager = false, ...props }) {
  const { width, height, smallWidth } = imageMetadata[name];
  return (
    <img
      className={className}
      src={`/images/${name}.webp`}
      srcSet={
        smallWidth === width
          ? undefined
          : `/images/${name}-small.webp ${smallWidth}w, /images/${name}.webp ${width}w`
      }
      sizes="(max-width: 700px) 100vw, 50vw"
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "auto"}
      width={width}
      height={height}
      {...props}
    />
  );
}
function Brand({ footer = false }) {
  return (
    <a
      className={`brand ${footer ? "brand-footer" : ""}`}
      href="#inicio"
      aria-label="Gin La Elisa, inicio"
    >
      <img src="/images/isologo.png" alt="" width="52" height="52" />
      <span>
        <small>GIN</small>
        <strong>LA ELISA</strong>
      </span>
    </a>
  );
}
function downloadFile(text, filename, type) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function addToCalendar(event) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Gin La Elisa//Demo//ES",
    "BEGIN:VEVENT",
    `UID:demo-${event.id}@ginlaelisa.example`,
    "DTSTAMP:20261106T120000Z",
    `DTSTART:${event.start}`,
    `DTEND:${event.end}`,
    `SUMMARY:[EJEMPLO] ${event.title}`,
    `LOCATION:${event.place} (ubicación ficticia)`,
    "DESCRIPTION:Evento ficticio creado para mostrar el diseño de Gin La Elisa. No es una convocatoria real.",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  downloadFile(
    lines.join("\r\n"),
    `la-elisa-evento-ejemplo-${event.id}.ics`,
    "text/calendar;charset=utf-8",
  );
}
function InquiryForm({ initialService }) {
  const [summary, setSummary] = useState("");
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  function prepare(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSummary(
      `¡Hola, Gin La Elisa! Soy ${data.get("name")}.\nMe interesa: ${data.get("service")}.\nTipo de evento: ${data.get("type")}.\nFecha: ${data.get("date") || "A coordinar"}.\nInvitados: ${data.get("guests") || "A confirmar"}.\nLugar: ${data.get("place") || "A confirmar"}.\n${data.get("message") || ""}`,
    );
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setCopyError(false);
    } catch {
      setCopyError(true);
    }
  }
  if (summary)
    return (
      <div className="inquiry-result">
        <span className="result-icon">
          <Icon name="check" />
        </span>
        <h3>Un buen plan empieza acá.</h3>
        <p>Tu consulta está lista para compartir con el equipo de La Elisa.</p>
        <pre>{summary}</pre>
        <div className="form-actions">
          <button className="button" onClick={copy}>
            {copied ? "Consulta copiada" : "Copiar consulta"}
            <Icon name={copied ? "check" : "arrow"} />
          </button>
          <button
            className="text-link"
            onClick={() =>
              downloadFile(
                summary,
                "consulta-la-elisa.txt",
                "text/plain;charset=utf-8",
              )
            }
          >
            Descargar texto
          </button>
        </div>
        {copyError && (
          <p role="status">
            Podés descargar el texto o seleccionarlo y copiarlo.
          </p>
        )}
        <p className="form-note">
          Esta es una demostración: la consulta no se envió. El canal de
          contacto oficial se incorporará cuando esté disponible.
        </p>
        <button
          className="text-link"
          onClick={() => {
            setSummary("");
            setCopied(false);
          }}
        >
          Preparar otra consulta
        </button>
      </div>
    );
  return (
    <form onSubmit={prepare} className="inquiry-form">
      <p>Contanos qué tenés en mente y prepará tu consulta.</p>
      <div className="form-grid">
        <label>
          Tu nombre
          <input
            name="name"
            autoComplete="name"
            required
            maxLength="100"
            placeholder="¿Cómo te llamás?"
          />
        </label>
        <label>
          Me interesa
          <select
            name="service"
            defaultValue={initialService || "Barra completa"}
          >
            {[
              "Barra completa",
              "Barra de autoservicio",
              "Stand de gin",
              ...products.map((p) => p.title),
            ].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          Tipo de encuentro
          <select name="type">
            <option>Evento privado</option>
            <option>Casamiento</option>
            <option>Cumpleaños</option>
            <option>Evento de empresa</option>
            <option>Feria o festival</option>
            <option>Consulta de productos</option>
            <option>Otro</option>
          </select>
        </label>
        <label>
          Fecha estimada
          <input name="date" type="date" />
        </label>
        <label>
          Cantidad de invitados
          <input
            name="guests"
            type="number"
            min="1"
            max="100000"
            placeholder="Ej. 80"
          />
        </label>
        <label>
          Ciudad o lugar
          <input name="place" maxLength="150" placeholder="¿Dónde brindamos?" />
        </label>
      </div>
      <label>
        Algo más que quieras contarnos
        <textarea
          name="message"
          rows="3"
          maxLength="1500"
          placeholder="La idea, el motivo, los detalles…"
        />
      </label>
      <p className="form-note">
        Sitio de muestra. Este formulario prepara un mensaje para copiar o
        descargar; no envía datos.
      </p>
      <button className="button" type="submit">
        Preparar mi consulta
        <Icon />
      </button>
    </form>
  );
}
export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [filter, setFilter] = useState("Todos");
  const [modal, setModal] = useState(null);
  const main = useRef(null);
  useScrollReveal(main);
  const openInquiry = (service) => setModal({ kind: "inquiry", service });
  const visibleEvents =
    filter === "Todos" ? events : events.filter((e) => e.category === filter);
  const nav = [
    ["Nuestro gin", "gin"],
    ["Las barras", "barras"],
    ["Agenda", "agenda"],
    ["Sucursales", "sucursales"],
  ];
  return (
    <>
      <a className="skip-link" href="#contenido">
        Ir al contenido
      </a>
      <header className="header">
        <div className="header-inner">
          <Brand />
          <nav
            aria-label="Navegación principal"
            className={menuOpen ? "nav is-open" : "nav"}
          >
            {nav.map(([label, id]) => (
              <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)}>
                {label}
              </a>
            ))}
          </nav>
          <button className="header-cta" onClick={() => openInquiry()}>
            Llevanos a tu evento
            <Icon name="diagonal" />
          </button>
          <button
            className="menu-toggle"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Icon name={menuOpen ? "close" : "menu"} />
          </button>
        </div>
      </header>
      <main id="contenido" ref={main}>
        <section className="hero section-wrap" id="inicio">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="little-line" /> HECHO EN SAN NICOLÁS
            </div>
            <h1>
              Hay momentos
              <br />
              que merecen
              <br />
              un <em>buen gin.</em>
            </h1>
            <p>
              Botánicos, un toque de lavanda y muchas ganas de compartir. Así se
              vive el momento La Elisa.
            </p>
            <div className="hero-actions">
              <a className="button" href="#gin">
                Descubrí nuestro gin
                <Icon />
              </a>
              <a className="text-link" href="#barras">
                Conocé las barras
                <Icon name="diagonal" />
              </a>
            </div>
            <div className="hero-footnote">
              <Icon name="leaf" />
              <span>
                En pequeños lotes.
                <br />
                <strong>Para grandes momentos.</strong>
              </span>
            </div>
          </div>
          <div className="hero-art">
            <span className="hero-outline" aria-hidden="true" />
            <img
              className="hero-watermark"
              src="/images/isologo.png"
              alt=""
              width="649"
              height="647"
            />
            <div className="hero-photo">
              <Photo
                name="gin-fuego"
                alt="Botella de Gin La Elisa y su copa junto al fuego"
                eager
              />
              <span className="photo-caption">EL ARTE DE COMPARTIR.</span>
            </div>
            <div className="hero-inset">
              <Photo
                name="brindis"
                alt="Gin La Elisa de frutilla y maracuyá bajo las luces de una noche al aire libre"
                eager
              />
              <span>Una copa. Mil planes.</span>
            </div>
            <div className="origin-seal">
              <Icon name="leaf" />
              <span>
                ESPÍRITU
                <br />
                <strong>ARTESANAL</strong>
                <small>GIN LA ELISA</small>
              </span>
            </div>
            <span className="hero-side-note">SMALL BATCH · HANDCRAFTED</span>
          </div>
        </section>
        <div className="brand-strip" aria-label="El espíritu de La Elisa">
          <span>GIN CON IDENTIDAD</span>
          <span className="strip-flower">✳</span>
          <span>BUENOS ENCUENTROS</span>
          <span className="strip-flower">✳</span>
          <span>HECHO PARA COMPARTIR</span>
          <span className="strip-flower">✳</span>
          <span>EL MOMENTO ES AHORA</span>
          <span className="strip-flower">✳</span>
        </div>
        <section className="products section-wrap section-space" id="gin">
          <div className="section-heading">
            <div>
              <p className="eyebrow">01 / NUESTRO GIN</p>
              <h2>
                Un mismo espíritu.
                <br />
                <em>Distintas formas de disfrutarlo.</em>
              </h2>
            </div>
            <p>
              Desde el clásico que siempre va, hasta ese sabor que te invita a
              probar algo nuevo. Encontrá tu próximo favorito.
            </p>
          </div>
          <div className="product-grid">
            {products.map((product, i) => (
              <article className={`product product-${i}`} key={product.id}>
                <button
                  className="product-image"
                  onClick={() => setModal({ kind: "product", item: product })}
                  aria-label={`Conocer ${product.title}`}
                >
                  <Photo name={product.image} alt={product.alt} />
                  <span className="image-tag">{product.tag}</span>
                  <span className="round-arrow">
                    <Icon name="diagonal" />
                  </span>
                </button>
                <div className="product-info">
                  <div>
                    <span className="product-kicker">GIN LA ELISA</span>
                    <h3>{product.title}</h3>
                  </div>
                  <span className="product-number">0{i + 1}</span>
                </div>
                <p>{product.short}</p>
              </article>
            ))}
          </div>
          <p className="product-bottom">
            <Icon name="glass" /> El mejor ingrediente siempre es la compañía.
          </p>
        </section>
        <section className="story">
          <div className="story-inner section-wrap">
            <div className="story-image">
              <div className="story-image-frame">
                <Photo
                  name="gin-lotes"
                  alt="Una botella de Gin La Elisa sostenida a mano frente a un lote de botellas"
                />
              </div>
            </div>
            <div className="story-copy">
              <p className="eyebrow">DE ACÁ. CON CARÁCTER PROPIO.</p>
              <h2>
                Un poco de origen.
                <br />
                Un mucho de <em>nosotros.</em>
              </h2>
              <p>
                Nuestro gin lleva el nombre de La Elisa y el espíritu de San
                Nicolás de los Arroyos. Un encuentro entre los botánicos, la
                lavanda y el placer de hacer las cosas a mano.
              </p>
              <p>
                Nos gusta pensar que una botella es apenas el comienzo. Lo que
                viene después son las charlas largas, los amigos de siempre y
                esos brindis que se quedan.
              </p>
              <div className="story-signature">
                <span>Compartí tu momento La Elisa.</span>
                <img src="/images/isologo.png" width="70" height="70" alt="" />
              </div>
            </div>
          </div>
        </section>
        <section className="bars section-space" id="barras">
          <div className="section-wrap">
            <div className="section-heading">
              <div>
                <p className="eyebrow">02 / LA ELISA EN TU EVENTO</p>
                <h2>
                  Vos ponés el motivo.
                  <br />
                  <em>Nosotros, la barra.</em>
                </h2>
              </div>
              <p>
                Una fiesta, un encuentro, una celebración. Tenemos una propuesta
                para acompañar tu manera de brindar.
              </p>
            </div>
            <div className="bar-layout">
              <div className="bar-photo">
                <Photo
                  name="noche-la-elisa"
                  alt="Botellas y copa La Elisa listas para compartir en un encuentro nocturno"
                />
                <div className="bar-photo-label">
                  <Icon name="glass" />
                  <span>
                    HAGAMOS DE TU EVENTO
                    <br />
                    <strong>un gran encuentro.</strong>
                  </span>
                </div>
              </div>
              <div className="bar-options">
                <article>
                  <span className="bar-index">01 / SERVITE A TU MANERA</span>
                  <h3>Barra de autoservicio</h3>
                  <p>
                    Una propuesta para que cada invitado se acerque, se sirva y
                    siga disfrutando. El espíritu de La Elisa, con la libertad
                    de hacerlo a tu ritmo.
                  </p>
                  <div className="bar-tags">
                    <span>Práctica</span>
                    <span>Distinta</span>
                    <span>Para compartir</span>
                  </div>
                  <button
                    className="text-link light-link"
                    onClick={() => openInquiry("Barra de autoservicio")}
                  >
                    Quiero esta barra
                    <Icon name="diagonal" />
                  </button>
                </article>
                <article>
                  <span className="bar-index">
                    02 / TODOS LOS GUSTOS, UNA BARRA
                  </span>
                  <h3>La barra completa</h3>
                  <p>
                    Gin, cerveza, fernet y una variedad de tragos para que todos
                    encuentren su favorito. Una barra grande, pensada para ser
                    parte de la fiesta.
                  </p>
                  <div className="bar-tags">
                    <span>Gin & tonic</span>
                    <span>Cerveza</span>
                    <span>Fernet</span>
                    <span>Tragos</span>
                  </div>
                  <button
                    className="text-link light-link"
                    onClick={() => openInquiry("Barra completa")}
                  >
                    Armemos mi evento
                    <Icon name="diagonal" />
                  </button>
                </article>
              </div>
            </div>
            <div className="stand-note">
              <Icon name="plus" />
              <p>
                ¿Organizás una feria o festival?{" "}
                <strong>También vamos con nuestro stand y nuestro gin.</strong>
              </p>
              <button
                className="text-link light-link"
                onClick={() => openInquiry("Stand de gin")}
              >
                Hablemos
                <Icon name="diagonal" />
              </button>
            </div>
          </div>
        </section>
        <section className="agenda section-wrap section-space" id="agenda">
          <div className="section-heading">
            <div>
              <p className="eyebrow">03 / POR ACÁ VAMOS A ESTAR</p>
              <h2>
                El próximo brindis
                <br />
                <em>ya tiene un plan.</em>
              </h2>
            </div>
            <p>
              Ferias, encuentros y noches con La Elisa. Enterate dónde encontrar
              nuestro stand, nuestro gin y nuestras barras.
            </p>
          </div>
          <div className="agenda-toolbar">
            <div className="filters" role="group" aria-label="Filtrar eventos">
              {["Todos", "Ferias", "Experiencias"].map((f) => (
                <button
                  key={f}
                  className={filter === f ? "active" : ""}
                  aria-pressed={filter === f}
                  onClick={() => setFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
            <span className="demo-label">
              <span /> Agenda de ejemplo · eventos ficticios
            </span>
          </div>
          <div className="event-list" aria-live="polite" key={filter}>
            {visibleEvents.map((event, index) => (
              <article
                className="event"
                key={event.id}
                style={{ "--event-index": index }}
              >
                <div className="event-date">
                  <strong>{event.day}</strong>
                  <span>
                    {event.month} / {event.year}
                  </span>
                </div>
                <div className="event-main">
                  <span className="event-type">{event.label}</span>
                  <h3>{event.title}</h3>
                  <p>
                    <Icon name="pin" />
                    {event.place}
                    <span className="event-time">{event.time} h</span>
                  </p>
                </div>
                <button
                  className="event-action"
                  aria-label={`Ver el encuentro: ${event.title}`}
                  onClick={() => setModal({ kind: "event", item: event })}
                >
                  <span>Ver el encuentro</span>
                  <Icon name="diagonal" />
                  <span className="sr-only">: {event.title}</span>
                </button>
              </article>
            ))}
          </div>
          <p className="agenda-note">
            Una muestra de cómo se verán nuestros próximos encuentros. Las
            fechas y los lugares se reemplazarán por la agenda oficial.
          </p>
        </section>
        <section className="locations section-space" id="sucursales">
          <div className="section-wrap">
            <div className="section-heading">
              <div>
                <p className="eyebrow">04 / CERCA TUYO</p>
                <h2>
                  Siempre hay un lugar
                  <br />
                  <em>para encontrarnos.</em>
                </h2>
              </div>
              <p>
                Elegí tu próxima parada. Distintos espacios, la misma esencia La
                Elisa.
              </p>
            </div>
            <div className="locations-layout">
              <div className="location-photo">
                <Photo
                  name="gin-mesa"
                  alt="Una botella La Elisa acompañada de sus copas sobre una mesa"
                />
                <span>Nos encontramos en una copa.</span>
              </div>
              <div className="branch-list">
                <p className="demo-label">
                  <span /> Sucursales ficticias para esta presentación
                </p>
                {branches.map((branch) => (
                  <article className="branch" key={branch.id}>
                    <div className="branch-top">
                      <span>{branch.city}</span>
                      <Icon name="pin" />
                    </div>
                    <h3>{branch.name}</h3>
                    <p>{branch.address}</p>
                    <div className="branch-bottom">
                      <span>{branch.hours}</span>
                      <button
                        className="text-link"
                        onClick={() =>
                          setModal({ kind: "branch", item: branch })
                        }
                        aria-label={`Ver detalles de ${branch.name}`}
                      >
                        Conocer
                        <Icon name="diagonal" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
        <section className="moments section-wrap section-space">
          <div className="moments-top">
            <p className="eyebrow">EL MOMENTO LA ELISA</p>
            <h2>
              Lo bueno se <em>comparte.</em>
            </h2>
            <p>
              En el jardín, junto al fuego o bajo las luces.
              <br />
              El lugar cambia. Las ganas de brindar, siempre.
            </p>
          </div>
          <div className="moments-grid">
            <Photo
              name="gin-tonic"
              alt="Una copa de gin tonic La Elisa con romero junto a una pileta"
            />
            <Photo
              name="gin-paisaje"
              alt="Gin La Elisa frente a un paisaje verde"
            />
            <Photo
              name="brindis"
              alt="Gin de frutilla y maracuyá para compartir"
            />
            <Photo
              name="lavanda"
              alt="Lavanda junto a la tapa violeta de Gin La Elisa"
            />
          </div>
        </section>
        <section className="contact-banner">
          <img src="/images/isologo.png" alt="" width="649" height="647" />
          <div className="section-wrap contact-inner">
            <p className="eyebrow">EL PRÓXIMO MOMENTO PUEDE SER EL TUYO</p>
            <h2>
              ¿Y si armamos
              <br />
              <em>algo bueno?</em>
            </h2>
            <button
              className="button button-cream"
              onClick={() => openInquiry()}
            >
              Llevá La Elisa a tu evento
              <Icon name="diagonal" />
            </button>
            <p>Gin, barras y encuentros que se disfrutan.</p>
          </div>
        </section>
      </main>
      <footer className="footer section-wrap">
        <div className="footer-top">
          <Brand footer />
          <p>
            De San Nicolás.
            <br />
            <span>Para compartir donde quieras.</span>
          </p>
          <a className="text-link" href="#inicio">
            Volver arriba
            <Icon name="diagonal" />
          </a>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Gin La Elisa</span>
          <span>
            Beber con moderación. Prohibida su venta a menores de 18 años.
          </span>
          <span className="footer-demo">Diseño de muestra</span>
        </div>
      </footer>
      <AnimatedDialog
        open={Boolean(modal)}
        contentKey={
          modal
            ? `${modal.kind}:${modal.item?.id || modal.service || "general"}`
            : "closed"
        }
        onClose={() => setModal(null)}
      >
        {(closeDialog) =>
          modal && (
            <div className="dialog-content">
              {modal.kind === "inquiry" && (
                <>
                  <p className="eyebrow">LA ELISA EN TU EVENTO</p>
                  <h2 id="dialog-title">
                    Arranquemos con
                    <br />
                    <em>una buena idea.</em>
                  </h2>
                  <InquiryForm
                    key={modal.service || "general"}
                    initialService={modal.service}
                  />
                </>
              )}
              {modal.kind === "product" && (
                <>
                  <div className="dialog-product-photo">
                    <Photo name={modal.item.image} alt={modal.item.alt} />
                  </div>
                  <p className="eyebrow">GIN LA ELISA / {modal.item.tag}</p>
                  <h2 id="dialog-title">{modal.item.title}</h2>
                  <p>{modal.item.description}</p>
                  <p className="dialog-serving">
                    <Icon name="glass" />
                    {modal.item.serving}
                  </p>
                  <button
                    className="button"
                    onClick={() => openInquiry(modal.item.title)}
                  >
                    Consultar por este gin
                    <Icon />
                  </button>
                </>
              )}
              {modal.kind === "event" && (
                <>
                  <p className="demo-label">
                    <span /> Evento ficticio de ejemplo
                  </p>
                  <p className="eyebrow">
                    {modal.item.day} DE {modal.item.fullMonth.toUpperCase()} ·{" "}
                    {modal.item.year}
                  </p>
                  <h2 id="dialog-title">{modal.item.title}</h2>
                  <p>{modal.item.description}</p>
                  <div className="dialog-details">
                    <p>
                      <Icon name="pin" />
                      {modal.item.place}
                    </p>
                    <p>
                      <Icon name="calendar" />
                      {modal.item.time} h · {modal.item.label}
                    </p>
                  </div>
                  <p className="form-note">
                    Este encuentro es ficticio y muestra cómo se anunciarán los
                    eventos reales. Si lo guardás, figurará como [EJEMPLO] en tu
                    calendario.
                  </p>
                  <button
                    className="button"
                    onClick={() => addToCalendar(modal.item)}
                  >
                    Guardar ejemplo en calendario
                    <Icon name="calendar" />
                  </button>
                </>
              )}
              {modal.kind === "branch" && (
                <>
                  <p className="demo-label">
                    <span /> Sucursal ficticia de ejemplo
                  </p>
                  <p className="eyebrow">{modal.item.city}</p>
                  <h2 id="dialog-title">{modal.item.name}</h2>
                  <p>{modal.item.description}</p>
                  <div className="dialog-details">
                    <p>
                      <Icon name="pin" />
                      {modal.item.address}
                    </p>
                    <p>
                      <Icon name="calendar" />
                      {modal.item.hours}
                    </p>
                  </div>
                  <p className="form-note">
                    El nombre, la dirección y los horarios son ejemplos de
                    diseño. No corresponden a una sucursal real.
                  </p>
                  <a
                    className="button"
                    href="#sucursales"
                    onClick={closeDialog}
                  >
                    Volver a sucursales
                    <Icon />
                  </a>
                </>
              )}
            </div>
          )
        }
      </AnimatedDialog>
    </>
  );
}
