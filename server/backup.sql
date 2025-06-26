--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Cart; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Cart" (
    id text NOT NULL,
    "userId" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Cart" OWNER TO postgres;

--
-- Name: CartItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CartItem" (
    id text NOT NULL,
    "cartId" text NOT NULL,
    "productId" text NOT NULL,
    quantity integer NOT NULL,
    size text,
    color text,
    "colorName" text
);


ALTER TABLE public."CartItem" OWNER TO postgres;

--
-- Name: Color; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Color" (
    id text NOT NULL,
    name text NOT NULL,
    value text NOT NULL,
    images text[],
    "productId" text NOT NULL
);


ALTER TABLE public."Color" OWNER TO postgres;

--
-- Name: Image; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Image" (
    id text NOT NULL,
    url text NOT NULL,
    "productId" text NOT NULL
);


ALTER TABLE public."Image" OWNER TO postgres;

--
-- Name: Order; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Order" (
    id text NOT NULL,
    "userId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    total double precision NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    "paymentMethod" text NOT NULL,
    address text NOT NULL,
    city text NOT NULL,
    country text NOT NULL,
    email text NOT NULL,
    name text NOT NULL,
    phone text NOT NULL,
    "postalCode" text NOT NULL,
    region text NOT NULL
);


ALTER TABLE public."Order" OWNER TO postgres;

--
-- Name: OrderItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."OrderItem" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "productId" text NOT NULL,
    quantity integer NOT NULL,
    price double precision NOT NULL,
    size text,
    color text,
    "colorName" text,
    "imageUrl" text
);


ALTER TABLE public."OrderItem" OWNER TO postgres;

--
-- Name: Product; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Product" (
    id text NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    price double precision NOT NULL,
    category text NOT NULL,
    rating double precision DEFAULT 0 NOT NULL,
    sizes text[],
    stock integer NOT NULL,
    slug text NOT NULL
);


ALTER TABLE public."Product" OWNER TO postgres;

--
-- Name: Review; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Review" (
    id text NOT NULL,
    comment text NOT NULL,
    name text NOT NULL,
    rating integer NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "productId" text NOT NULL
);


ALTER TABLE public."Review" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id integer NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    address text,
    birthday timestamp(3) without time zone,
    city text,
    country text,
    "firstName" text,
    gender text,
    "lastName" text,
    phone text,
    postalcode text,
    region text
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: User_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."User_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."User_id_seq" OWNER TO postgres;

--
-- Name: User_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."User_id_seq" OWNED BY public."User".id;


--
-- Name: Wishlist; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Wishlist" (
    id text NOT NULL,
    "userId" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Wishlist" OWNER TO postgres;

--
-- Name: WishlistItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."WishlistItem" (
    id text NOT NULL,
    "wishlistId" text NOT NULL,
    "productId" text NOT NULL
);


ALTER TABLE public."WishlistItem" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: User id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);


--
-- Data for Name: Cart; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Cart" (id, "userId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: CartItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CartItem" (id, "cartId", "productId", quantity, size, color, "colorName") FROM stdin;
\.


--
-- Data for Name: Color; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Color" (id, name, value, images, "productId") FROM stdin;
cmc7wz0un0004u8hsb6x4o97t	Dark Green	#006400	{/assets/tee1.jpg}	cmc7wz0um0000u8hsb960ad3b
cmc7wz0un0005u8hsuvknb9wo	White	#ffffff	{/assets/tee3.jpg}	cmc7wz0um0000u8hsb960ad3b
cmc7wz0un0006u8hsti9w8i0i	Black	#000000	{/assets/tee2.jpg}	cmc7wz0um0000u8hsb960ad3b
cmc7wz0vc000du8hs1lbc2kex	Beige	#f5f5dc	{/assets/sofa1.jpg,/assets/sofa2.jpg,/assets/sofa3.jpg}	cmc7wz0vc0009u8hsaajiq9eq
cmc7wz0vh000hu8hsh4oicaua	Midnight Black	#000000	{/assets/phone1.jpg}	cmc7wz0vh000eu8hsw6hiboxm
cmc7wz0vh000iu8hsnbri4b17	Ocean Blue	#0077be	{/assets/phone2.jpg}	cmc7wz0vh000eu8hsw6hiboxm
\.


