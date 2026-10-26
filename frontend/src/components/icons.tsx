type IconProps = { name: string };

export function Icon({ name }: IconProps) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (name) {
    case "map":
      return (
        <svg {...common}>
          <path d="M9 4 4 6v14l5-2 6 2 5-2V4l-5 2-6-2Z" />
          <path d="M9 4v14M15 6v14" />
        </svg>
      );
    case "people":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3" />
          <path d="M3.5 19c.6-2.8 2.8-4 5.5-4s4.9 1.2 5.5 4" />
          <circle cx="17" cy="9" r="2.2" />
          <path d="M16.2 15c2.2.2 3.6 1.4 4.3 4" />
        </svg>
      );
    case "flag":
      return (
        <svg {...common}>
          <path d="M6 21V4" />
          <path d="M6 5h11l-2 4 2 4H6" />
        </svg>
      );
    case "doc":
      return (
        <svg {...common}>
          <path d="M7 3h7l5 5v13H7V3Z" />
          <path d="M14 3v5h5M9 13h6M9 17h6" />
        </svg>
      );
    case "news":
      return (
        <svg {...common}>
          <path d="M5 5h11v14H5z" />
          <path d="M16 8h3v11H8" />
          <path d="M8 9h5M8 13h5" />
        </svg>
      );
    case "building":
      return (
        <svg {...common}>
          <path d="M4 20h16M6 20V6l6-2 6 2v14" />
          <path d="M10 10h.01M14 10h.01M10 14h.01M14 14h.01M11 20v-3h2v3" />
        </svg>
      );
    case "cctv":
      return (
        <svg {...common}>
          <path d="M3 8h8l3-3 7 4-3 3H9L3 8Z" />
          <path d="M7 14v3M5 20h6" />
        </svg>
      );
    case "box":
      return (
        <svg {...common}>
          <path d="M3 8 12 4l9 4-9 4-9-4Z" />
          <path d="M3 8v8l9 4 9-4V8M12 12v8" />
        </svg>
      );
    case "sun":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      );
    case "book":
      return (
        <svg {...common}>
          <path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H19v16H7.5A2.5 2.5 0 0 0 5 21.5V5.5Z" />
          <path d="M5 19.5A2.5 2.5 0 0 1 7.5 17H19" />
        </svg>
      );
    case "coin":
      return (
        <svg {...common}>
          <ellipse cx="12" cy="7" rx="7" ry="3" />
          <path d="M5 7v5c0 1.7 3.1 3 7 3s7-1.3 7-3V7" />
          <path d="M5 12v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5" />
        </svg>
      );
    case "heart":
      return (
        <svg {...common}>
          <path d="M12 19s-7-4.4-7-9a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 4.6-7 9-7 9Z" />
        </svg>
      );
    case "leaf":
      return (
        <svg {...common}>
          <path d="M5 19C14 19 19 13 19 5 11 5 5 10 5 19Z" />
          <path d="M8 16c2-2 4-5 7-8" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3 19 6v6c0 4.5-3 7.2-7 9-4-1.8-7-4.5-7-9V6l7-3Z" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
        </svg>
      );
  }
}
