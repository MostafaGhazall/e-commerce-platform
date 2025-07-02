import { PrismaClient } from "../src/generated/client";

const prisma = new PrismaClient();

const Products = [
  {
    name: "Classic Tee",
    slug: "classic-tee",
    price: 620,
    description:
      "Embrace the beauty of simplicity and let your confidence shine through.",
    images: ["/assets/tee1.jpg", "/assets/tee2.jpg", "/assets/tee3.jpg"],
    stock: 10,
    category: "clothing",
    sizes: ["M", "L", "XL", "XXL", "XXXL"],
    colors: [
      { name: "Dark Green", value: "#006400", images: ["/assets/tee1.jpg"] },
      { name: "White", value: "#ffffff", images: ["/assets/tee3.jpg"] },
      { name: "Black", value: "#000000", images: ["/assets/tee2.jpg"] },
    ],
  },
  {
    name: "Eco Bottle",
    slug: "eco-bottle",
    price: 150,
    description: "Reusable water bottle made from eco-friendly materials.",
    images: ["/assets/bottle.jpg"],
    stock: 20,
    category: "accessories",
    sizes: [],
    colors: [],
  },
  {
    name: "Modern Sofa Set",
    slug: "modern-sofa-set",
    price: 5200,
    description:
      "Spacious and stylish L-shaped sofa perfect for relaxing or entertaining guests.",
    images: ["/assets/sofa1.jpg", "/assets/sofa2.jpg", "/assets/sofa3.jpg"],
    stock: 5,
    category: "furniture",
    sizes: [],
    colors: [
      {
        name: "Beige",
        value: "#f5f5dc",
        images: ["/assets/sofa1.jpg", "/assets/sofa2.jpg", "/assets/sofa3.jpg"],
      },
    ],
  },
  {
    name: "Galaxy Nova X5 Smartphone",
    slug: "galaxy-nova-x5-smartphone",
    price: 8900,
    description:
      "Powerful smartphone with cutting-edge camera and long battery life.",
    images: ["/assets/phone1.jpg", "/assets/phone2.jpg"],
    stock: 15,
    category: "electronics",
    sizes: [],
    colors: [
      {
        name: "Midnight Black",
        value: "#000000",
        images: ["/assets/phone1.jpg"],
      },
      { name: "Ocean Blue", value: "#0077be", images: ["/assets/phone2.jpg"] },
    ],
  },
];

async function main() {
  for (const product of Products) {
    const exists = await prisma.product.findUnique({
      where: { slug: product.slug },
    });

    if (exists) {
      console.log(`⏩ Skipping existing product: ${product.name}`);
      continue;
    }

    await prisma.product.create({
      data: {
        name: product.name,
        slug: product.slug,
        price: product.price,
        description: product.description,
        stock: product.stock,
        category: product.category,
        sizes: product.sizes,
        images: {
          create: product.images.map((url) => ({ url })),
        },
        colors: {
          create: product.colors.map((color) => ({
            name: color.name,
            value: color.value,
            images: {
              create: color.images.map((url) => ({ url })),
            },
          })),
        },
      },
    });

    console.log(`✅ Seeded product: ${product.name}`);
  }
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
