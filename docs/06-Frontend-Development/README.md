# Chapter 06 – Frontend Development

---

# Overview

This chapter focuses on designing and implementing the complete frontend architecture of CartWise.

The objective was to build a scalable, reusable, modern and production-ready frontend before integrating backend APIs.

Instead of directly connecting to a backend, the entire UI was built using mock data so that backend integration can happen independently in later chapters.

---

# Learning Objectives

After completing this chapter we can

- Build large React applications using Feature Based Architecture
- Design scalable reusable components
- Implement routing using React Router
- Build responsive ecommerce layouts
- Create reusable UI components
- Organize project folders professionally
- Create premium ecommerce interfaces
- Prepare frontend for backend integration

---

# Technologies Used

## Framework

- React 19

## Language

- TypeScript

## Build Tool

- Vite

## Styling

- Tailwind CSS v4

## Routing

- React Router DOM

## Icons

- Lucide React

## Version Control

- Git
- GitHub

---

# Project Structure

```
src/

├── assets/
├── components/
│
├── constants/
│
├── data/
│
├── features/
│
├── hooks/
│
├── lib/
│
├── pages/
│
├── routes/
│
├── services/
│
├── types/
│
└── utils/
```

---

# Feature Based Architecture

The application follows Feature Based Architecture.

Instead of placing every component inside one folder, every business feature owns its components.

```
features/

home/

compare/

product/

search/
```

Each feature contains

```
components/

hooks/

services/

types/

utils/

data/
```

Advantages

- Better scalability

- Better maintainability

- Independent development

- Easier backend integration

- Cleaner code organization

---

# Components

## Layout Components

```
Navbar

Footer

MainLayout

Container
```

Responsibilities

- Global layout

- Navigation

- Footer

- Shared wrappers

---

## Navbar

Implemented

- Logo

- Search Bar

- Navigation Links

- Category Strip

- User Actions

- Top Information Bar

Features

- Sticky

- Responsive

- Modern ecommerce styling

---

## Footer

Contains

- Company Information

- Navigation Links

- Social Links

- Copyright

- Modern design

---

# UI Components

Created reusable UI components.

```
Badge

Button

Card

Chip

EmptyState

ErrorState

GlassPanel

HeroBanner

Input

PriceTag

ProductCard

Rating

SectionHeading

Skeleton

StoreBadge
```

Purpose

Reusable across all features.

---

# Home Feature

The homepage is completely modular.

```
Hero

FlashDeals

AIPicks

BrandCollections

TrendingProducts

PriceDrops

RecentlyViewed

RecommendedProducts
```

---

# Hero Module

Contains

```
Hero

HeroBanner

HeroSearch

HeroStats

HeroCategories

FloatingProducts

OfferCard

TrendingSearches
```

Purpose

Provides

- Landing Experience

- Search

- Promotional Banner

- Product Discovery

---

# Search

Features

- Search Input

- Voice Search Button

- Image Search Placeholder

- Trending Searches

Prepared for future AI Search.

---

# Categories

Users can browse

- Smartphones

- Laptops

- Audio

- Wearables

- TVs

- Gaming

- Cameras

Designed similar to modern ecommerce applications.

---

# Product Cards

Reusable ProductCard component supports

- Product Image

- Placeholder Image

- Price

- Original Price

- Discount

- Rating

- Reviews

- AI Score

- Store

- Wishlist

- Compare

---

# Flash Deals

Implemented

- Discount Cards

- Countdown

- Price

- Store

- CTA

---

# AI Picks

Displays

- AI Recommendation

- Confidence Score

- AI Badge

- Recommendation Reason

Prepared for future AI Engine.

---

# Brand Collections

Displays

Popular Brands

Examples

Apple

Samsung

Sony

Dell

HP

Boat

JBL

---

# Trending Products

Displays

Trending Products

Rating

Discount

AI Score

Store

---

# Price Drops

