import { useRef, useState } from "react";
import AnimatedDialog from "./AnimatedDialog";
import PhotoGallery from "./PhotoGallery";
import { Brand, Icon, Photo, InquiryForm, SocialLinks } from "./components";
import { addToCalendar } from "./downloads";
import useScrollReveal from "./useScrollReveal";
import useSmoothScroll from "./useSmoothScroll";
import useSectionNavigation, { sections } from "./useSectionNavigation";
import { branches, events, products } from "./data";
import "./App.css";

const gallery = [
  {
    name: "gin-tonic",
    alt: "Gin tonic La Elisa con romero junto a una pileta",
    caption: "Al aire libre",
  },
  {
    name: "gin-fuego",
    alt: "Botella de Gin La Elisa y su copa junto al fuego",
    caption: "Al calor del encuentro",
  },
  {
    name: "brindis",
    alt: "Gin de frutilla y maracuyá bajo las luces de un encuentro",
    caption: "Entre amigos",
  },
  {
    name: "lavanda",
    alt: "Lavanda sobre la tapa violeta de Gin La Elisa",
    caption: "Nuestros botánicos",
    position: "center bottom",
  },
  {
    name: "gin-mesa",
    alt: "Botella de Gin La Elisa entre dos copas, con flores violetas al fondo",
    caption: "En buena compañía",
  },
  {
    name: "gin-paisaje",
    alt: "Botella de Gin La Elisa frente a un paisaje verde al aire libre",
    caption: "Nuestro lugar",
  },
  {
    name: "gin-jardin",
    alt: "Botella de Gin La Elisa entre ramas de romero en el jardín",
    caption: "Entre botánicos",
  },
  {
    name: "gin-botanicos",
    alt: "Gin La Elisa sobre un poste de madera rodeado de plantas aromáticas",
    caption: "Carácter natural",
  },
];