--
-- Data for Name: Image; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Image" (id, url, "productId") FROM stdin;
cmc7wz0un0001u8hsp5f8y8kl	/assets/tee1.jpg	cmc7wz0um0000u8hsb960ad3b
cmc7wz0un0002u8hshajm65te	/assets/tee2.jpg	cmc7wz0um0000u8hsb960ad3b
cmc7wz0un0003u8hsmci6bcmm	/assets/tee3.jpg	cmc7wz0um0000u8hsb960ad3b
cmc7wz0v80008u8hs6j9d5rcq	/assets/bottle.jpg	cmc7wz0v80007u8hsk1eecqmt
cmc7wz0vc000au8hsq3zbpzp7	/assets/sofa1.jpg	cmc7wz0vc0009u8hsaajiq9eq
cmc7wz0vc000bu8hsq15xpca6	/assets/sofa2.jpg	cmc7wz0vc0009u8hsaajiq9eq
cmc7wz0vc000cu8hsmnizbky2	/assets/sofa3.jpg	cmc7wz0vc0009u8hsaajiq9eq
cmc7wz0vh000fu8hsmcoa28gt	/assets/phone1.jpg	cmc7wz0vh000eu8hsw6hiboxm
cmc7wz0vh000gu8hsnksqmsft	/assets/phone2.jpg	cmc7wz0vh000eu8hsw6hiboxm
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Order" (id, "userId", "createdAt", total, status, "paymentMethod", address, city, country, email, name, phone, "postalCode", region) FROM stdin;
\.


--
-- Data for Name: OrderItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."OrderItem" (id, "orderId", "productId", quantity, price, size, color, "colorName", "imageUrl") FROM stdin;
\.


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Product" (id, name, description, price, category, rating, sizes, stock, slug) FROM stdin;
cmc7wz0um0000u8hsb960ad3b	Classic Tee	Embrace the beauty of simplicity and let your confidence shine through.	620	clothing	0	{M,L,XL,XXL,XXXL}	10	classic-tee
cmc7wz0v80007u8hsk1eecqmt	Eco Bottle	Reusable water bottle made from eco-friendly materials.	150	accessories	0	{}	20	eco-bottle
cmc7wz0vc0009u8hsaajiq9eq	Modern Sofa Set	Spacious and stylish L-shaped sofa perfect for relaxing or entertaining guests in your living room.	5200	furniture	0	{}	5	modern-sofa-set
cmc7wz0vh000eu8hsw6hiboxm	Galaxy Nova X5 Smartphone	Powerful smartphone with cutting-edge camera and long battery life—your perfect tech companion.	8900	electronics	0	{}	15	galaxy-nova-x5-smartphone
\.


--
-- Data for Name: Review; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Review" (id, comment, name, rating, date, "productId") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, name, email, password, "createdAt", "updatedAt", address, birthday, city, country, "firstName", gender, "lastName", phone, postalcode, region) FROM stdin;
\.