Displays

Latest discounted products.

Prepared for backend API.

---

# Recently Viewed

Prepared UI.

Backend will provide user history.

---

# Recommended Products

Prepared UI.

Backend recommendation engine will replace mock data.

---

# Search Feature

Implemented

```
Search Page

Search Input

Filters

Sorting

Pagination

Cards

Empty State

Loading State

Error State
```

Prepared for API integration.

---

# Compare Feature

Implemented

```
Compare Hero

Price Comparison

Specification Comparison

Battery Comparison

Camera Comparison

Benchmark Comparison

Software Comparison

AI Summary

Winner Card

Winner Badge

Comparison Charts

Comparison Table

Store Comparison

Related Comparisons
```

Purpose

Provide premium product comparison experience.

---

# Product Feature

Implemented

```
Product Page

Gallery

Product Information

Specifications

Description

Breadcrumb

Related Products

Loading

Error State
```

Prepared for backend APIs.

---

# Routing

Implemented using React Router.

```
/

Home

/search

Search

/compare

Compare

/product/:id

Product

/wishlist

Wishlist

*
Not Found
```

---

# Design System

Created reusable constants

```
animation.ts

colors.ts

gradients.ts

radius.ts

shadows.ts

spacing.ts

typography.ts
```

Purpose

Maintain consistent UI across project.

---

# Styling

Tailwind CSS v4

Design principles

- Rounded Corners

- Soft Shadows

- Glassmorphism

- Premium Gradients

- Responsive Layout

- Modern Typography

- Hover Animations

---

# Reusability

Large emphasis on reusable components.

No duplicated UI.

Everything component driven.

---

# State Management

Current

Mock data.

Later

Backend APIs.

No business logic tightly coupled with UI.

---

# Images

Current

Placeholder images.

Image fallback support added.

Future

Backend will provide

```
imageUrl
```

Frontend will directly render

```
<img src={imageUrl} />
```

---

# Git

Completed

- Repository initialized

- Branch synchronization

- Commit history maintained

- GitHub integration

---

# Challenges Faced

- Feature folder restructuring

- Routing organization

- Duplicate components

- Responsive layout fixes

- Hero alignment debugging

- Placeholder image strategy

- Navbar redesign

- Component reuse

- Git merge synchronization

---

# Skills Learned

React Architecture

Component Design

Reusable UI

Routing

Tailwind CSS

TypeScript

Git

GitHub

Project Organization

Feature Based Architecture

Responsive Design

Modern Ecommerce UI

---

# Deliverables

Completed

- Home Page

- Compare Page

- Product Page

- Search Page

- Wishlist Page

- Navbar

- Footer

- UI Library

- Layout System

- Routing

- Design System

- Constants

- Feature Modules

---

# Pending

Backend Integration

Authentication

API Layer

Database

AI Engine

Recommendation System

Price Tracking

Wishlist Backend

Notifications

Admin Dashboard

Deployment

---

# Chapter Summary

This chapter transformed CartWise from an empty React project into a scalable, production-ready frontend application.

A feature-based architecture was implemented to ensure long-term maintainability. Reusable UI components, modular layouts, responsive pages, and a modern ecommerce interface were built while keeping the frontend completely independent of the backend.

The application is now fully prepared for backend integration, authentication, AI features, and real product data.

---

# Key Takeaways

✅ Production-ready React architecture

✅ Feature-based folder structure

✅ Modular component design

✅ Responsive ecommerce UI

✅ Modern Tailwind design system

✅ Git version control

✅ Reusable UI library

✅ Backend-ready frontend

---

# Next Chapter

Chapter 07

State Management & Backend API Integration

Topics

- React State Management

- Global State

- API Layer

- Axios

- Environment Variables

- Authentication Flow

- Backend Connectivity

- Data Fetching

- Error Handling

- Loading States

- Preparing CartWise for Spring Boot Integration
