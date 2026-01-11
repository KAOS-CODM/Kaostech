-- Supabase / PostgreSQL schema for Kaos Tech

-- Leads/Contacts table
create table if not exists leads (
    id serial primary key,
    name varchar(100) not null,
    email varchar(255) not null unique,
    phone varchar(20),
    company varchar(100),
    project_type varchar(50),
    budget_range varchar(50),
    message text,
    status varchar(50) default 'new',
    created_at timestamp default current_timestamp,
    source varchar(50) default 'website'
);

-- Portfolio projects
create table if not exists portfolio (
    id serial primary key,
    title varchar(200) not null,
    slug varchar(200) unique not null,
    category varchar(50),
    client_name varchar(100),
    project_date date,
    description text,
    technologies jsonb,
    features jsonb,
    live_url varchar(255),
    github_url varchar(255),
    image_url varchar(255),
    featured boolean default false,
    created_at timestamp default current_timestamp
);

-- Blog posts
create table if not exists blog_posts (
    id serial primary key,
    title varchar(200) not null,
    slug varchar(200) unique not null,
    excerpt text,
    content text,
    author varchar(100),
    category varchar(50),
    tags jsonb,
    featured_image varchar(255),
    published boolean default false,
    published_at timestamp null,
    views int default 0,
    created_at timestamp default current_timestamp
);

-- Testimonials
create table if not exists testimonials (
    id serial primary key,
    client_name varchar(100) not null,
    company varchar(100),
    project_type varchar(50),
    content text not null,
    rating int check (rating >= 1 and rating <= 5),
    approved boolean default false,
    featured boolean default false,
    created_at timestamp default current_timestamp
);

-- Admin users
create table if not exists admin_users (
    id serial primary key,
    username varchar(50) unique not null,
    email varchar(255) unique not null,
    password_hash varchar(255) not null,
    role varchar(50) default 'editor',
    created_at timestamp default current_timestamp
);