--
-- Data for Name: Wishlist; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Wishlist" (id, "userId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: WishlistItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."WishlistItem" (id, "wishlistId", "productId") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
095ac124-2ba1-4491-b3c6-22779546e587	2960d062785dbd07f40b18307f678a4b10c5cd43b4a138c384d08001b0ec4912	2025-06-22 19:16:48.976568+03	20250615161510_add_products	\N	\N	2025-06-22 19:16:48.960646+03	1
b9d89606-ca32-4cac-b27e-6824f2b84776	ccb508dbf8b674de62a6a8f8b31d84a437ddf82bd85272bcfb37ce082d763d44	2025-06-22 19:16:49.00516+03	20250615165541_add_product_nested_fields	\N	\N	2025-06-22 19:16:48.977623+03	1
9b621cbd-5b4c-49df-ba76-997454c69705	9f5795ea4ee0fd772b998a527c0eb5e00a0fb25f4b490995d5b9ecfc3822747a	2025-06-22 19:16:49.008174+03	20250616153038_add_email_verification	\N	\N	2025-06-22 19:16:49.005804+03	1
c6c2f107-ce62-4aed-8e0c-8c63f1b6f8b4	4cf3b4c6bec720189deff56afd2b2344c6703d013ebbf0eeef6cb76ba02ba128	2025-06-22 19:16:49.013599+03	20250616170724_add_slug_to_product	\N	\N	2025-06-22 19:16:49.008726+03	1
240794e6-1e91-4c53-81a3-0d7def2dd775	88bd18f8d714813621a6abb4b04910a47e2f3fabbdca5471115cc6a93810ad60	2025-06-22 19:16:49.033434+03	20250616183657_add_size_and_color_to_cart	\N	\N	2025-06-22 19:16:49.014276+03	1
5e6273d5-6d9c-4f1e-b880-56554b9d2b84	dc517a9656da18f22d6af02eb60917f02f96233b71a965e5f3e33656a205f90c	2025-06-22 19:16:49.0488+03	20250617184805_add_wishlist	\N	\N	2025-06-22 19:16:49.034137+03	1
8dd43305-b1a2-4f40-8a08-f7ad8003908f	da4f485eb34de97902244231ed2bde4a52986bd135bfbe6094320d4813826839	2025-06-22 19:16:49.06369+03	20250617195621_add_order_history	\N	\N	2025-06-22 19:16:49.049335+03	1
cab55969-8973-4f26-80b7-b6397b5d542c	fb8df1018e54b2aa345fa8962b4a019b875fe4fc6f7d9ed24fbe6aba62cb0d1a	2025-06-22 19:16:49.066629+03	20250617235721_add_user_profile_fields	\N	\N	2025-06-22 19:16:49.064313+03	1
19441a2f-2813-425c-a92d-20a3204cb5ac	b0dfd3e23b0c94f5fc873c666802c331d1a9c6453522ddc9825cc0148342fb12	2025-06-22 19:16:49.07039+03	20250618042841_add_payment_method_to_order	\N	\N	2025-06-22 19:16:49.067153+03	1
a693fe00-1c05-44bc-9353-23075950b96d	463584431720a79c1c19692de31af17c6f815c82412724bb96dab953e658d7d1	2025-06-22 19:16:49.073877+03	20250618044637_add_shipping_fields_to_order	\N	\N	2025-06-22 19:16:49.071282+03	1
cd2ed0b1-74f6-4c52-a9a2-21cfb2a4b30d	39a09ea4c1cf5596a71bf4580cfa0cc813fb88d789fcfb80cc68ab57193563a5	2025-06-22 19:16:49.078329+03	20250622152132_add_color_relation_to_orderitem	\N	\N	2025-06-22 19:16:49.074412+03	1
3e00f85d-8d40-47b8-af40-c8ad01f07915	5bfe44f06bcfce017352a0deb27ac6a66d6fe4320a10de8bc4d304f85decc90a	2025-06-22 19:16:49.081482+03	20250622153927_add_color_id_to_cartitem	\N	\N	2025-06-22 19:16:49.079271+03	1
069ca125-842d-4423-9bc1-73ca39bdc609	e2b57e1ee3d1322c2ae2de5dc5abca5e7a1cf5d40229a01851edba4e878d8479	2025-06-22 19:37:09.084708+03	20250622163709_add_image_url_to_order_item	\N	\N	2025-06-22 19:37:09.080299+03	1
\.


--
-- Name: User_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."User_id_seq"', 1, false);


--
-- Name: CartItem CartItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_pkey" PRIMARY KEY (id);


--
-- Name: Cart Cart_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Cart"
    ADD CONSTRAINT "Cart_pkey" PRIMARY KEY (id);


--
-- Name: Color Color_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Color"
    ADD CONSTRAINT "Color_pkey" PRIMARY KEY (id);


--
-- Name: Image Image_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Image"
    ADD CONSTRAINT "Image_pkey" PRIMARY KEY (id);


--
-- Name: OrderItem OrderItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY (id);


--
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- Name: Review Review_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: WishlistItem WishlistItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WishlistItem"
    ADD CONSTRAINT "WishlistItem_pkey" PRIMARY KEY (id);


--
-- Name: Wishlist Wishlist_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Wishlist"
    ADD CONSTRAINT "Wishlist_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: CartItem_cartId_productId_size_color_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "CartItem_cartId_productId_size_color_key" ON public."CartItem" USING btree ("cartId", "productId", size, color);


--
-- Name: Cart_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Cart_userId_key" ON public."Cart" USING btree ("userId");


--
-- Name: Product_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Product_slug_key" ON public."Product" USING btree (slug);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: WishlistItem_wishlistId_productId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "WishlistItem_wishlistId_productId_key" ON public."WishlistItem" USING btree ("wishlistId", "productId");


--
-- Name: Wishlist_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Wishlist_userId_key" ON public."Wishlist" USING btree ("userId");


--
-- Name: CartItem CartItem_cartId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES public."Cart"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CartItem CartItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Cart Cart_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Cart"
    ADD CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Color Color_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Color"
    ADD CONSTRAINT "Color_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Image Image_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Image"
    ADD CONSTRAINT "Image_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderItem OrderItem_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderItem OrderItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Order Order_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Review Review_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: WishlistItem WishlistItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WishlistItem"
    ADD CONSTRAINT "WishlistItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: WishlistItem WishlistItem_wishlistId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WishlistItem"
    ADD CONSTRAINT "WishlistItem_wishlistId_fkey" FOREIGN KEY ("wishlistId") REFERENCES public."Wishlist"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Wishlist Wishlist_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Wishlist"
    ADD CONSTRAINT "Wishlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

