export const homeConfig = {
  hero: {
    mediaType: "image" as "image" | "video",
    src: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop",
    title: "NUEVA COLECCIÓN",
    subtitle: "Descubre las tendencias que definen esta temporada.",
    ctaText: "VER COLECCIÓN",
    ctaLink: "/category/new-arrivals",
    overlayOpacity: 0.2,
  },
  featuredCollections: [
    {
      title: "Camisetas",
      src: "https://res.cloudinary.com/dhxbew6q2/image/upload/f_auto,c_limit,w_1920,q_auto/v1768677029/IMG_0491_ujzj7s.jpg",
      link: "/category/urban",
      size: "large",
      objectPosition: "center",
    },
    {
      title: "Chaquetas",
      src: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop",
      link: "/category/jackets",
      size: "small",
      objectPosition: "center",
    },
    {
      title: "Denim",
      src: "https://images.unsplash.com/photo-1722625957003-4f1f1f6942e3?w=1080&auto=format&fit=crop&q=80&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OTB8fGRlbmltfGVufDB8fDB8fHww",
      link: "/category/denim",
      size: "small",
      objectPosition: "center",
    },
    {
      title: "Denim",
      src: "https://res.cloudinary.com/dhxbew6q2/image/upload/f_auto,c_limit,w_1200,q_auto/v1769867466/2_clothing_qwaocz.webp",
      link: "/category/denim",
      size: "small",
      objectPosition: "center",
    },
  ],
  saleBanner: {
    title: "REBAJAS",
    subtitle: "Hasta",
    subtitle2: "-50%",
    subtitle3: "Valido en artículos seleccionados hasta el 31/02/2026.",
    ctaText: "VER REBAJAS",
    ctaLink: "/category/sale",
    backgroundColor: "#171717",
    backgroundImage:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop",
  },
  productCarousel: {
    title: "TE PODRIA INTERESAR",
    subtitle: "Nuestras recomendaciones personalizadas para ti.",
  },
};
