import { downloadFile } from "./downloads";
import { useState } from "react";
import { products, socialChannels } from "./data";
import imageMetadata from "./image-metadata.json";

export function Icon({ name = "arrow", className = "", ...props }) {
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
    whatsapp: (
      <>
        <path d="M20.5 11.7a8.5 8.5 0 0 1-12.6 7.5L3 20.5l1.3-4.8a8.5 8.5 0 1 1 16.2-4Z" />
        <path d="m8.2 7.4 1.2-.1.9 2.2-.9 1a7.1 7.1 0 0 0 3.6 3.6l1-.9 2.2.9-.1 1.2c-.1.9-1 1.5-1.9 1.3a10.7 10.7 0 0 1-7.3-7.3c-.2-.9.4-1.8 1.3-1.9Z" />
      </>
    ),
    instagram: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
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

export function SocialLinks({ floating = false }) {
  return (
    <div
      className={`social-links${floating ? " social-dock" : ""}`}
      role="group"
      aria-label="Redes y contacto de Gin La Elisa"
    >
      {socialChannels.map(({ id, label, href }) => {
        const description = href ? label : `${label} · Próximamente`;
        const content = (
          <>
            <Icon name={id} />
            <span className="social-tooltip" aria-hidden="true">
              {description}
            </span>
          </>
        );
        const className = `social-link social-link--${id}`;

        return href ? (
          <a
            key={id}
            className={className}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={description}
          >
            {content}
          </a>
        ) : (
          <button
            key={id}
            className={className}
            type="button"
            aria-disabled="true"
            aria-label={description}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}

export function Photo({ name, alt, className = "", eager = false, ...props }) {
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
export function Brand({ footer = false }) {
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
export function InquiryForm({ initialService }) {
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
            defaultValue={initialService || "Consulta general"}
          >
            {[
              "Consulta general",
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
