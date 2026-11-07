import { Brand, Icon } from "./components";
import { socialChannels } from "./data";
import "./SiteFooter.css";

export default function SiteFooter({ catalog = false }) {
  const homeLink = (section) => `${catalog ? "/" : ""}#${section}`;
  const whatsapp = socialChannels.find((channel) => channel.id === "whatsapp");
  const links = [
    { label: "Nosotros", href: homeLink("nosotros") },
    { label: "Nuestro gin", href: homeLink("gin") },
    { label: "Productos", href: "/productos/" },
    { label: "Barras y eventos", href: homeLink("barras") },
    { label: "Agenda", href: homeLink("agenda") },
    { label: "Contacto", href: homeLink("contacto") },
  ];

  return (
    <footer className="site-footer">
      <div className="section-wrap">
        <div className="footer-invitation">
          <img className="footer-botanical" src="/images/isologo.png" alt="" width="340" height="340" aria-hidden="true" loading="lazy" />
          <div className="footer-invitation-title">
            <p className="eyebrow">UN ESPÍRITU PROPIO</p>
            <h2>Lo mejor<br /><em>se comparte.</em></h2>
          </div>
          <div className="footer-invitation-copy">
            <p>Una copa, una charla y una buena compañía.<br />Hagamos lugar al próximo encuentro.</p>
            <a className="footer-cta" href={whatsapp.href} target="_blank" rel="noopener noreferrer">
              <span>Hablemos por WhatsApp</span>
              <span className="footer-cta-icon"><Icon name="diagonal" /></span>
            </a>
          </div>
        </div>

        <div className="footer-main">
          <div className="footer-identity">
            <Brand footer href={homeLink("inicio")} />
            <p>Gin artesanal, pequeños lotes y encuentros con un espíritu propio.</p>
            <div className="footer-origin">
              <Icon name="pin" />
              <span>San Nicolás de los Arroyos<br />Buenos Aires, Argentina</span>
            </div>
          </div>

          <nav className="footer-navigation" aria-label="Explorá La Elisa">
            <h3>Explorá La Elisa</h3>
            <ul>
              {links.map(({ label, href }) => (
                <li key={label}><a href={href}>{label}</a></li>
              ))}
            </ul>
          </nav>

          <div className="footer-contact">
            <h3>Sigamos en contacto</h3>
            {socialChannels.map(({ id, label, href }) => (
              <a key={id} className={`footer-channel footer-channel--${id}`} href={href} target="_blank" rel="noopener noreferrer">
                <span className="footer-channel-icon"><Icon name={id} /></span>
                <span>
                  <span className="footer-channel-label">{label}</span>
                  <span className="footer-channel-value">{id === "whatsapp" ? "+54 9 3364 31-2425" : "@ginlaelisa"}</span>
                </span>
                <Icon name="diagonal" className="footer-channel-arrow" />
              </a>
            ))}
          </div>
        </div>

        <div className="footer-legal">
          <p>© {new Date().getFullYear()} Gin La Elisa<span>Todos los derechos reservados.</span></p>
          <p className="footer-responsibility">Beber con moderación.<br />Prohibida su venta a menores de 18 años.</p>
          {!catalog && <span className="footer-preview">Sitio de muestra</span>}
          <a className="footer-back-top" href="#inicio">Volver arriba <Icon name="arrow" /></a>
        </div>
      </div>
    </footer>
  );
}
