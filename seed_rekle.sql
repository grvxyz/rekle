--
-- PostgreSQL database dump
--

\restrict xlBNCSxbieHhXT8HNpvjvesbcRH59lBS4Au2MclyHveH3BnMC1qihrlKvXoH946

-- Dumped from database version 15.17 (Debian 15.17-1.pgdg13+1)
-- Dumped by pg_dump version 15.17 (Debian 15.17-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: actions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.actions (
    user_id integer NOT NULL,
    prediction_id integer,
    action_type character varying(100) NOT NULL,
    partner_name character varying(200),
    notes text,
    points_earned integer NOT NULL,
    status character varying(50) NOT NULL,
    id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    route character varying(50),
    proof_image_path character varying(500),
    balance_earned integer DEFAULT 0 NOT NULL,
    verified_by integer,
    verified_at timestamp with time zone,
    rejection_reason text
);


ALTER TABLE public.actions OWNER TO postgres;

--
-- Name: actions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.actions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.actions_id_seq OWNER TO postgres;

--
-- Name: actions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.actions_id_seq OWNED BY public.actions.id;


--
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


ALTER TABLE public.alembic_version OWNER TO postgres;

--
-- Name: badges; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.badges (
    name character varying(100) NOT NULL,
    description text,
    icon_url character varying(255),
    badge_type character varying(50) NOT NULL,
    requirement_count integer NOT NULL,
    is_active boolean NOT NULL,
    id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.badges OWNER TO postgres;

--
-- Name: badges_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.badges_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.badges_id_seq OWNER TO postgres;

--
-- Name: badges_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.badges_id_seq OWNED BY public.badges.id;


--
-- Name: contents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contents (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    type character varying(50) NOT NULL,
    status character varying(50) DEFAULT 'draft'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.contents OWNER TO postgres;

--
-- Name: contents_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.contents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.contents_id_seq OWNER TO postgres;

--
-- Name: contents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.contents_id_seq OWNED BY public.contents.id;


--
-- Name: mitras; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mitras (
    id integer NOT NULL,
    name character varying(200) NOT NULL,
    description text,
    phone character varying(50),
    email character varying(255),
    website character varying(500),
    address text,
    city character varying(100),
    latitude double precision,
    longitude double precision,
    accepted_waste text,
    mitra_type character varying(50) DEFAULT 'bank_sampah'::character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id integer,
    status character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    rejection_reason text,
    verified_by integer,
    verified_at timestamp without time zone
);


ALTER TABLE public.mitras OWNER TO postgres;

--
-- Name: mitras_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mitras_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.mitras_id_seq OWNER TO postgres;

--
-- Name: mitras_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mitras_id_seq OWNED BY public.mitras.id;


--
-- Name: predictions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.predictions (
    user_id integer NOT NULL,
    result character varying(100) NOT NULL,
    confidence double precision,
    image_path character varying(500),
    raw_output text,
    recommendation character varying(100),
    is_confident boolean NOT NULL,
    id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.predictions OWNER TO postgres;

--
-- Name: predictions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.predictions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.predictions_id_seq OWNER TO postgres;

--
-- Name: predictions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.predictions_id_seq OWNED BY public.predictions.id;


--
-- Name: user_badges; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_badges (
    user_id integer NOT NULL,
    badge_id integer NOT NULL,
    id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_badges OWNER TO postgres;

--
-- Name: user_badges_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_badges_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_badges_id_seq OWNER TO postgres;

--
-- Name: user_badges_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_badges_id_seq OWNED BY public.user_badges.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    email character varying(255) NOT NULL,
    full_name character varying(150),
    phone_number character varying(20),
    hashed_password character varying(255) NOT NULL,
    is_active boolean NOT NULL,
    is_superuser boolean NOT NULL,
    total_points integer NOT NULL,
    scan_count integer NOT NULL,
    action_count integer NOT NULL,
    avatar_url character varying(500),
    city character varying,
    bio text,
    id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    balance integer DEFAULT 0 NOT NULL,
    role character varying(20) DEFAULT 'user'::character varying NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: actions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.actions ALTER COLUMN id SET DEFAULT nextval('public.actions_id_seq'::regclass);


--
-- Name: badges id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.badges ALTER COLUMN id SET DEFAULT nextval('public.badges_id_seq'::regclass);


--
-- Name: contents id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contents ALTER COLUMN id SET DEFAULT nextval('public.contents_id_seq'::regclass);


--
-- Name: mitras id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mitras ALTER COLUMN id SET DEFAULT nextval('public.mitras_id_seq'::regclass);


--
-- Name: predictions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.predictions ALTER COLUMN id SET DEFAULT nextval('public.predictions_id_seq'::regclass);


--
-- Name: user_badges id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_badges ALTER COLUMN id SET DEFAULT nextval('public.user_badges_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: actions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.actions (user_id, prediction_id, action_type, partner_name, notes, points_earned, status, id, created_at, updated_at, route, proof_image_path, balance_earned, verified_by, verified_at, rejection_reason) FROM stdin;
\.


--
-- Data for Name: alembic_version; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.alembic_version (version_num) FROM stdin;
f842e74697bc
\.


--
-- Data for Name: badges; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.badges (name, description, icon_url, badge_type, requirement_count, is_active, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: contents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contents (id, title, description, type, status, created_at, updated_at) FROM stdin;
1	tes aja	snacoj	challenge	published	2026-05-18 14:23:47.2006+00	2026-05-18 14:23:47.200684+00
\.


--
-- Data for Name: mitras; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mitras (id, name, description, phone, email, website, address, city, latitude, longitude, accepted_waste, mitra_type, is_active, created_at, updated_at, user_id, status, rejection_reason, verified_by, verified_at) FROM stdin;
1	bank sampahku	iahoife	08273648923	radityanaufal2005@students.amikom.ac.id	ufequofueqog	Jl. Raya Piyungan - Prambanan No.Km. 4.5, Majesem, Madurejo, Kec. Prambanan, Kabupaten Sleman, Daerah Istimewa Yogyakarta 55572	Sleman	\N	\N	organik,plastik_pet	bank_sampah	t	2026-05-18 11:01:11.433305+00	2026-05-18 11:01:11.433305+00	\N	pending	\N	\N	\N
2	Bank Sampah Josjis	bank sampah untuk memenuhi kebutuhan	0812239302	scenecraft73@gmail.com	\N	jl efiphcvjods	Yogyakarta	394083	83145	plastik_pet,plastik_campuran,plastik_hdpe	bank_sampah	t	2026-05-19 02:46:51.982957+00	2026-05-19 02:46:51.982957+00	6	pending	\N	\N	\N
3	Bank emon	jckalljcab	081239293	scenecraft71@gmail.com	\N	hbcdcdkjbca	sleman	99302	29300	kertas_kotor,kertas_bersih,kaca_utuh	daur_ulang	t	2026-05-19 06:08:53.500153+00	2026-05-19 06:08:53.500153+00	7	pending	\N	\N	\N
\.


--
-- Data for Name: predictions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.predictions (user_id, result, confidence, image_path, raw_output, recommendation, is_confident, id, created_at, updated_at) FROM stdin;
2	kertas_kotor	0.7247	uploads/df0f2cace409412d84fba63458852863.jpeg	{'organik': 0.0032, 'plastik_pet': 0.0001, 'plastik_hdpe': 0.0206, 'plastik_campuran': 0.2374, 'kertas_bersih': 0.0019, 'kertas_kotor': 0.7247, 'kaca_utuh': 0.0119, 'kaca_pecah': 0.0}	tidak_layak	t	1	2026-05-19 05:17:43.935606+00	2026-05-19 05:17:43.935606+00
2	Tidak dikenali	0.4519	uploads/b036f483724041e2a8fc9a5356d110ed.jpeg	{'organik': 0.4351, 'plastik_pet': 0.0054, 'plastik_hdpe': 0.002, 'plastik_campuran': 0.0353, 'kertas_bersih': 0.0182, 'kertas_kotor': 0.0324, 'kaca_utuh': 0.0197, 'kaca_pecah': 0.4519}	\N	f	2	2026-05-19 05:21:02.318334+00	2026-05-19 05:21:02.318334+00
2	kertas_kotor	0.7247	uploads/8e7330facd5b4c2a952029109e421169.jpeg	{'organik': 0.0032, 'plastik_pet': 0.0001, 'plastik_hdpe': 0.0206, 'plastik_campuran': 0.2374, 'kertas_bersih': 0.0019, 'kertas_kotor': 0.7247, 'kaca_utuh': 0.0119, 'kaca_pecah': 0.0}	tidak_layak	t	3	2026-05-19 06:00:22.889863+00	2026-05-19 06:00:22.889863+00
2	kaca_utuh	0.993	uploads/924c19ad4cc54493a1451d9ffc9b67d8.jpeg	{'organik': 0.001, 'plastik_pet': 0.0028, 'plastik_hdpe': 0.0, 'plastik_campuran': 0.0, 'kertas_bersih': 0.0029, 'kertas_kotor': 0.0004, 'kaca_utuh': 0.993, 'kaca_pecah': 0.0}	reuse	t	4	2026-05-19 06:05:44.777181+00	2026-05-19 06:05:44.777181+00
2	kertas_kotor	0.7247	uploads/d92183731d05440594c78c0b30d31736.jpeg	{'organik': 0.0032, 'plastik_pet': 0.0001, 'plastik_hdpe': 0.0206, 'plastik_campuran': 0.2374, 'kertas_bersih': 0.0019, 'kertas_kotor': 0.7247, 'kaca_utuh': 0.0119, 'kaca_pecah': 0.0}	tidak_layak	t	5	2026-05-19 07:55:34.858692+00	2026-05-19 07:55:34.858692+00
2	kaca_utuh	0.993	uploads/2443748a5487472698520e999440156c.jpeg	{'organik': 0.001, 'plastik_pet': 0.0028, 'plastik_hdpe': 0.0, 'plastik_campuran': 0.0, 'kertas_bersih': 0.0029, 'kertas_kotor': 0.0004, 'kaca_utuh': 0.993, 'kaca_pecah': 0.0}	reuse	t	6	2026-05-19 08:01:47.119545+00	2026-05-19 08:01:47.119545+00
2	kaca_utuh	0.993	uploads/96b29851d6a84d76a40fd7abf441de00.jpeg	{'organik': 0.001, 'plastik_pet': 0.0028, 'plastik_hdpe': 0.0, 'plastik_campuran': 0.0, 'kertas_bersih': 0.0029, 'kertas_kotor': 0.0004, 'kaca_utuh': 0.993, 'kaca_pecah': 0.0}	reuse	t	7	2026-05-19 08:12:14.398393+00	2026-05-19 08:12:14.398393+00
2	plastik_campuran	0.9992	uploads/b79acdcffe76435eb11300e7d722ff17.png	{'organik': 0.0, 'plastik_pet': 0.0, 'plastik_hdpe': 0.0002, 'plastik_campuran': 0.9992, 'kertas_bersih': 0.0, 'kertas_kotor': 0.0, 'kaca_utuh': 0.0005, 'kaca_pecah': 0.0}	eco_brick	t	8	2026-05-19 08:24:24.298881+00	2026-05-19 08:24:24.298881+00
2	kaca_utuh	0.9854	uploads/af9e489cb3ae4b4e98ddab31b84ed22b.jpeg	{'organik': 0.0086, 'plastik_pet': 0.0001, 'plastik_hdpe': 0.0, 'plastik_campuran': 0.0, 'kertas_bersih': 0.0057, 'kertas_kotor': 0.0002, 'kaca_utuh': 0.9854, 'kaca_pecah': 0.0}	reuse	t	9	2026-05-19 08:26:31.858184+00	2026-05-19 08:26:31.858184+00
2	kaca_utuh	0.9854	uploads/1d02346089c84bada8877a65ecb18048.jpeg	{'organik': 0.0086, 'plastik_pet': 0.0001, 'plastik_hdpe': 0.0, 'plastik_campuran': 0.0, 'kertas_bersih': 0.0057, 'kertas_kotor': 0.0002, 'kaca_utuh': 0.9854, 'kaca_pecah': 0.0}	reuse	t	10	2026-05-19 09:00:46.187772+00	2026-05-19 09:00:46.187772+00
2	kertas_kotor	0.7247	uploads/8b693670c8bb45ec9d57b42917995891.jpeg	{'organik': 0.0032, 'plastik_pet': 0.0001, 'plastik_hdpe': 0.0206, 'plastik_campuran': 0.2374, 'kertas_bersih': 0.0019, 'kertas_kotor': 0.7247, 'kaca_utuh': 0.0119, 'kaca_pecah': 0.0}	tidak_layak	t	11	2026-05-19 09:09:55.127857+00	2026-05-19 09:09:55.127857+00
2	kaca_utuh	0.8393	uploads/f661be6c89e8454c92c3fab95b9302ad.jpeg	{'organik': 0.0, 'plastik_pet': 0.1605, 'plastik_hdpe': 0.0, 'plastik_campuran': 0.0, 'kertas_bersih': 0.0001, 'kertas_kotor': 0.0001, 'kaca_utuh': 0.8393, 'kaca_pecah': 0.0}	reuse	t	12	2026-05-19 09:26:23.80832+00	2026-05-19 09:26:23.80832+00
2	kertas_kotor	0.8099	uploads/35dbf7eb8b3142b98206f87fea9d96be.jpeg	{'organik': 0.0001, 'plastik_pet': 0.0001, 'plastik_hdpe': 0.0, 'plastik_campuran': 0.0264, 'kertas_bersih': 0.0003, 'kertas_kotor': 0.8099, 'kaca_utuh': 0.0, 'kaca_pecah': 0.1633}	tidak_layak	t	13	2026-05-19 17:06:41.241629+00	2026-05-19 17:06:41.241629+00
2	Tidak dikenali	0.5129	uploads/0e75f5d04d734f0ea9b0c5feb0a0b801.png	{'organik': 0.0015, 'plastik_pet': 0.0001, 'plastik_hdpe': 0.0001, 'plastik_campuran': 0.0158, 'kertas_bersih': 0.0014, 'kertas_kotor': 0.4676, 'kaca_utuh': 0.0008, 'kaca_pecah': 0.5129}	\N	f	14	2026-05-19 17:07:33.574733+00	2026-05-19 17:07:33.574733+00
\.


--
-- Data for Name: user_badges; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_badges (user_id, badge_id, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (email, full_name, phone_number, hashed_password, is_active, is_superuser, total_points, scan_count, action_count, avatar_url, city, bio, id, created_at, updated_at, balance, role) FROM stdin;
radityanaufal2005@gmail.com	Raditya Naufal	081228450028	$2b$12$ar5LATQVjiLxyKK0T07X5uxSBB.jHQWCa3mrFbqiRMbrSED0Opxrq	t	t	120	15	7	\N	jogja	Mahasiswa	1	2026-05-11 06:42:06.334161+00	2026-05-11 06:42:06.334161+00	0	user
admin@rekle.com	Admin Rekle	\N	$2b$12$soKqODmaOADqvxJgog58m.FbUU1gAPHaiLDGkyhKRH.mnEe0965CC	t	t	0	0	0	\N	\N	\N	3	2026-05-18 08:50:32.974646+00	2026-05-18 08:50:32.974646+00	0	user
user@rekle.com	User Rekle	\N	$2b$12$CUJ5mb0xa4zsQpiyRvBpB.Vv43vVSnGw0uEQRzoBztjxjB92NcMva	t	f	0	0	0	\N	\N	\N	4	2026-05-18 08:50:32.974646+00	2026-05-18 08:50:32.974646+00	0	user
rads@mitra.com	Raditya N	\N	$2b$12$LVyBvKC7R5iWr4Ib9REDXuAAYl1orFwir0IFFhgwQFM1A7QIcZzci	t	f	0	0	0	\N	\N	\N	5	2026-05-19 01:40:59.841169+00	2026-05-19 01:40:59.841169+00	0	user
scenecraft73@gmail.com	Raditya Naufal	\N	$2b$12$L6.VoZYwGz2JcMXo0gCj1OCsKLxL4Fsr0PZM9MRLSAZWSvT0mAwrW	t	f	0	0	0	\N	\N	\N	6	2026-05-19 02:46:51.353036+00	2026-05-19 02:46:51.353036+00	0	user
scenecraft71@gmail.com	Vivi 	\N	$2b$12$RckHveJqDysjMAGsGdDHo.c9hsCfLgNOCNWSZjqxVmdB8jVt0RWQK	t	f	0	0	0	\N	\N	\N	7	2026-05-19 06:08:52.878202+00	2026-05-19 06:08:52.878202+00	0	user
jenbut123@gmail.com	jen	098276372829	$2b$12$9LQq26Inzsp3dHoQCHmex..iKoLy1gy1ppFRpPZ2d9G5iQp4qlg5W	t	f	140	14	0	\N	jogja	mahasiswa	2	2026-05-11 09:42:09.621708+00	2026-05-19 17:07:33.862969+00	0	user
\.


--
-- Name: actions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.actions_id_seq', 1, false);


--
-- Name: badges_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.badges_id_seq', 1, false);


--
-- Name: contents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.contents_id_seq', 1, true);


--
-- Name: mitras_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.mitras_id_seq', 3, true);


--
-- Name: predictions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.predictions_id_seq', 14, true);


--
-- Name: user_badges_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_badges_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 7, true);


--
-- Name: actions actions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.actions
    ADD CONSTRAINT actions_pkey PRIMARY KEY (id);


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: badges badges_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.badges
    ADD CONSTRAINT badges_name_key UNIQUE (name);


--
-- Name: badges badges_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.badges
    ADD CONSTRAINT badges_pkey PRIMARY KEY (id);


--
-- Name: contents contents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contents
    ADD CONSTRAINT contents_pkey PRIMARY KEY (id);


--
-- Name: mitras mitras_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mitras
    ADD CONSTRAINT mitras_pkey PRIMARY KEY (id);


--
-- Name: predictions predictions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.predictions
    ADD CONSTRAINT predictions_pkey PRIMARY KEY (id);


--
-- Name: user_badges user_badges_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_badges
    ADD CONSTRAINT user_badges_pkey PRIMARY KEY (id);


--
-- Name: user_badges user_badges_user_id_badge_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_badges
    ADD CONSTRAINT user_badges_user_id_badge_id_key UNIQUE (user_id, badge_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: ix_actions_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_actions_id ON public.actions USING btree (id);


--
-- Name: ix_actions_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_actions_user_id ON public.actions USING btree (user_id);


--
-- Name: ix_badges_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_badges_id ON public.badges USING btree (id);


--
-- Name: ix_mitras_city; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_mitras_city ON public.mitras USING btree (city);


--
-- Name: ix_mitras_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_mitras_id ON public.mitras USING btree (id);


--
-- Name: ix_predictions_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_predictions_id ON public.predictions USING btree (id);


--
-- Name: ix_predictions_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_predictions_user_id ON public.predictions USING btree (user_id);


--
-- Name: ix_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_users_email ON public.users USING btree (email);


--
-- Name: ix_users_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_users_id ON public.users USING btree (id);


--
-- Name: actions actions_prediction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.actions
    ADD CONSTRAINT actions_prediction_id_fkey FOREIGN KEY (prediction_id) REFERENCES public.predictions(id) ON DELETE SET NULL;


--
-- Name: actions actions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.actions
    ADD CONSTRAINT actions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: actions actions_verified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.actions
    ADD CONSTRAINT actions_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: mitras mitras_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mitras
    ADD CONSTRAINT mitras_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: mitras mitras_verified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mitras
    ADD CONSTRAINT mitras_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES public.users(id);


--
-- Name: predictions predictions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.predictions
    ADD CONSTRAINT predictions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_badges user_badges_badge_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_badges
    ADD CONSTRAINT user_badges_badge_id_fkey FOREIGN KEY (badge_id) REFERENCES public.badges(id) ON DELETE CASCADE;


--
-- Name: user_badges user_badges_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_badges
    ADD CONSTRAINT user_badges_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict xlBNCSxbieHhXT8HNpvjvesbcRH59lBS4Au2MclyHveH3BnMC1qihrlKvXoH946

