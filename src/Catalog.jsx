import { useState } from "react";
import AnimatedDialog from "./AnimatedDialog";
import { Brand, Icon, Photo, SocialLinks } from "./components";
import { catalogCategories, catalogProducts } from "./catalog-data";
import { socialChannels } from "./data";
import useInitialLoading from "./useInitialLoading";
import useSmoothScroll from "./useSmoothScroll";
import "./App.css";
import "./Catalog.css";

const whatsapp = socialChannels.find((channel) => channel.id === "whatsapp").href;

function inquiryLink(product) {
  const message = `¡Hola! Me interesa ${product.title}. ¿Me pasan el precio, las presentaciones y la disponibilidad?`;
  return `${whatsapp}?text=${encodeURIComponent(message)}`;
}

export default function Catalog() {
  const [category, setCategory] = useState("Todos");
  const [selected, setSelected] = useState(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  useInitialLoading({ imageSelector: ".catalog-grid img" });
  useSmoothScroll();
  const visibleProducts = category === "Todos"
    ? catalogProducts
    : catalogProducts.filter((product) => product.category === category);

  function openProduct(product) {
    setPhotoIndex(0);
    setSelected(product);
  }

  return (
    <>
      <a className="skip-link" href="#catalogo">Ir a los productos</a>
      <header className="header catalog-header">
        <div className="header-inner section-wrap">
          <Brand href="/#inicio" />
          <nav className="catalog-nav" aria-label="Navegación principal">
            <a href="/">Inicio</a>
            <a href="/productos/" aria-current="page">Productos</a>
            <a href="/#contacto">Contacto <Icon name="diagonal" /></a>
          </nav>
        </div>
      </header>

      <main className="catalog-main" id="inicio">
        <section className="catalog-intro section-wrap" aria-labelledby="catalog-title">
          <div className="catalog-breadcrumb">
            <a href="/">Inicio</a><span aria-hidden="true">/</span><span>Productos</span>
          </div>
          <div className="catalog-intro-layout">
            <div>
              <p className="eyebrow">EL CATÁLOGO · LA ELISA</p>
              <h1 id="catalog-title">Para brindar.<br /><em>Para compartir.</em></h1>
            </div>
            <div className="catalog-intro-note">
              <Icon name="leaf" />
              <p>Nuestro gin y una selección de productos para acompañar tus encuentros. Conocé cada opción y consultanos por la que más te guste.</p>
              <span>Gin · Panes · Prepizzas · Dulces</span>
            </div>
          </div>
        </section>

        <section id="catalogo" className="catalog-section section-wrap" aria-label="Catálogo de productos">
          <div className="catalog-toolbar">
            <div className="catalog-filters" role="group" aria-label="Filtrar productos por categoría">
              {catalogCategories.map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={category === value}
                  onClick={() => setCategory(value)}
                >
                  {value}
                  <span>{value === "Todos" ? catalogProducts.length : catalogProducts.filter((product) => product.category === value).length}</span>
                </button>
              ))}
            </div>
            <p className="catalog-availability">Precios y disponibilidad por consulta</p>
          </div>
          <p className="sr-only" role="status">
            {visibleProducts.length} productos en {category}
          </p>
          <div className="catalog-grid" key={category}>
            {visibleProducts.map((product, index) => (
              <article className="catalog-product" key={product.id} id={`producto-${product.id}`}>
                <button
                  className="catalog-photo-button"
                  type="button"
                  onClick={() => openProduct(product)}
                  aria-label={`Ver fotos y detalles de ${product.title}`}
                >
                  <Photo
                    name={product.images[0]}
                    alt={product.alt}
                    sizes="(max-width: 600px) calc(100vw - 40px), (max-width: 1000px) 44vw, 29vw"
                    eager={index < 3}
                  />
                  <span className="catalog-photo-category">{product.category}</span>
                  <span className="catalog-photo-expand"><Icon name="diagonal" /></span>
                </button>
                <div className="catalog-product-meta">
                  <p className="eyebrow">{product.tag}</p>
                  <h2>{product.title}</h2>
                  <p>{product.short}</p>
                  <div className="catalog-product-actions">
                    <button className="text-link" type="button" onClick={() => openProduct(product)}>
                      Ver producto <Icon name="arrow" />
                    </button>
                    <a
                      className="catalog-whatsapp"
                      href={inquiryLink(product)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Consultar por ${product.title} en WhatsApp`}
                    ><Icon name="whatsapp" /></a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="catalog-help section-band tone-lavender" aria-labelledby="catalog-help-title">
          <div>
            <p className="eyebrow">LO CONVERSAMOS</p>
            <h2 id="catalog-help-title">¿Qué tenés en mente?</h2>
            <p>Consultanos por presentaciones, precios y disponibilidad. Te ayudamos a elegir para tu próximo encuentro.</p>
          </div>
          <a className="button" href={whatsapp} target="_blank" rel="noopener noreferrer">
            Escribinos por WhatsApp <Icon name="whatsapp" />
          </a>
        </section>
      </main>

      <footer className="footer section-wrap">
        <div className="footer-top">
          <Brand footer href="/#inicio" />
          <p>Un espíritu propio.<br /><span>San Nicolás de los Arroyos, Buenos Aires.</span></p>
          <SocialLinks />
          <a className="text-link" href="/">Volver al inicio <Icon name="arrow" /></a>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Gin La Elisa</span>
          <span>Beber con moderación. Prohibida su venta a menores de 18 años.</span>
        </div>
      </footer>
      <SocialLinks floating />

      <AnimatedDialog
        open={Boolean(selected)}
        contentKey={selected?.id || "closed"}
        onClose={() => setSelected(null)}
      >
        {() => selected && (
          <div className="dialog-content catalog-dialog-content">
            <Photo name={selected.images[photoIndex]} alt={selected.alt} eager sizes="(max-width: 600px) 90vw, 580px" />
            {selected.images.length > 1 && (
              <div className="catalog-photo-options" role="group" aria-label={`Fotos de ${selected.title}`}>
                {selected.images.map((name, index) => (
                  <button
                    key={name}
                    type="button"
                    aria-label={`Ver foto ${index + 1} de ${selected.title}`}
                    aria-pressed={photoIndex === index}
                    onClick={() => setPhotoIndex(index)}
                  ><Photo name={name} alt="" sizes="60px" /></button>
                ))}
              </div>
            )}
            <div className="catalog-dialog-copy">
              <p className="eyebrow">{selected.category} / {selected.tag}</p>
              <h2 id="dialog-title">{selected.title}</h2>
              <p>{selected.description}</p>
              {selected.serving && <p className="catalog-serving">{selected.serving}</p>}
              <a className="button" href={inquiryLink(selected)} target="_blank" rel="noopener noreferrer">
                Consultar por WhatsApp <Icon name="whatsapp" />
              </a>
              <p className="form-note">Consultá precios, presentaciones y disponibilidad.</p>
            </div>
          </div>
        )}
      </AnimatedDialog>
    </>
  );
}