function SectionHeading({ number, label, title, children }) {
  return (
    <div className="section-heading">
      <div>
        <p className="eyebrow">
          {number} / {label}
        </p>
        <h2>{title}</h2>
      </div>
      {children && <p>{children}</p>}
    </div>
  );
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [filter, setFilter] = useState("Todos");
  const [photo, setPhoto] = useState(null);
  const [activeSection, beginNavigation, endNavigation] = useSectionNavigation();
  const main = useRef(null);
  useScrollReveal(main);
  useSmoothScroll({
    onNavigateStart: beginNavigation,
    onNavigateEnd: endNavigation,
  });
  const visibleEvents =
    filter === "Todos"
      ? events
      : events.filter((event) => event.category === filter);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <>
      <a className="skip-link" href="#contenido">
        Ir al contenido
      </a>
      <header className="header">
        <div className="header-inner section-wrap">
          <Brand />
          <nav
            id="site-navigation"
            aria-label="Navegación principal"
            className={menuOpen ? "nav is-open" : "nav"}
          >
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                aria-current={
                  activeSection === section.id ? "location" : undefined
                }
                onClick={closeMenu}
              >
                {section.label}
              </a>
            ))}
          </nav>
          <button
            className="menu-toggle"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
            aria-controls="site-navigation"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span>Menú</span>
            <Icon name={menuOpen ? "close" : "menu"} />
          </button>
        </div>
      </header>

      <main id="contenido" ref={main}>
        <div className="identity">
          <section
            className="page-intro"
            id="inicio"
            aria-labelledby="site-title"
          >
            <figure className="intro-image">
              <Photo
                name="gin-noche"
                alt="Botella de Gin La Elisa sobre un fondo nocturno con luces desenfocadas"
                sizes="(max-width: 600px) 100vw, 75vh"
                eager
              />
            </figure>
            <div className="intro-content section-wrap">
              <div className="intro-copy">
                <p className="eyebrow">
                  GIN ARTESANAL · SAN NICOLÁS DE LOS ARROYOS
                </p>
                <h1 id="site-title">
                  Gin La Elisa.
                  <br />
                  <em>Un espíritu propio.</em>
                </h1>
                <p>
                  Somos una marca de gin artesanal de San Nicolás. Elaboramos en
                  pequeños lotes y llevamos nuestra propuesta a encuentros, ferias
                  y eventos.
                </p>
              </div>
            </div>
            <div className="intro-footer section-wrap">
              <dl className="identity-facts">
                <div>
                  <dt>Origen</dt>
                  <dd>San Nicolás, Buenos Aires</dd>
                </div>
                <div>
                  <dt>Identidad</dt>
                  <dd>Botánicos y lavanda</dd>
                </div>
                <div>
                  <dt>Elaboración</dt>
                  <dd>En pequeños lotes</dd>
                </div>
              </dl>
              <a
                className="intro-explore"
                href="#nosotros"
                onClick={closeMenu}
              >
                Conocé La Elisa <Icon name="arrow" />
              </a>
            </div>
          </section>
          <section
            id="nosotros"
            className="about-details section-band tone-lavender"
            aria-labelledby="nosotros-title"
          >
            <div className="story-image">
              <div className="story-image-frame">
                <Photo
                  name="gin-lotes"
                  alt="Una botella de Gin La Elisa sostenida a mano frente a un lote de botellas"
                />
              </div>
            </div>
            <div className="story-copy">
              <p className="eyebrow">01 / NOSOTROS</p>
              <h2 id="nosotros-title">
                Somos <em>Gin La Elisa.</em>
              </h2>
              <p>
                Somos una marca de gin artesanal de San Nicolás de los Arroyos.
                Elaboramos en pequeños lotes, con una identidad que combina
                botánicos, lavanda y el trabajo a mano.
              </p>
              <p>
                Queremos que cada botella sea parte de un buen encuentro: una
                charla entre amigos, una celebración o una noche para compartir.
                Ese es el espíritu que nos gusta llevar a cada copa.
              </p>
              <p>
                También estamos presentes con nuestras barras y nuestro stand,
                para acompañar eventos, ferias y festivales con la esencia de La
                Elisa.
              </p>
              <div className="story-signature">
                <span>Compartí tu momento La Elisa.</span>
                <img src="/images/isologo.png" alt="" width="52" height="52" />
              </div>
            </div>
          </section>
        </div>

        <section id="gin" className="site-section products section-wrap">
          <SectionHeading
            number="02"
            label="NUESTRO GIN"
            title="Variedades de La Elisa."
          >
            Nuestra versión clásica y las alternativas de frutilla y maracuyá.
            Conocé cada una y sus formas de disfrutarla.
          </SectionHeading>
          <div className="product-grid">
            {products.map((product, index) => (
              <article className="product" key={product.id}>
                <figure className="product-figure">
                  <Photo name={product.image} alt={product.alt} />
                </figure>
                <div className="product-info">
                  <h3>{product.title}</h3>
                  <span>0{index + 1}</span>
                </div>
                <p>{product.description}</p>
                <details className="inline-details">
                  <summary>
                    Para disfrutarlo
                    <Icon name="plus" />
                  </summary>
                  <div className="details-body">
                    <p>{product.serving}</p>
                  </div>
                </details>
              </article>
            ))}
          </div>
        </section>

        <section id="barras" className="site-section bars section-band tone-dark">
          <SectionHeading
            number="03"
            label="BARRAS Y EVENTOS"
            title="Nuestras propuestas de barra."
          >
            Dos formatos para eventos y un stand para ferias y festivales. La
            propuesta se puede consultar según el tipo de encuentro.
          </SectionHeading>
          <div className="services-layout">
            <figure className="bar-photo">
              <Photo
                name="noche-la-elisa"
                alt="Botellas y copa La Elisa en un encuentro nocturno"
              />
              <figcaption>La Elisa en los encuentros.</figcaption>
            </figure>
            <div className="bar-options">
              <article>
                <span className="service-number">01</span>
                <div>
                  <h3>Barra de autoservicio</h3>
                  <p>
                    Una barra para que cada invitado se acerque y se sirva a su
                    ritmo. Un formato práctico para acompañar el encuentro con
                    el gin de La Elisa.
                  </p>
                </div>
              </article>
              <article>
                <span className="service-number">02</span>
                <div>
                  <h3>Barra completa</h3>
                  <p>
                    Una barra grande con gin, cerveza, fernet y una variedad de
                    tragos para distintos gustos.
                  </p>
                  <ul className="drink-list">
                    <li>Gin & tonic</li>
                    <li>Cerveza</li>
                    <li>Fernet</li>
                    <li>Tragos</li>
                  </ul>
                </div>
              </article>
              <article>
                <span className="service-number">03</span>
                <div>
                  <h3>Stand de La Elisa</h3>
                  <p>
                    Participamos en ferias y festivales con nuestro stand y
                    nuestro gin. Las próximas participaciones se anuncian en la
                    agenda.
                  </p>
                </div>
              </article>
              <a
                href="#contacto"
                className="text-link"
                onClick={closeMenu}
              >
                Consultas sobre las barras
                <Icon name="arrow" />
              </a>
            </div>
          </div>
        </section>

        <section id="agenda" className="site-section agenda section-wrap">
          <SectionHeading
            number="04"
            label="AGENDA"
            title="Próximos encuentros."
          >
            Un espacio para anunciar dónde vamos a estar con nuestro gin,
            nuestras barras y el stand.
          </SectionHeading>
          <div className="agenda-toolbar">
            <div className="filters" role="group" aria-label="Filtrar eventos">
              {["Todos", "Ferias", "Experiencias"].map((value) => (
                <button
                  key={value}
                  className={filter === value ? "active" : ""}
                  aria-pressed={filter === value}
                  onClick={() => setFilter(value)}
                >
                  {value}
                </button>
              ))}
            </div>
            <span className="demo-label">
              <span /> Agenda de ejemplo · eventos ficticios
            </span>
          </div>
          <div className="event-list" key={filter} aria-live="polite">
            {visibleEvents.map((event, index) => (
              <details
                className="event"
                key={event.id}
                style={{ "--event-index": index }}
              >
                <summary>
                  <span className="event-date">
                    <strong>{event.day}</strong>
                    <span>
                      {event.month} {event.year}
                    </span>
                  </span>
                  <span className="event-main">
                    <span className="event-type">{event.label}</span>
                    <span className="event-title">{event.title}</span>
                    <span className="event-place">
                      <Icon name="pin" />
                      {event.place}
                      <span className="event-time">{event.time} h</span>
                    </span>
                  </span>
                  <Icon name="plus" className="details-toggle" />
                  <span className="sr-only">Ver detalles de {event.title}</span>
                </summary>
                <div className="details-body event-body">
                  <p>{event.description}</p>
                  <p className="form-note">
                    Evento ficticio para esta presentación. No es una
                    convocatoria real.
                  </p>
                  <button
                    className="text-link"
                    onClick={() => addToCalendar(event)}
                  >
                    Guardar ejemplo en calendario
                    <Icon name="calendar" />
                  </button>
                </div>
              </details>
            ))}
          </div>
        </section>

        <section
          id="sucursales"
          className="site-section locations section-band tone-lavender"
        >
          <SectionHeading
            number="05"
            label="SUCURSALES"
            title="Dónde encontrarnos."
          >
            Direcciones, horarios y una descripción de cada espacio, reunidos en
            esta página.
          </SectionHeading>
          <p className="demo-label branch-demo">
            <span /> Sucursales ficticias para esta presentación
          </p>
          <div className="branch-grid">
            {branches.map((branch) => (
              <article className="branch" key={branch.id}>
                <div className="branch-top">
                  <span>{branch.city}</span>
                  <Icon name="pin" />
                </div>
                <h3>{branch.name}</h3>
                <address>{branch.address}</address>
                <p className="branch-hours">{branch.hours}</p>
                <p>{branch.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="galeria"
          className="site-section gallery-section section-wrap"
          aria-labelledby="moments-title"
        >
          <PhotoGallery items={gallery} onOpen={setPhoto} />
        </section>

        <section
          id="contacto"
          className="site-section contact-section section-band tone-purple"
        >
          <div className="contact-copy">
            <p className="eyebrow">07 / CONTACTO</p>
            <h2>Contacto y consultas.</h2>
            <p>
              Para consultas sobre nuestras variedades, las barras o la
              participación en un evento, prepará un mensaje con los detalles de
              tu encuentro.
            </p>
            <div className="contact-note">
              <Icon name="glass" />
              <p>
                Podés consultar por gin, barra de autoservicio, barra completa o
                stand.
              </p>
            </div>
            <p className="form-note">
              Escribinos desde los íconos de WhatsApp o Instagram. También podés
              usar el formulario para preparar, copiar o descargar tu consulta.
            </p>
          </div>
          <div className="contact-form-panel">
            <InquiryForm />
          </div>
        </section>
      </main>

      <footer className="footer section-wrap">
        <div className="footer-top">
          <Brand footer />
          <p>
            Gin artesanal.
            <br />
            <span>San Nicolás de los Arroyos, Buenos Aires.</span>
          </p>
          <SocialLinks />
          <a className="text-link" href="#inicio">
            Volver al inicio
            <Icon name="diagonal" />
          </a>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Gin La Elisa</span>
          <span>
            Beber con moderación. Prohibida su venta a menores de 18 años.
          </span>
          <span className="footer-demo">Sitio de muestra</span>
        </div>
      </footer>

      <SocialLinks floating />

      <AnimatedDialog
        open={Boolean(photo)}
        contentKey={photo?.name || "closed"}
        onClose={() => setPhoto(null)}
      >
        {() =>
          photo && (
            <div className="dialog-content gallery-dialog-content">
              <Photo name={photo.name} alt={photo.alt} eager />
              <div className="gallery-dialog-caption">
                <p className="eyebrow">MOMENTOS LA ELISA</p>
                <h2 id="dialog-title">{photo.caption}</h2>
              </div>
            </div>
          )
        }
      </AnimatedDialog>
    </>
  );
}
